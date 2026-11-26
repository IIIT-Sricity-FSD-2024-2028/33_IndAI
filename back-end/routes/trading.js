import { config } from '../config.js';
import { ensure } from '../db.js';
import { tradingAccess } from '../services/capital.js';
import { candles, quotes,marketState } from '../services/market.js';
import { catalogue,symbolPattern } from '../services/instruments.js';
import { account, cancel, cashReserved, order, reset, sharesReserved } from '../services/trading.js';
import { form, id, numeric, page, read, words, z } from '../validation.js';

const instrumentCode = z.string().regex(symbolPattern);
const paise = numeric(1,100000000);
const orderData = form({
  symbol:instrumentCode,clientKey:z.string().uuid(),side:z.enum(['buy','sell']),type:z.enum(['market','limit','stop-market','stop-limit']),
  qty:numeric(1,100000),price:paise.optional(),trigger:paise.optional(),sl:paise.optional(),tp:paise.optional(),validity:z.enum(['DAY','GTC'])
}).superRefine((data,ctx) => {
  for (const [key,needed] of [['price',['limit','stop-limit'].includes(data.type)],['trigger',data.type.startsWith('stop-')]]) {
    if (Boolean(data[key]) !== needed) ctx.addIssue({code:'custom',path:[key],message:needed ? 'Enter a positive price.' : 'This order type does not use this field.'});
  }
});
export function tradingRoutes(app,db,auth) {
  function access(req,res,next) { tradingAccess(db,req.user); next(); }
  app.use('/api/trading',auth,access);
  const instrument = raw => {
    const value = db.get('SELECT * FROM instruments WHERE symbol=?',read(instrumentCode,raw));
    ensure(value,404,'INSTRUMENT_NOT_FOUND','Instrument not found.');
    return value;
  };
  app.get('/api/trading/catalog',(req,res)=>{
    const rows=db.all('SELECT symbol,name FROM instruments ORDER BY symbol');
    res.json({exchange:'NSE',retrievedAt:catalogue.retrievedAt,count:rows.length,instruments:rows.map(row=>({...row,exchange:'NSE'}))});
  });
  app.get('/api/trading/quotes',async(req,res)=>{
    const symbols=[...new Set(read(z.array(instrumentCode).min(1).max(500),read(z.string().max(20500),req.query.symbols||'').split(',')))];
    const rows=symbols.map(instrument);
    const ticks=new Map((await quotes(rows)).map(tick=>[tick.symbol,tick]));
    res.json(rows.map(row=>({symbol:row.symbol,name:row.name,exchange:'NSE',quote:ticks.get(row.symbol)})));
  });
  app.get('/api/trading/instruments',async (req,res) => {
    const pattern = '%' + read(z.string().trim().max(60),req.query.q || '') + '%';
    const rows = db.all('SELECT * FROM instruments WHERE symbol LIKE ? OR name LIKE ? ORDER BY symbol LIMIT 50',pattern,pattern);
    const ticks = new Map((await quotes(rows)).map(tick => [tick.symbol,tick]));
    res.json(rows.map(row => ({ symbol:row.symbol,name:row.name,exchange:'NSE',quote:ticks.get(row.symbol) })));
  });
  app.get('/api/trading/instruments/:symbol',async (req,res) => {
    const row = instrument(req.params.symbol);
    const [tick] = await quotes([row]);
    res.json({ symbol:row.symbol,name:row.name,exchange:'NSE',quote:tick });
  });
  app.get('/api/trading/instruments/:symbol/candles',async (req,res) => {
    const now=Date.now();
    res.json({source:config.provider,...await marketState(),candles:await candles(instrument(req.params.symbol),req.query.range||'1D',now)});
  });
  app.get('/api/trading/account',async (req,res) => {
    const user = req.user.id;
    const { cash,funded } = db.tx(() => account(db,user));
    const reservedCash = cashReserved(db,user);
    const positions = db.all('SELECT p.*,i.name,i.provider_key,i.base FROM positions p JOIN instruments i ON i.symbol=p.symbol WHERE p.user_id=? AND p.qty>0 ORDER BY p.symbol',user)
      .map(row => ({ ...row, sellable:row.qty - sharesReserved(db,user,row.symbol) }));
    const ticks = new Map((await quotes(positions)).map(tick => [tick.symbol,tick]));
    res.json({ cash,funded,reservedCash,available:cash-reservedCash,positions:positions.map(({provider_key,base,...row}) => ({ ...row,quote:ticks.get(row.symbol) })) });
  });
  app.get('/api/trading/orders',(req,res) => {
    const isWorking = req.query.working === 'true';
    res.json(db.all(`SELECT o.*,e.price fill_price,e.fee,e.realized,e.created filled_at FROM orders o LEFT JOIN executions e ON e.order_id=o.id
      WHERE o.user_id=? AND (?=0 OR o.state IN ('open','pending')) ORDER BY o.id DESC LIMIT 25 OFFSET ?`,
      req.user.id,Number(isWorking),page(req.query.page)*25));
  });
  app.post('/api/trading/orders',async (req,res) => {
    const data = read(orderData,req.body);
    const selected = instrument(data.symbol);
    const [tick] = await quotes([selected]);
    tradingAccess(db,db.get('SELECT * FROM users WHERE id=?',req.user.id));
    res.status(201).json(order(db,req.user.id,data,tick));
  });
  app.post('/api/trading/orders/:id/cancel',(req,res) => {
    cancel(db,req.user.id,read(id,req.params.id)); res.json({ ok:true });
  });
  app.post('/api/trading/reset',(req,res) => {
    read(form({ confirm:z.literal('RESET PAPER ACCOUNT') }),req.body);
    reset(db,req.user.id); res.json({ ok:true });
  });
  app.get('/api/trading/ledger',(req,res) => res.json(db.all('SELECT * FROM ledger WHERE user_id=? ORDER BY id DESC LIMIT 25 OFFSET ?',req.user.id,page(req.query.page)*25)));
  app.get('/api/trading/watchlists',(req,res) => {
    const items = db.all('SELECT * FROM watchlists WHERE user_id=? ORDER BY id',req.user.id);
    res.json(items.map(item => ({ id:item.id,name:item.name,symbols:db.all('SELECT symbol FROM watchlist_items WHERE list=? ORDER BY position',item.id).map(row => row.symbol) })));
  });
  app.post('/api/trading/watchlists',(req,res) => {
    const { name } = read(form({ name:words(50) }),req.body);
    const list = db.tx(() => {
      ensure(db.get('SELECT count(*) n FROM watchlists WHERE user_id=?',req.user.id).n < 12,409,'LIST_LIMIT','You can create up to 12 watchlists.');
      ensure(!db.get('SELECT 1 FROM watchlists WHERE user_id=? AND name=?',req.user.id,name),409,'LIST_NAME_USED','Use a unique watchlist name.');
      return db.run('INSERT INTO watchlists(user_id,name) VALUES (?,?)',req.user.id,name).lastInsertRowid;
    });
    res.status(201).json({ id:list });
  });
  const owned = req => {
    const item = db.get('SELECT * FROM watchlists WHERE id=? AND user_id=?',read(id,req.params.id),req.user.id);
    ensure(item,404,'LIST_NOT_FOUND','Watchlist not found.');
    return item;
  };
  app.put('/api/trading/watchlists/:id',(req,res) => {
    const item = owned(req);
    const { name,symbols } = read(form({ name:words(50),symbols:z.array(instrumentCode).max(40).refine(values => new Set(values).size === values.length,'Duplicate instruments are invalid.') }),req.body);
    symbols.forEach(instrument);
    db.tx(() => {
      ensure(!db.get('SELECT 1 FROM watchlists WHERE user_id=? AND name=? AND id<>?',req.user.id,name,item.id),409,'LIST_NAME_USED','Use a unique watchlist name.');
      db.run('UPDATE watchlists SET name=? WHERE id=?',name,item.id);
      db.run('DELETE FROM watchlist_items WHERE list=?',item.id);
      symbols.forEach((symbol,index) => db.run('INSERT INTO watchlist_items VALUES (?,?,?)',item.id,symbol,index));
    });
    res.json({ ok:true });
  });
  app.delete('/api/trading/watchlists/:id',(req,res) => {
    db.run('DELETE FROM watchlists WHERE id=?',owned(req).id);
    res.json({ ok:true });
  });
  app.get('/api/trading/journal',(req,res) => res.json(db.all('SELECT * FROM journal WHERE user_id=? ORDER BY id DESC LIMIT 25 OFFSET ?',req.user.id,page(req.query.page)*25)));
  app.post('/api/trading/journal',(req,res) => {
    const data = read(form({ tag:words(50),body:words(4000,5),order:id.optional() }),req.body);
    if (data.order) ensure(db.get('SELECT 1 FROM orders WHERE id=? AND user_id=?',data.order,req.user.id),404,'ORDER_NOT_FOUND','Order not found.');
    const result = db.run('INSERT INTO journal(user_id,order_id,tag,body,created) VALUES (?,?,?,?,?)',req.user.id,data.order ?? null,data.tag,data.body,Date.now());
    res.status(201).json({ id:result.lastInsertRowid });
  });
}
