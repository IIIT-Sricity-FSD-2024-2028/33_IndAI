import {AsyncLocalStorage} from 'node:async_hooks';
const context=new AsyncLocalStorage();
export const withUser=(id,fn)=>context.run(id,fn);
const accounts=new Map();
const account=()=>{const id=context.getStore();if(!id)throw Error('Authenticated research account required');if(!accounts.has(id))accounts.set(id,{id,db:null});return accounts.get(id);};
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const DB=()=>path.resolve(process.env.DATA_DIR||path.join(process.cwd(),'persistent-data'),'research',account().id+'.json');
const starting=()=>({version:2,startingCash:Number(process.env.INITIAL_PAPER_CASH||100000),cash:Number(process.env.INITIAL_PAPER_CASH||100000),positions:{},orders:[],bots:[],activity:[],equityHistory:[]});

export function initDB(){fs.mkdirSync(path.dirname(DB()),{recursive:true});if(fs.existsSync(DB())){try{account().db=JSON.parse(fs.readFileSync(DB(),'utf8'));if(!Number.isFinite(account().db.cash)||!account().db.positions||!Array.isArray(account().db.orders)||!Array.isArray(account().db.bots))throw Error('invalid data');}catch(e){throw Error('Cannot load saved virtual account at data/paper.json. Restore a valid backup or rename the corrupt file. '+e.message);}}else {account().db=starting();persist();}return account().db;}
export const data=()=>account().db??initDB();
export function persist(){fs.mkdirSync(path.dirname(DB()),{recursive:true});const tmp=DB()+'.tmp';fs.writeFileSync(tmp,JSON.stringify(account().db,null,2),'utf8');fs.renameSync(tmp,DB());}
export function mutate(fn){const result=fn(data());persist();return result;}
export function reset(){account().db=starting();persist();return account().db;}
export const uuid=()=>crypto.randomUUID();
export function markPortfolio(prices={},record=true){
 const d=data();
 const positions=Object.values(d.positions).map(p=>{
  const quote=Number(prices[p.instrument_key]?.last_price);
  if(quote>0)p.last_price=quote;
  const ltp=p.last_price||p.avg_price;
  return {...p,ltp,market_value:money(p.qty*ltp),unrealized:money((ltp-p.avg_price)*p.qty)};
 });
 const holdings=money(positions.reduce((sum,p)=>sum+p.market_value,0)),netWorth=money(d.cash+holdings);
 d.equityHistory=d.equityHistory||[];
 const complete=positions.every(p=>Number(prices[p.instrument_key]?.last_price)>0);
 if(record && (complete||positions.length===0)){
  const previous=d.equityHistory.at(-1),now=new Date().toISOString();
  if(!previous||previous.netWorth!==netWorth||previous.cash!==d.cash||Date.now()-Date.parse(previous.at)>=60000){
   d.equityHistory.push({at:now,netWorth,cash:d.cash,holdings});
   d.equityHistory=d.equityHistory.slice(-10000);persist();
  }
 }
 return {cash:d.cash,startingCash:d.startingCash,holdings,netWorth,positions,equityHistory:d.equityHistory,orders:d.orders.slice(-100).reverse(),bots:d.bots,activity:d.activity.slice(-10).reverse()};
}
function money(v){return Math.round((v+Number.EPSILON)*100)/100;}
export function createOrder(spec){const {key,symbol,exchange,side,type,qty,trigger,policy={}}=spec;if(!key||!symbol||!['BUY','SELL'].includes(side)||!['MARKET','LIMIT','STOP'].includes(type)||!Number.isInteger(qty)||qty<1||qty>10000000)throw Error('Check order instrument, type, side and whole-share quantity.');if(type!=='MARKET'&&!(Number.isFinite(trigger)&&trigger>0))throw Error('Set a positive limit or stop trigger price.');if(side==='SELL'&&(data().positions[key]?.qty||0)<qty)throw Error('Insufficient paper holdings for a sell order.');
 const day = value => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
 const todayOrders=data().orders.filter(o=>day(o.created_at)===day(Date.now())&&o.status!=='REJECTED');
 if(policy.maxDailyTrades>0&&todayOrders.length>=policy.maxDailyTrades)throw Error('Daily order limit reached.');
 const last=data().orders.at(-1);if(last&&policy.cooldown>0&&Date.now()-Date.parse(last.created_at)<policy.cooldown*1000)throw Error('Please wait for the configured order cooldown.');
 return mutate(d=>{const o={id:uuid(),instrument_key:key,symbol,exchange,side,type,qty,trigger:type==='MARKET'?null:trigger,status:'PENDING',created_at:new Date().toISOString(),maxOrderValue:policy.tradingLimit||null,fill:null,reason:null};d.orders.push(o);return o;});}
export function cancelOrder(id){return mutate(d=>{const o=d.orders.find(x=>x.id===id);if(!o||o.status!=='PENDING')throw Error('Pending order not found.');o.status='CANCELLED';return o;});}
export function settleOrder(id,quote,slippagePct=0.03){return mutate(d=>{const o=d.orders.find(x=>x.id===id);if(!o||o.status!=='PENDING')return null;const p=Number(quote?.last_price);if(!(p>0)||!Number.isFinite(p))return null;
 const crosses=o.type==='MARKET'||(o.type==='LIMIT'&&(o.side==='BUY'?p<=o.trigger:p>=o.trigger))||(o.type==='STOP'&&(o.side==='BUY'?p>=o.trigger:p<=o.trigger));if(!crosses)return null;
 let price=p*(1+(o.side==='BUY'?1:-1)*slippagePct/100);if(o.type==='LIMIT')price=o.side==='BUY'?Math.min(o.trigger,price):Math.max(o.trigger,price);
 price=money(price);let position=d.positions[o.instrument_key];if(o.side==='BUY'){const total=money(price*o.qty);if(o.maxOrderValue&&total>o.maxOrderValue){o.status='REJECTED';o.reason='Order exceeds your configured trading limit.';return o;}if(d.cash<total){o.status='REJECTED';o.reason='Insufficient virtual buying power at fill.';return o;}d.cash=money(d.cash-total);const old=position?.qty||0;const avg=(old*(position?.avg_price||0)+total)/(old+o.qty);d.positions[o.instrument_key]={instrument_key:o.instrument_key,symbol:o.symbol,exchange:o.exchange,qty:old+o.qty,avg_price:money(avg)};}
 else {if(!position||position.qty<o.qty){o.status='REJECTED';o.reason='Insufficient virtual holdings at fill.';return o;}d.cash=money(d.cash+price*o.qty);position.qty-=o.qty;if(position.qty===0)delete d.positions[o.instrument_key];}
 o.status='FILLED';o.fill={price,at:new Date().toISOString(),source:quote.source};d.activity.push({id:o.id,action:o.side,qty:o.qty,symbol:o.symbol,price,at:o.fill.at});return o;});}
export function createBot(spec){const {key,symbol,exchange,strategy,qty,params}=spec;if(!key||!symbol||!Number.isInteger(qty)||qty<1||qty>1000000)throw Error('Invalid bot instrument or quantity.');if(!['sma','ema','rsi','bollinger','breakout','momentum','rules'].includes(strategy))throw Error('Invalid bot strategy.');return mutate(d=>{const b={id:uuid(),instrument_key:key,symbol,exchange,strategy,qty,params:params||{},enabled:false,last_signal_date:null,last_action:null,created_at:new Date().toISOString()};d.bots.push(b);return b;});}
export function updateBot(id,enabled){return mutate(d=>{const b=d.bots.find(x=>x.id===id);if(!b)throw Error('Bot not found');b.enabled=Boolean(enabled);return b;});}
export function markBot(id,when,action){return mutate(d=>{const b=d.bots.find(x=>x.id===id);if(b){b.last_signal_date=when;b.last_action=action;}return b;});}
