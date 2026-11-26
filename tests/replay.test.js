import {test,expect,vi} from 'vitest';
import {latestSession,replayFrame,replayQuote} from '../back-end/services/replay.js';
import {quotes,candles} from '../back-end/services/market.js';
import {config} from '../back-end/config.js';
import {openDatabase} from '../back-end/db.js';
import {installInstruments} from '../back-end/services/instruments.js';
import {order,matchOrder,processOrders} from '../back-end/services/trading.js';
import {intradayBars,chartTimeLabel} from '../frontend/src/hooks/chartData.js';
const raw=(price=100)=>[
 ['2026-11-20T09:15:00+05:30',price,price+2,price-1,price+1],
 ['2026-11-23T09:15:00+05:30',price+3,price+5,price+2,price+4],
 ['2026-11-23T09:20:00+05:30',price+4,price+8,price+3,price+7],
 ['2026-11-23T09:25:00+05:30',price+7,price+10,price+5,price+6]
];
const time=Date.parse('2026-11-23T20:00:00+05:30');
test('replay loops the most recent valid session and exposes only the bars reached',()=>{
 const session=latestSession([...raw().reverse(),['bad',1,2,1,2]],time);
 expect(session.day).toBe('2026-11-23');expect(session.bars).toHaveLength(3);
 const a=replayFrame(session,time,time,2000),b=replayFrame(session,time+2000,time,2000),loop=replayFrame(session,time+6000,time,2000);
 expect(chartTimeLabel(session.bars[0].time)).toBe('09:15');
 expect(a.visible).toHaveLength(1);expect(b.visible).toHaveLength(2);expect(a.bar.close).not.toBe(b.bar.close);expect(loop.bar).toEqual(a.bar);expect(loop.cycle).toBe(1);
 expect(()=>latestSession([],time)).toThrow(/No recent historical/);
 const sparse=[raw()[0],['2026-11-20T09:20:00+05:30',101,104,100,103],raw()[1]];
 expect(latestSession(sparse,time).day).toBe('2026-11-20');
});
test('each instrument uses its own history and a missing stock never borrows another stock series',async()=>{
 const load=vi.fn(async path=>({candles:path.includes('STOCK_A')?raw(100):path.includes('STOCK_B')?raw(500):[]}));
 const a=await replayQuote({symbol:'A',provider_key:'STOCK_A'},time,time,load);
 const b=await replayQuote({symbol:'B',provider_key:'STOCK_B'},time,time,load);
 const missing=await replayQuote({symbol:'C',provider_key:'STOCK_C'},time,time,load);
 expect(a.price).toBe(10400);expect(b.price).toBe(50400);expect(a.replayDay).toBe(b.replayDay);expect(a.recordedTime).not.toBe(a.time);
 expect(missing).toMatchObject({executable:false,price:null,status:'unavailable'});
});
test('chart playback stays on the quote frame, handles loop restart and appends a newly reached recorded bar',()=>{
 const session=latestSession(raw(),time);const bar=session.bars[0];
 const result=intradayBars(session.bars,{executable:true,mode:'replay',replayDay:session.day,replayBar:bar});
 expect(result).toEqual([bar]);expect(intradayBars([],{executable:true,mode:'replay',replayDay:session.day,replayBar:bar})).toEqual([bar]);
});
test('closed-market replay changes back to live, and order protection cannot cross feed modes or recorded days',async()=>{
 const old={provider:config.provider,marketAccess:config.marketAccess,analytics:config.analytics};
 config.provider='upstox';config.marketAccess='mock-token';config.analytics='mock-token';
 vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(time);let status='CLOSING_END';
 vi.stubGlobal('fetch',vi.fn(async url=>{
  if(url.includes('/market/status/'))return Response.json({data:{status}});
  if(url.includes('/historical-candle/'))return Response.json({data:{candles:raw()}});
  return Response.json({data:{A:{instrument_token:'NSE_EQ|INE002A01018',last_price:110,timestamp:new Date().toISOString()}}});
 }));
 const db=openDatabase(':memory:');installInstruments(db);const row=db.get("SELECT * FROM instruments WHERE symbol='RELIANCE'");
 const user=Number(db.run("INSERT INTO users(email,name,password,role,status) VALUES ('replay@test.invalid','Replay learner','hash','student','approved')").lastInsertRowid);
 try{
  const [replay]=await quotes([row],time);expect(replay.mode).toBe('replay');expect(replay.source).toBe('upstox');
  const chart=await candles(row,'1D',time);expect(chart.at(-1).close*100).toBe(replay.price);
  const buy=order(db,user,{symbol:row.symbol,clientKey:crypto.randomUUID(),side:'buy',type:'market',qty:2,validity:'DAY',sl:replay.price-100,tp:replay.price+100},replay);
  expect(buy).toMatchObject({state:'filled',feed_mode:'replay',replay_day:replay.replayDay});
  const exits=db.all('SELECT * FROM orders WHERE oco=?',buy.id);expect(exits).toHaveLength(2);expect(exits.every(row=>row.feed_mode==='replay'&&row.replay_day===replay.replayDay)).toBe(true);
  const exit=exits[0];
  matchOrder(db,exit,{...replay,price:exit.trigger-10,mode:'live'},time);expect(db.get('SELECT state FROM orders WHERE id=?',exit.id).state).toBe('open');
  matchOrder(db,exit,{...replay,price:exit.trigger-10,replayDay:'2026-11-20'},time);expect(db.get('SELECT state FROM orders WHERE id=?',exit.id).state).toBe('open');
  const liveOrder=order(db,user,{symbol:row.symbol,clientKey:crypto.randomUUID(),side:'buy',type:'limit',price:9000,qty:1,validity:'DAY'},{...replay,mode:'live',replayDay:undefined,price:11000});
  matchOrder(db,liveOrder,{...replay,price:8000},time);expect(db.get('SELECT state FROM orders WHERE id=?',liveOrder.id).state).toBe('open');
  status='NORMAL_OPEN';vi.setSystemTime(time+21000);
  const [live]=await quotes([row],time+21000);expect(live).toMatchObject({mode:'live',status:'live',executable:true,price:11000});
  await processOrders(db);expect(db.get('SELECT state FROM orders WHERE id=?',exit.id).state).toBe('canceled');
  status='UNKNOWN';vi.setSystemTime(time+42000);
  const [unknown]=await quotes([row],time+42000);expect(unknown).toMatchObject({status:'unavailable',executable:false,mode:'live'});
 }finally{db.close();Object.assign(config,old);vi.useRealTimers();vi.unstubAllGlobals();}
});
