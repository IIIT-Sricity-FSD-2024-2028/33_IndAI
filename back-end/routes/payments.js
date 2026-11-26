import express from 'express';
import { config } from '../config.js';
import { ensure, log } from '../db.js';
import { admin, student } from '../services/access.js';
import { capture, hasRazorpay, paymentOverview, razorpay, refund, validSignature } from '../services/payments.js';
import { form, id, read, words, z } from '../validation.js';

const paidPlan = z.enum(['pro','plus']);
export function paymentWebhook(app, db) {
  app.post('/api/payments/webhook', express.raw({ type:'application/json', limit:'128kb' }), (req, res) => {
    ensure(Buffer.isBuffer(req.body) && validSignature(config.webhookSecret, req.body, req.get('x-razorpay-signature')), 401, 'BAD_SIGNATURE', 'Invalid webhook signature.');
    const eventId = req.get('x-razorpay-event-id');
    ensure(eventId && eventId.length <= 200, 422, 'EVENT_ID_REQUIRED', 'The provider event ID is required.');
    let event;
    try { event = JSON.parse(req.body); } catch { ensure(false, 422, 'INVALID_EVENT', 'Invalid webhook payload.'); }
    db.tx(() => {
      if (!db.run('INSERT OR IGNORE INTO webhook_events VALUES (?,?)', eventId, Date.now()).changes) return;
      const payment = event.payload?.payment?.entity;
      if (event.event === 'payment.captured' && payment) {
        const local = db.get("SELECT * FROM payments WHERE provider='razorpay' AND provider_order=?", payment.order_id);
        if (local) capture(db, local, { ...payment, provider:'razorpay' });
      }
      if (['refund.created','refund.processed','refund.failed'].includes(event.event)) {
        const entity = event.payload?.refund?.entity;
        if (!entity) return;
        const local = db.get("SELECT * FROM payments WHERE provider='razorpay' AND (provider_payment=? OR provider_order=?)",
          entity.payment_id ?? '', payment?.order_id ?? '');
        if (!local) ensure(false, 503, 'WAITING_FOR_CAPTURE', 'Payment has not been matched. Retry this event.');
        if (local.provider_payment) ensure(local.provider_payment === entity.payment_id, 409, 'REFUND_MISMATCH', 'Refund payment does not match.');
        refund(db, local, { ...entity, status: event.event.split('.')[1] === 'created' ? 'pending' : event.event.split('.')[1] });
      }
    });
    res.json({ ok:true });
  });
}
export function paymentRoutes(app, db, auth) {
  const orderRequests = new Map();
  function getProviderOrder(row) {
    const existing = orderRequests.get(row.id);
    if (existing) return existing;
    const pending = (async () => {
      const receipt = 'indai-' + row.id;
      const items = await razorpay('orders?count=25&receipt=' + receipt);
      const remote = items.items?.find(item => item.receipt === receipt) ||
        await razorpay('orders', { amount:row.amount, currency:'INR', receipt });
      ensure(remote.amount === row.amount && remote.currency === 'INR', 409, 'PAYMENT_MISMATCH', 'The provider order does not match the checkout.');
      db.run('UPDATE payments SET provider_order=? WHERE id=? AND provider_order IS NULL', remote.id, row.id);
      return db.get('SELECT provider_order FROM payments WHERE id=?',row.id).provider_order;
    })().finally(()=>orderRequests.delete(row.id));
    orderRequests.set(row.id,pending);
    return pending;
  }
  const owns = (req, paymentId) => db.get('SELECT * FROM payments WHERE id=? AND student=?', paymentId, req.user.id);
  const requireStudent = (req, res, next) => { student(db, req.user); next(); };
  app.get('/api/plans', auth, requireStudent, (req, res) => res.json(paymentOverview(db, req.user.id)));
  app.post('/api/payments', auth, requireStudent, async (req, res) => {
    const data = read(form({ plan: paidPlan, provider: z.enum(['demo','razorpay']) }), req.body);
    ensure(data.provider !== 'demo' || config.demo, 404, 'UNAVAILABLE', 'Simulated checkout is unavailable.');
    ensure(data.provider !== 'razorpay' || hasRazorpay, 503, 'PAYMENTS_UNCONFIGURED', 'Razorpay checkout is unconfigured.');
    const amount = config.prices[data.plan];
    ensure(amount > 0, 503, 'PRICE_UNCONFIGURED', 'The selected plan has no configured price.');
    const row = db.tx(() => {
      const pending = db.get("SELECT * FROM payments WHERE student=? AND status='pending'", req.user.id);
      if (pending) {
        ensure(pending.plan === data.plan && pending.provider === data.provider, 409, 'CHECKOUT_PENDING', 'Complete or reconcile your existing checkout first.');
        return pending;
      }
      ensure(!db.get("SELECT 1 FROM subscriptions WHERE student=? AND starts>? AND state='active'", req.user.id, Date.now()), 409, 'RENEWAL_SCHEDULED', 'You already have a scheduled term.');
      const result = db.run("INSERT INTO payments(student,plan,amount,provider,status,created) VALUES (?,?,?,?,'pending',?)", req.user.id, data.plan, amount, data.provider, Date.now());
      return owns(req, result.lastInsertRowid);
    });
    let order = row.provider_order;
    if (!order && data.provider === 'razorpay') {
      order = await getProviderOrder(row);
    } else if (!order) {
      order = 'demo-' + row.id;
      db.run('UPDATE payments SET provider_order=? WHERE id=?', order, row.id);
    }
    res.status(201).json({ id:row.id, order, amount:row.amount, key: data.provider === 'razorpay' ? config.keyId : undefined });
  });
  app.post('/api/payments/:id/demo', auth, requireStudent, (req, res) => {
    ensure(config.demo, 404, 'UNAVAILABLE', 'Simulated checkout is unavailable.');
    const paymentId = read(id, req.params.id);
    db.tx(() => {
      const local = owns(req, paymentId);
      ensure(local?.provider === 'demo' && local.provider_order, 404, 'CHECKOUT_NOT_FOUND', 'Checkout not found.');
      capture(db, local, { id:'demo-pay-' + local.id, order_id:local.provider_order, status:'captured', amount:local.amount, currency:'INR', provider:'demo' });
    });
    res.json({ ok:true });
  });
  app.post('/api/payments/:id/reconcile', auth, requireStudent, async (req, res) => {
    const local = owns(req, read(id, req.params.id));
    ensure(local?.provider === 'razorpay' && local.provider_order, 404, 'CHECKOUT_NOT_FOUND', 'Checkout not found.');
    const data = read(form({ payment:words(100).regex(/^pay_[a-zA-Z0-9]+$/).optional(), signature:words(64).regex(/^[a-f0-9]{64}$/).optional() }), req.body);
    if (data.payment || data.signature) ensure(data.payment && validSignature(config.keySecret, local.provider_order + '|' + data.payment, data.signature), 401, 'BAD_SIGNATURE', 'Invalid checkout signature.');
    const remote = data.payment ? await razorpay('payments/' + data.payment) :
      (await razorpay('orders/' + encodeURIComponent(local.provider_order) + '/payments')).items?.find(item => item.status === 'captured');
    ensure(remote, 409, 'PAYMENT_PENDING', 'No captured payment is available yet.');
    db.tx(() => capture(db, owns(req, local.id), { ...remote, provider:'razorpay' }));
    res.json({ ok:true });
  });
  app.post('/api/payments/:id/discard-demo', auth, requireStudent, (req, res) => {
    ensure(config.demo, 404, 'UNAVAILABLE', 'Simulated checkout is unavailable.');
    db.run("UPDATE payments SET status='canceled' WHERE id=? AND student=? AND provider='demo' AND status='pending'", read(id, req.params.id), req.user.id);
    res.json({ ok:true });
  });
  app.post('/api/plans/:id/end-renewal', auth, requireStudent, (req, res) => {
    const result = db.run("UPDATE subscriptions SET state='canceled' WHERE id=? AND student=? AND state='active' AND starts<=? AND ends>?", read(id, req.params.id), req.user.id, Date.now(), Date.now());
    ensure(result.changes, 409, 'TERM_UNAVAILABLE', 'This term is no longer active.');
    res.json({ ok:true });
  });
  app.post('/api/admin/payments/:id/refund', auth, async (req, res) => {
    admin(req.user);
    const payment = db.get("SELECT * FROM payments WHERE id=? AND provider='razorpay' AND status='captured'", read(id, req.params.id));
    ensure(payment, 404, 'PAYMENT_NOT_FOUND', 'Captured Razorpay payment not found.');
    const { reason } = read(form({ reason:words(400, 5) }), req.body);
    const requestId = 'requested-' + payment.id;
    const reserved = db.tx(() => {
      const prior = db.get("SELECT 1 FROM refunds WHERE payment=? AND state IN ('requested','pending','processed')", payment.id);
      ensure(!prior, 409, 'REFUND_EXISTS', 'This payment already has a refund record. Reconcile with Razorpay.');
      db.run('INSERT INTO refunds VALUES (?,?,?,?,?)', requestId, payment.id, payment.amount, 'requested', Date.now());
      log(db, req.user.id, 'payment.refund_requested', payment.id, { reason });
      return requestId;
    });
    const remote = await razorpay('payments/' + encodeURIComponent(payment.provider_payment) + '/refund', { amount:payment.amount, notes:{ reference:reserved } });
    db.tx(() => {
      refund(db, db.get('SELECT * FROM payments WHERE id=?', payment.id), remote);
      db.run('DELETE FROM refunds WHERE id=?', requestId);
    });
    res.json({ ok:true });
  });
}
