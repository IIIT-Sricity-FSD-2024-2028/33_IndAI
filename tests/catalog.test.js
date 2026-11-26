import {test,expect,beforeAll,afterAll,vi} from 'vitest';
import request from 'supertest';
import {createApp} from '../back-end/app.js';
import {openDatabase} from '../back-end/db.js';
import {installInstruments,catalogue,parseCatalogue,symbolPattern} from '../back-end/services/instruments.js';
import {passwordHash} from '../back-end/services/auth.js';
import {quotes,candles} from '../back-end/services/market.js';
import {config} from '../back-end/config.js';
const db=openDatabase(':memory:');const app=createApp(db);const client=request.agent(app);
const post=(path,body)=>client.post('/api'+path).set('X-IndAI-Request','1').send(body);
beforeAll(async()=>{
 installInstruments(db);
 db.run("INSERT INTO users(email,name,password,role,status) VALUES ('catalog@test.invalid','Catalogue Learner',?,'student','approved')",passwordHash('Catalogue-Test-2026'));
 await post('/auth/login',{email:'catalog@test.invalid',password:'Catalogue-Test-2026'}).expect(200);
});
afterAll(()=>db.close());
test('bundled master installs the complete NSE equity catalogue and updates existing databases without resetting demo anchors',()=>{
 expect(catalogue.instruments.length).toBeGreaterThan(2500);
 expect(db.get('SELECT count(*) n FROM instruments').n).toBe(catalogue.instruments.length);
 for(const symbol of ['RELIANCE','3MINDIA','M&M','BAJAJ-AUTO'])expect(db.get('SELECT * FROM instruments WHERE symbol=?',symbol)).toBeDefined();
 const before=db.get("SELECT base FROM instruments WHERE symbol='M&M'").base;
 db.run("UPDATE instruments SET base=12345 WHERE symbol='M&M'");installInstruments(db);
 expect(db.get("SELECT base FROM instruments WHERE symbol='M&M'").base).toBe(12345);
 expect(db.get("SELECT base FROM instruments WHERE symbol='RELIANCE'").base).toBe(143500);
 db.run("UPDATE instruments SET base=? WHERE symbol='M&M'",before);
});
test('catalogue includes every symbol while search and quote requests stay bounded and authenticated',async()=>{
 const {body}=await client.get('/api/trading/catalog').expect(200);
 expect(body.count).toBe(catalogue.instruments.length);expect(body.instruments).toHaveLength(body.count);
 expect(body.instruments[0]).not.toHaveProperty('quote');
 await request(app).get('/api/trading/catalog').expect(401);
 const {body:results}=await client.get('/api/trading/instruments').query({q:'M&M'}).expect(200);
 expect(results.some(row=>row.symbol==='M&M')).toBe(true);
 const {body:three}=await client.get('/api/trading/quotes').query({symbols:'M&M,3MINDIA,BAJAJ-AUTO,M&M'}).expect(200);
 expect(three).toHaveLength(3);expect(three.every(row=>row.quote.executable)).toBe(true);
 await client.get('/api/trading/quotes').query({symbols:'NOTASTOCK'}).expect(404);
 await client.get('/api/trading/quotes').query({symbols:'INVALID/SYMBOL'}).expect(422);
 await client.get('/api/trading/quotes').query({symbols:Array(501).fill('M&M').join(',')}).expect(422);
});
test('numeric, ampersand and hyphen tickers support charts, orders, portfolio and watchlists',async()=>{
 const {body:list}=await post('/trading/watchlists',{name:'All NSE symbol formats'}).expect(201);
 await client.put('/api/trading/watchlists/'+list.id).set('X-IndAI-Request','1').send({name:'All NSE symbol formats',symbols:['3MINDIA','M&M','BAJAJ-AUTO']}).expect(200);
 for(const symbol of ['3MINDIA','M&M','BAJAJ-AUTO']){
  expect(symbolPattern.test(symbol)).toBe(true);
  const {body:chart}=await client.get('/api/trading/instruments/'+encodeURIComponent(symbol)+'/candles?range=1D').expect(200);
  expect(chart.candles.length).toBeGreaterThan(0);
  const body={symbol,clientKey:crypto.randomUUID(),side:'buy',type:'market',qty:1,validity:'DAY'};
  expect((await post('/trading/orders',body).expect(201)).body.state).toBe('filled');
  const positions=(await client.get('/api/trading/account').expect(200)).body.positions;
  expect(positions.find(row=>row.symbol===symbol)).toMatchObject({qty:1,sellable:1});
  expect((await post('/trading/orders',{...body,clientKey:crypto.randomUUID(),side:'sell'}).expect(201)).body.state).toBe('filled');
 }
});
test('master parser filters non-equities and rejects corrupt, duplicate or unsupported records before replacement',()=>{
 const source={segment:'NSE_EQ',instrument_type:'EQ',...catalogue.instruments[0]};
 expect(parseCatalogue([source,{...source,segment:'NSE_FO'},{...source,instrument_type:'FUT'}])).toHaveLength(1);
 expect(()=>parseCatalogue([source,source])).toThrow(/duplicate/);
 expect(()=>parseCatalogue([{...source,instrument_key:'NSE_EQ|INVALID'}])).toThrow(/Unsupported/);
 expect(()=>parseCatalogue([{...source,trading_symbol:'BAD/SYMBOL'}])).toThrow(/Unsupported/);
});
test('additional demo stocks have independent price paths and consistent candles',async()=>{
 const rows=db.all("SELECT * FROM instruments WHERE symbol IN ('3MINDIA','M&M','BAJAJ-AUTO') ORDER BY symbol");
 const time=1780000000000;const ticks=await quotes(rows,time);
 expect(new Set(ticks.map(t=>t.price))).toHaveProperty('size',3);
 for(const [i,row] of rows.entries())expect((await candles(row,'1D',time)).at(-1).close).toBe(ticks[i].price/100);
});
test('live quotes request only the selected keys in bounded batches and isolate a failed batch',async()=>{
 const old={provider:config.provider,marketAccess:config.marketAccess,analytics:config.analytics};
 config.provider='upstox';config.marketAccess='mock-local-token';config.analytics='mock-local-token';
 const selected=db.all('SELECT * FROM instruments ORDER BY symbol LIMIT 507');const requested=[];let running=0,peak=0;
 vi.stubGlobal('fetch',vi.fn(async url=>{
  if(url.includes('/market/status/'))return Response.json({data:{status:'NORMAL_OPEN'}});
  const keys=new URL(url).searchParams.get('instrument_key').split(',');requested.push(keys);const batchNumber=requested.length;running++;peak=Math.max(peak,running);
  await Promise.resolve();running--;
  if(batchNumber===2)return new Response('{}',{status:503});
  return Response.json({data:Object.fromEntries(keys.map(key=>[key,{instrument_token:key,last_price:123,timestamp:new Date().toISOString()}]))});
 }));
 try{
  const ticks=await quotes([...selected,selected[0]]);
  expect(requested).toHaveLength(6);expect(Math.max(...requested.map(b=>b.length))).toBeLessThanOrEqual(100);expect(peak).toBeLessThanOrEqual(4);
  expect(new Set(requested.flat())).toEqual(new Set(selected.map(row=>row.provider_key)));
  expect(ticks.every(t=>t.source==='upstox')).toBe(true);expect(ticks.some(t=>t.executable)).toBe(true);expect(ticks.some(t=>t.status==='unavailable'&&t.price===null)).toBe(true);
 }finally{Object.assign(config,old);vi.unstubAllGlobals();}
});
test('multiple watchlists support independent rename, reorder, remove and delete operations with ownership checks',async()=>{
 const a=(await post('/trading/watchlists',{name:'Long term ideas'}).expect(201)).body.id;
 const b=(await post('/trading/watchlists',{name:'Short term ideas'}).expect(201)).body.id;
 const put=(id,name,symbols)=>client.put('/api/trading/watchlists/'+id).set('X-IndAI-Request','1').send({name,symbols});
 await put(a,'Long term ideas',['RELIANCE','TCS','M&M']).expect(200);
 await put(b,'Short term ideas',['INFY']).expect(200);
 await put(a,'Research and investing',['M&M','RELIANCE','TCS']).expect(200);
 await put(a,'Research and investing',['M&M','TCS']).expect(200);
 await put(a,'Short term ideas',['TCS']).expect(409);
 let lists=(await client.get('/api/trading/watchlists').expect(200)).body;
 expect(lists.find(row=>row.id===a)).toMatchObject({name:'Research and investing',symbols:['M&M','TCS']});
 expect(lists.find(row=>row.id===b).symbols).toEqual(['INFY']);
 const other=request.agent(app);
 db.run("INSERT INTO users(email,name,password,role,status) VALUES ('watchlist-other@test.invalid','Other Learner',?,'student','approved')",passwordHash('Catalogue-Test-2026'));
 await other.post('/api/auth/login').set('X-IndAI-Request','1').send({email:'watchlist-other@test.invalid',password:'Catalogue-Test-2026'}).expect(200);
 await other.put('/api/trading/watchlists/'+a).set('X-IndAI-Request','1').send({name:'Stolen list',symbols:[]}).expect(404);
 await other.delete('/api/trading/watchlists/'+a).set('X-IndAI-Request','1').expect(404);
 await client.delete('/api/trading/watchlists/'+a).set('X-IndAI-Request','1').expect(200);
 lists=(await client.get('/api/trading/watchlists').expect(200)).body;
 expect(lists.some(row=>row.id===a)).toBe(false);expect(lists.find(row=>row.id===b).symbols).toEqual(['INFY']);
});
