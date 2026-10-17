import {pulse} from './pulse.mjs';
import {sessionQuotes as quotes,sessionStatus,sessionBars} from './session.mjs';

import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {hasToken,mode,isDemoKey,search,candles,quotes as rawQuotes,connection,isMarketOpen,nowIST,demoUniverse} from './market.mjs';
import {initDB,data,markPortfolio,createOrder,settleOrder,cancelOrder,createBot,updateBot,markBot,reset} from './store.mjs';
import {STRATEGIES,backtest,calculateSignals} from './strategy.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HOST='127.0.0.1',PORT=Number(process.env.PORT||8765);
const goodKey=(key)=>isDemoKey(key)&&demoUniverse().some(x=>x.instrument_key===key)||/^(NSE_EQ|BSE_EQ)\|[a-zA-Z0-9]+$/.test(key);
const defaultDates=()=>{const e=new Date(),s=new Date(e);s.setUTCDate(s.getUTCDate()-365);return {start:s.toISOString().slice(0,10),end:e.toISOString().slice(0,10)};};
const json=(res,value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
const tradeOne=async(o)=>{if(!o||o.status!=='PENDING')return o;const quote=(await quotes([o.instrument_key]))[o.instrument_key];return quote?(settleOrder(o.id,quote)||o):o;};
export async function runPending(){const allOrders=data().orders.filter(x=>x.status==='PENDING');if(!allOrders.length)return {examined:0,filled:0};const prices=await quotes([...new Set(allOrders.map(x=>x.instrument_key))]);let filled=0;for(const o of allOrders){const updated=prices[o.instrument_key]&&settleOrder(o.id,prices[o.instrument_key]);if(updated?.status==='FILLED')filled++;}return {examined:allOrders.length,filled};}
let botBusy=false;
export async function runBots(){if(botBusy)return {skipped:'Scheduler busy'};botBusy=true;let examined=0,ordered=0,errors=[];try{
 const today=nowIST();const todayIST=`${today.year}-${today.month}-${today.day}`;
 for(const bot of data().bots.filter(x=>x.enabled)){examined++;
  try{const until=new Date(todayIST+'T00:00:00Z');until.setUTCDate(until.getUTCDate()-1);const start=new Date(until);start.setUTCDate(start.getUTCDate()-460);const bars=await candles(bot.instrument_key,start.toISOString().slice(0,10),until.toISOString().slice(0,10),'days',1);
   if(bars.length<60)continue;const last=bars.at(-1);if(bot.last_signal_date===last.time)continue;const sig=calculateSignals(bars,{...bot.params,strategy:bot.strategy}).at(-1);
   markBot(bot.id,last.time,sig.buy?'BUY_SIGNAL':sig.sell?'SELL_SIGNAL':'HOLD');
   const holding=data().positions[bot.instrument_key]?.qty||0;let side=null,qty=0;if(sig.sell&&holding>0){side='SELL';qty=Math.min(holding,bot.qty);}else if(sig.buy&&holding===0){side='BUY';qty=bot.qty;}
   if(!side)continue;const order=createOrder({key:bot.instrument_key,symbol:bot.symbol,exchange:bot.exchange,side,type:'MARKET',qty,trigger:null});await tradeOne(order);ordered++;
  }catch(e){errors.push(`${bot.symbol}: ${e.message}`);}
 }
 return {examined,ordered,errors};
 }finally{botBusy=false;}}
export async function routes(method,p,params,body,policy={}){
 if(method==='GET'&&p==='/api/pulse')return pulse();
 if(method==='GET'&&p==='/api/health')return {ok:true,service:'India Algo Lab Fullstack',version:'2.0.0'};
 if(method==='GET'&&p==='/api/session'){const key=String(params.get('key')||'');if(!goodKey(key)||isDemoKey(key))throw Error('Select a real NSE/BSE equity for session data.');return sessionBars(key);}
 if(method==='GET'&&p==='/api/status')return {mode:mode(),hasToken:hasToken(),marketOpen:isMarketOpen(),serverTime:new Date().toISOString(),ist:nowIST(),strategies:STRATEGIES,session:hasToken()?await sessionStatus():{mode:'SYNTHETIC',source:'SYNTHETIC'}};
 if(method==='GET'&&p==='/api/connect')return await connection();
 if(method==='GET'&&p==='/api/search'){if(String(params.get('q')||'').trim().toLowerCase()==='demo')return {instruments:demoUniverse(),page:1,total_pages:1};return search(params.get('q'),params.get('exchange')||'ALL',Math.max(1,Number(params.get('page')||1)));}
 if(method==='GET'&&p==='/api/candles'){const d=defaultDates(),key=String(params.get('key')||'');if(!goodKey(key))throw Error('Select an NSE/BSE equity or synthetic demo symbol.');const list=await candles(key,params.get('start')||d.start,params.get('end')||d.end,params.get('unit')||'days',Number(params.get('interval')||1));return {candles:list,source:isDemoKey(key)?'SYNTHETIC':'UPSTOX',count:list.length};}
 if(method==='GET'&&p==='/api/quotes'){const keys=String(params.get('keys')||'').split(',').slice(0,100).filter(goodKey);return {quotes:await quotes(keys)};}
 if(method==='POST'&&p==='/api/backtest'){if(!goodKey(body.key))throw Error('Select an instrument first.');const d=defaultDates();const bars=await candles(body.key,body.start||d.start,body.end||d.end,body.unit||'days',Number(body.interval||1));if(bars.length<30)throw Error('Not enough price history for a backtest. Expand the date range.');return {result:backtest(bars,body),source:isDemoKey(body.key)?'SYNTHETIC':(isMarketOpen()?'UPSTOX_LIVE':'UPSTOX_REPLAY'),candles:bars.length};}
 if(method==='GET'&&p==='/api/portfolio'){let priceMap={},quoteWarning=null;const keys=Object.keys(data().positions);if(keys.length)try{priceMap=await quotes(keys);}catch(e){quoteWarning=e.message;}return {...markPortfolio(priceMap),quoteWarning};}
 if(method==='POST'&&p==='/api/orders'){if(!goodKey(body.key))throw Error('Invalid equity instrument.');if(!isDemoKey(body.key)&&!hasToken())throw Error('Configure token for real-equity market data.');const order=createOrder({key:body.key,symbol:String(body.symbol||'').slice(0,60),exchange:String(body.exchange||'NSE').slice(0,10),side:body.side,type:body.type,qty:Number(body.qty),trigger:Number(body.trigger),policy});try{return {order:await tradeOne(order)};}catch(e){return {order,warning:'Order remains pending: '+e.message};}}
 let m=p.match(/^\/api\/orders\/([0-9a-f-]+)\/cancel$/);if(method==='POST'&&m)return {order:cancelOrder(m[1])};
 if(method==='POST'&&p==='/api/orders/process')return runPending();
 if(method==='POST'&&p==='/api/bots'){if(!goodKey(body.key))throw Error('Invalid bot instrument.');return {bot:createBot({key:body.key,symbol:String(body.symbol||'').slice(0,60),exchange:String(body.exchange||'NSE'),strategy:body.strategy,qty:Number(body.qty),params:body.params})};}
 m=p.match(/^\/api\/bots\/([0-9a-f-]+)$/);if(method==='PATCH'&&m)return {bot:updateBot(m[1],body.enabled)};
 if(method==='POST'&&p==='/api/bots/run')return {...await runBots(),pending:await runPending()};
 if(method==='POST'&&p==='/api/account/reset'){if(body.confirm!=='RESET')throw Error('Type RESET to reset virtual account.');return {ok:true,cash:reset().cash};}
 throw Error('Unknown API route.');
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
async function serve(req,res){try{
 if(!['GET','POST','PATCH'].includes(req.method)){json(res,{error:'Unsupported method'},405);return;}
 const host=req.headers.host||'';if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)){json(res,{error:'Localhost access only.'},403);return;}
 const url=new URL(req.url,`http://${host}`);let p=decodeURIComponent(url.pathname);if(p.startsWith('/api/')){
  // Protect local paper state against cross-site POST requests from a hostile browser tab.
  if(req.method!=='GET'&&req.headers.origin){const o=new URL(req.headers.origin);if(!['127.0.0.1','localhost'].includes(o.hostname)||String(o.port)!==String(PORT)){json(res,{error:'Cross-origin requests are blocked.'},403);return;}}
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>32768){json(res,{error:'Request too large'},413);return;}}
  let body={};if(raw){try{body=JSON.parse(raw);}catch{json(res,{error:'Invalid JSON request'},400);return;}}
  const result=await routes(req.method,p,url.searchParams,body);json(res,await result);return;
 }
 if(req.method!=='GET'){json(res,{error:'Not found'},404);return;}
 const relative=p==='/'?'index.html':p.slice(1);const filename=path.resolve(ROOT,'web',relative);const webroot=path.resolve(ROOT,'web');if(!filename.startsWith(webroot+path.sep)&&filename!==path.join(webroot,'index.html')){json(res,{error:'Forbidden'},403);return;}
 if(!fs.existsSync(filename)||!fs.statSync(filename).isFile()){json(res,{error:'Static file not found'},404);return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});fs.createReadStream(filename).pipe(res);
 }catch(e){console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}: ${e.message}`);if(!res.headersSent)json(res,{error:e.message},400);else res.end();}}
export const createApp=()=>http.createServer(serve);
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{initDB();const server=createApp();server.listen(PORT,HOST,()=>console.log(`India Algo Lab Fullstack available at http://${HOST}:${PORT} | ${mode()}\nClose this window to stop the server.`));server.on('error',e=>{console.error('SERVER STARTUP ERROR:',e.message);process.exitCode=1;});const timer=setInterval(async()=>{try{await runPending();await runBots();}catch(e){console.error('Scheduler:',e.message);}},90000);timer.unref();}catch(e){console.error('STARTUP ERROR:',e.message);process.exitCode=1;}}
