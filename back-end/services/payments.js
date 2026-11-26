import { createHmac } from 'node:crypto';
import { config } from '../config.js';
import { DAY, ensure, notify } from '../db.js';
import { equal } from './auth.js';
import { plan, reconcileGuidance } from './access.js';

export const hasRazorpay = Boolean(config.keyId && config.keySecret && config.webhookSecret);
export const signature = (secret, value) => createHmac('sha256', secret).update(value).digest('hex');
export const validSignature = (secret, value, claimed) => Boolean(secret && equal(signature(secret, value), claimed));
export async function razorpay(path, body) {
  ensure(hasRazorpay, 503, 'PAYMENTS_UNCONFIGURED', 'Razorpay checkout is unconfigured.');
  const result = await fetch('https://api.razorpay.com/v1/' + path, {
    method: body ? 'POST' : 'GET', signal: AbortSignal.timeout(8000),
    headers: { Authorization: 'Basic ' + Buffer.from(config.keyId + ':' + config.keySecret).toString('base64'), 'Content-Type':'application/json' },
    body: body ? JSON.stringify(body) : undefined
  }).catch(() => null);
  ensure(result?.ok, 502, 'PAYMENT_PROVIDER_UNAVAILABLE', 'Razorpay could not complete the request. Retry or reconcile from plan settings.');
  return result.json();
}
export function capture(db, local, remote, now = Date.now()) {
  ensure(local && remote.status === 'captured' && local.provider_order === remote.order_id &&
    local.provider === remote.provider && local.amount === remote.amount && remote.currency === 'INR',
    409, 'PAYMENT_NOT_CONFIRMED', 'A verified captured payment for this order is required.');
  if (local.status !== 'pending') {
    ensure(local.provider_payment === remote.id, 409, 'PAYMENT_MISMATCH', 'The order already has a payment.');
    return;
  }
  const latest = db.get("SELECT max(ends) ends FROM subscriptions WHERE student=? AND state IN ('active','canceled')", local.student)?.ends ?? now;
  const start = Math.max(now, latest);
  const refunded = db.get("SELECT coalesce(sum(amount),0) amount FROM refunds WHERE payment=? AND state='processed'", local.id).amount;
  db.run('UPDATE payments SET status=?,provider_payment=? WHERE id=?', refunded >= local.amount ? 'refunded' : 'captured', remote.id, local.id);
  if (refunded < local.amount) {
    db.run("INSERT INTO subscriptions(student,plan,starts,ends,state,payment) VALUES (?,?,?,?,'active',?)", local.student, local.plan, start, start + 30 * DAY, local.id);
    notify(db, local.student, `Payment confirmed. ${local.plan.toUpperCase()} ${start === now ? 'is active' : 'is scheduled'}.`, '/plans');
  }
}
export function refund(db, local, remote) {
  if (!local || !remote?.id || !Number.isSafeInteger(remote.amount) || remote.amount < 1 || remote.amount > local.amount) return;
  const existing = db.get('SELECT state FROM refunds WHERE id=?', remote.id);
  if (existing?.state === 'processed' || (existing?.state === 'failed' && remote.status === 'pending')) return;
  db.run(`INSERT INTO refunds VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,updated=excluded.updated`,
    remote.id, local.id, remote.amount, remote.status, Date.now());
  if (db.get("SELECT coalesce(sum(amount),0) amount FROM refunds WHERE payment=? AND state='processed'", local.id).amount < local.amount) return;
  if (local.status === 'captured') db.run("UPDATE payments SET status='refunded' WHERE id=?", local.id);
  db.run("UPDATE subscriptions SET state='refunded' WHERE payment=?", local.id);
  reconcileGuidance(db);
  notify(db, local.student, 'Your payment was fully refunded. Its plan access has ended.', '/plans');
}
export function paymentOverview(db, student) {
  const now = Date.now();
  return { current: plan(db, student, now) || null, scheduled: db.all("SELECT * FROM subscriptions WHERE student=? AND state='active' AND starts>? ORDER BY starts", student, now),
    payments: db.all('SELECT id,plan,amount,provider,status,created FROM payments WHERE student=? ORDER BY id DESC LIMIT 25', student),
    refunds: db.all('SELECT r.* FROM refunds r JOIN payments p ON p.id=r.payment WHERE p.student=? ORDER BY r.updated DESC LIMIT 25', student),
    prices: config.prices, demo: config.demo, live: hasRazorpay };
}
