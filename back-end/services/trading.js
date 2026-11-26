import { config } from '../config.js';
import { DAY, ensure, log, notify } from '../db.js';
import { quotes } from './market.js';
import { syncCapital,startingCapital } from './capital.js';

const working = "state IN ('pending','open')";
export const fee = gross => Math.max(1, Math.ceil(gross / 1000));
export function account(db, user, now = Date.now()) {
  return syncCapital(db,user,now);
}
export const holdings = (db,user,symbol) => db.get('SELECT * FROM positions WHERE user_id=? AND symbol=?',user,symbol) || { qty:0,cost:0 };
export function cashReserved(db,user,ignore=0) {
  return db.get(`SELECT coalesce(sum(hold),0) total FROM orders WHERE user_id=? AND side='buy' AND ${working} AND id<>?`,user,ignore).total;
}
export function sharesReserved(db,user,symbol) {
  return db.get(`SELECT coalesce(sum(reserved),0) total FROM (SELECT max(qty) reserved FROM orders WHERE user_id=? AND symbol=? AND side='sell' AND ${working} GROUP BY coalesce(oco,-id))`,user,symbol).total;
}
const priceWithin = (side, quote, limit) => side === 'buy' ? quote <= limit : quote >= limit;
const triggerHit = (side, quote, trigger) => side === 'buy' ? quote >= trigger : quote <= trigger;
const setFinal = (db,row,state,reason) => {
  db.run('UPDATE orders SET state=?,reason=?,hold=0 WHERE id=?',state,reason,row.id);
  log(db,row.user_id,'order.'+state,row.id,{symbol:row.symbol,reason});
};
function protect(db,row,price,now) {
  if (!row.sl && !row.tp) return;
  if ((row.sl && row.sl >= price) || (row.tp && row.tp <= price)) {
    notify(db,row.user_id,'Buy filled outside the requested protection prices. Add protection from the position.', '/trading');
    return;
  }
  const insert = (type,limit,trigger) => db.run(`INSERT INTO orders(user_id,symbol,side,type,qty,price,trigger,oco,session,state,created,expires,feed_mode,replay_day)
    VALUES (?,?,'sell',?,?,?,?,?,?,'open',?,?,?,?)`,row.user_id,row.symbol,type,row.qty,limit,trigger,row.id,row.session,now,now+30*DAY,row.feed_mode||'live',row.replay_day??null);
  if (row.sl) insert('stop-market',null,row.sl);
  if (row.tp) insert('limit',row.tp,null);
}
export function matchOrder(db,row,tick,now=Date.now()) {
  if (!['open','pending'].includes(row.state)) return;
  if (row.expires <= now) {
    setFinal(db,row,'expired','Order validity ended');
    notify(db,row.user_id,'Order #' + row.id + ' expired.', '/trading');
    return;
  }
  if (!tick?.executable || tick.source !== row.session) return;
  if((row.feed_mode||'live')!==(tick.mode==='replay'?'replay':'live') || (row.feed_mode==='replay'&&row.replay_day!==tick.replayDay))return;
  const price = tick.price;
  if (row.trigger && !row.triggered) {
    if (!triggerHit(row.side, price, row.trigger)) return;
    db.run("UPDATE orders SET triggered=?,state='open' WHERE id=?",now,row.id);
  }
  if (row.price && !priceWithin(row.side,price,row.price)) return;
  const gross = row.qty*price, charge = fee(gross);
  const acc = account(db,row.user_id,now);
  const holding = holdings(db,row.user_id,row.symbol);
  const buy = row.side === 'buy';
  const delta = buy ? -gross-charge : gross-charge;
  if ((buy && acc.cash-cashReserved(db,row.user_id,row.id) < -delta) || (!buy && holding.qty < row.qty)) {
    setFinal(db,row,'rejected',buy ? 'Insufficient paper cash at fill price' : 'Insufficient shares at fill');
    notify(db,row.user_id,'Order #' + row.id + ' was rejected at execution.', '/trading');
    return;
  }
  const costSold = buy ? 0 : row.qty === holding.qty ? holding.cost : Number(BigInt(holding.cost)*BigInt(row.qty)/BigInt(holding.qty));
  const updatedCost = buy ? holding.cost-delta : holding.cost-costSold;
  const updatedQty = holding.qty + (buy ? row.qty : -row.qty);
  db.run('INSERT INTO positions VALUES (?,?,?,?) ON CONFLICT(user_id,symbol) DO UPDATE SET qty=excluded.qty,cost=excluded.cost',
    row.user_id,row.symbol,updatedQty,updatedCost);
  db.run('UPDATE accounts SET cash=? WHERE user_id=?',acc.cash+delta,row.user_id);
  db.run('INSERT INTO executions VALUES (?,?,?,?,?)',row.id,price,charge,buy ? 0 : delta-costSold,now);
  db.run('INSERT INTO ledger(user_id,order_id,delta,balance,reason,created) VALUES (?,?,?,?,?,?)',
    row.user_id,row.id,delta,acc.cash+delta,buy ? 'Paper buy' : 'Paper sell',now);
  setFinal(db,row,'filled',null);
  if (row.oco) db.run(`UPDATE orders SET state='canceled',reason='Linked exit filled',hold=0 WHERE oco=? AND id<>? AND ${working}`,row.oco,row.id);
  if (buy) protect(db,row,price,now);
  notify(db,row.user_id,'Paper order #' + row.id + ' filled.', '/trading');
}
export function order(db,user,data,tick,source=config.provider,now=Date.now()) {
  return db.tx(() => {
    const previous = db.get('SELECT * FROM orders WHERE user_id=? AND client_key=?',user,data.clientKey);
    if (previous) return previous;
    const acc = account(db,user,now);
    ensure(tick?.executable && tick.source === source,409,'QUOTE_UNAVAILABLE','A fresh executable quote is required. Check the quote and session status.');
    const reference = data.price || data.trigger || tick.price;
    ensure(!data.sl || data.side === 'buy' && data.sl < reference,422,'INVALID_STOP_LOSS','Stop-loss must be below the buy reference price.');
    ensure(!data.tp || data.side === 'buy' && data.tp > reference,422,'INVALID_TAKE_PROFIT','Take-profit must be above the buy reference price.');
    if (data.type === 'stop-limit') ensure(data.side === 'buy' ? data.price >= data.trigger : data.price <= data.trigger,422,'INVALID_STOP_LIMIT','For buy orders the limit must be at or above the trigger. For sells it must be at or below.');
    const reservePrice = data.type === 'stop-market' ? Math.max(data.trigger,tick.price) : reference;
    const gross = reservePrice * data.qty;
    const hold = data.side === 'buy' ? gross + fee(gross) : 0;
    if (data.side === 'buy') ensure(acc.cash-cashReserved(db,user) >= hold,409,'INSUFFICIENT_CASH','Available paper cash is insufficient.');
    else ensure(holdings(db,user,data.symbol).qty-sharesReserved(db,user,data.symbol) >= data.qty,409,'INSUFFICIENT_SHARES','Available shares are insufficient. Cancel protection or other sell orders to release shares.');
    const result = db.run(`INSERT INTO orders(user_id,symbol,client_key,side,type,qty,price,trigger,sl,tp,session,state,hold,created,expires,feed_mode,replay_day)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,user,data.symbol,data.clientKey,data.side,data.type,data.qty,data.price ?? null,
      data.trigger ?? null,data.sl ?? null,data.tp ?? null,source,data.trigger ? 'pending' : 'open',hold,now,now+(data.validity === 'GTC' ? 30*DAY : DAY),tick.mode==='replay'?'replay':'live',tick.replayDay??null);
    const row = db.get('SELECT * FROM orders WHERE id=?',result.lastInsertRowid);
    matchOrder(db,row,tick,now);
    return db.get('SELECT * FROM orders WHERE id=?',row.id);
  });
}
export function cancel(db,user,id) {
  db.tx(() => {
    const row = db.get(`SELECT * FROM orders WHERE id=? AND user_id=? AND ${working}`,id,user);
    ensure(row,404,'ORDER_NOT_OPEN','Working order not found.');
    if (row.oco) db.run(`UPDATE orders SET state='canceled',reason='Protection canceled',hold=0 WHERE oco=? AND ${working}`,row.oco);
    else setFinal(db,row,'canceled','Canceled by learner');
    notify(db,user,'Paper order #' + id + ' canceled.', '/trading');
  });
}
export function reset(db,user) {
  db.tx(() => {
    const acc = account(db,user);
    db.run(`UPDATE orders SET state='canceled',reason='Account reset',hold=0 WHERE user_id=? AND ${working}`,user);
    db.run('DELETE FROM positions WHERE user_id=?',user);
    const funding = Math.max(acc.funded,startingCapital(db,user));
    const awards = db.get('SELECT coalesce(sum(amount),0) total FROM capital_awards WHERE student=?',user).total;
    const restored = funding + awards;
    db.run('UPDATE accounts SET cash=?,funded=? WHERE user_id=?',restored,funding,user);
    db.run("INSERT INTO ledger(user_id,delta,balance,reason,created) VALUES (?,?,?,'Account reset',?)",
      user,restored-acc.cash,restored,Date.now());
    log(db,user,'paper.reset',user);
  });
}
export async function processOrders(db) {
  const rows = db.all(`SELECT i.* FROM instruments i WHERE EXISTS (SELECT 1 FROM orders o WHERE o.symbol=i.symbol AND o.session=? AND o.${working})`,config.provider);
  const ticks = new Map((await quotes(rows)).map(tick => [tick.symbol,tick]));
  const now = Date.now();
  db.tx(() => {
    db.run(`UPDATE orders SET state='canceled',hold=0,reason='Market source changed' WHERE session<>? AND ${working}`,config.provider);
    for (const { id } of db.all(`SELECT id FROM orders WHERE session=? AND ${working} ORDER BY id`,config.provider)) {
      const row = db.get('SELECT * FROM orders WHERE id=?',id);
      const tick=ticks.get(row.symbol);
      if(row.feed_mode==='replay'&&tick?.executable&&(tick.mode!=='replay'||row.replay_day!==tick.replayDay)){
        setFinal(db,row,'canceled','Historical replay session ended');
        notify(db,row.user_id,'Replay order #'+row.id+' canceled because its historical session ended.','/trading');
      }else matchOrder(db,row,tick,now);
    }
  });
}
