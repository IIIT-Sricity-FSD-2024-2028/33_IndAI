import { config } from '../config.js';
import { DAY, ensure } from '../db.js';

import { symbolHash } from './instruments.js';
import { recordedSession,replayFrame,replayQuote } from './replay.js';
const replayEpoch=Date.now();

const date = ms => new Date(ms + 19800000).toISOString().slice(0,10);
const period = { '1D':1, '1M':30, '3M':90, '1Y':365 };
const step = 300000;
export function demoPrice(instrument, now) {
  const legacy=['RELIANCE','TCS','INFY','HDFCBANK','SBIN','ITC','BHARTIARTL','AXISBANK'].indexOf(instrument.symbol);
  const index=legacy>=0?legacy:symbolHash(instrument.symbol)%10000;
  const tick = Math.floor(now / config.tickMs);
  const bucket = tick * config.tickMs / step;
  const wave = Math.sin(bucket / 9 + index) * .017 + Math.cos(bucket / 61 + index) * .031 +
    Math.sin(bucket / 3) * .003 + Math.sin(tick / 8 + index) * .0015;
  return Math.round(instrument.base * (1 + wave));
}
export function providerTime(value) {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  const parsed = Number.isFinite(numeric) ? (numeric < 1e12 ? numeric * 1000 : numeric) : Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function cache() {
  const entries = new Map();
  return async (key, duration, load) => {
    const now = Date.now();
    const existing = entries.get(key);
    if (existing?.expires > now) return existing.promise;
    if (entries.size > 250) entries.clear();
    const promise = Promise.resolve().then(load);
    entries.set(key, { expires: now + duration, promise });
    return promise;
  };
}
const load = cache();
export async function marketState(){
 if(config.provider==='demo')return {mode:'demo'};
 const data=await load('NSE',20000,()=>upstox('v2/market/status/NSE')).catch(()=>null);
 const session=['NORMAL_OPEN','NORMAL_CLOSE','PRE_OPEN_START','PRE_OPEN_END','CLOSING_START','CLOSING_END'].includes(data?.status)?data:null;
 return {session,mode:session&&session.status!=='NORMAL_OPEN'&&config.replayClosed?'replay':'live'};
}
async function upstox(path) {
  const token = path.startsWith('v3/historical-candle/') ?
    config.analytics || config.marketAccess : config.marketAccess || config.analytics;
  ensure(token, 503, 'MARKET_UNCONFIGURED', 'Upstox is unconfigured.');
  const result = await fetch('https://api.upstox.com/' + path, {
    signal: AbortSignal.timeout(5500), headers: { Accept:'application/json', Authorization:'Bearer ' + token }
  }).catch(() => null);
  ensure(result?.ok, 503, 'MARKET_UNAVAILABLE', 'Upstox data is unavailable (provider status ' + (result?.status ?? 'unreachable') + ').');
  const body = await result.json();
  return body.data;
}
function unavailable(instrument, reason) {
  return { symbol:instrument.symbol, source:'upstox', status:'unavailable', time:null, price:null, executable:false, reason };
}
export async function quotes(rows, now = Date.now()) {
  if (!rows.length) return [];
  if (config.provider === 'demo') {
    return rows.map(row => ({ symbol:row.symbol, source:'demo', time:Math.floor(now/config.tickMs)*config.tickMs, price:demoPrice(row, now), status:'demo', executable:true }));
  }
  const {session,mode}=await marketState();
  if(mode==='replay')return Promise.all(rows.map(row=>replayQuote(row,now,replayEpoch,upstox)));
  const unique=[...new Set(rows.map(row=>row.provider_key))].sort();
  const batches=Array.from({length:Math.ceil(unique.length/100)},(_,i)=>unique.slice(i*100,(i+1)*100));
  const books=new Map();
  let cursor=0;
  // At most four quote requests in flight, each comfortably below the provider's 500-key limit.
  await Promise.all(Array.from({length:Math.min(4,batches.length)},async()=>{
    while(cursor<batches.length){
      const batch=batches[cursor++],keys=batch.join(',');
      try{
        const book=await load('quotes:'+keys,4000,()=>upstox('v2/market-quote/quotes?instrument_key='+encodeURIComponent(keys)));
        for(const tick of Object.values(book||{}))books.set(tick.instrument_token,tick);
      }catch{/* Missing batches stay unavailable; successful batches remain usable. */}
    }
  }));
  return rows.map(row=>{
    const tick=books.get(row.provider_key);
    if(!Number.isFinite(tick?.last_price)||tick.last_price<=0)return unavailable(row,'Upstox quote unavailable. Check the market-data connection.');
    const time=providerTime(tick.timestamp)??providerTime(tick.last_trade_time);
    const fresh=Number.isFinite(time)&&time<=now+10000&&now-time<60000;
    const open=session?.status==='NORMAL_OPEN';
    return {symbol:row.symbol,source:'upstox',mode:'live',time:Number.isFinite(time)?time:null,price:Math.round(tick.last_price*100),
      tradeTime:providerTime(tick.last_trade_time),status:!session?'unavailable':open?(fresh?'live':'stale'):'closed',executable:open&&fresh,
      ...(!session?{reason:'Market session status is unavailable.'}:{})};
  });
}
export async function candles(instrument, range, now = Date.now()) {
  ensure(Object.hasOwn(period,range), 422,'INVALID_RANGE','Select a supported chart range.');
  if (config.provider === 'demo') {
    const interval = range === '1D' ? step : DAY;
    const count = range === '1D' ? 75 : period[range];
    const end = Math.floor(now / interval) * interval;
    return Array.from({ length:count }, (_, i) => {
      const time = end - (count - i - 1) * interval;
      const closeTime = Math.min(time + interval - config.tickMs,Math.floor(now/config.tickMs)*config.tickMs);
      const open = demoPrice(instrument,time) / 100;
      const close = demoPrice(instrument,closeTime) / 100;
      let high=Math.max(open,close),low=Math.min(open,close);
      const sampleStep=Math.max(config.tickMs,Math.floor(interval/150));
      for(let sample=time;sample<closeTime;sample+=sampleStep) {
        const value=demoPrice(instrument,sample)/100;
        high=Math.max(high,value);low=Math.min(low,value);
      }
      return {time:range === '1D' ? time / 1000 : date(time),open,close,high,low};
    });
  }
  if(range==='1D'&&(await marketState()).mode==='replay'){
    const session=await recordedSession(instrument,now,upstox);
    return replayFrame(session,now,replayEpoch).visible;
  }
  const key = encodeURIComponent(instrument.provider_key);
  const path = range === '1D' ? `v3/historical-candle/intraday/${key}/minutes/5` :
    `v3/historical-candle/${key}/days/1/${date(now)}/${date(now - period[range] * DAY)}`;
  const data = await load(path, 60000, () => upstox(path));
  const parsed = (data?.candles || []).map(([stamp,open,high,low,close]) => ({
    time:range === '1D' ? Date.parse(stamp)/1000 : stamp.slice(0,10),
    open,high,low,close
  })).filter(bar => [bar.open,bar.high,bar.low,bar.close].every(value=>Number.isFinite(value)&&value>0) &&
    (typeof bar.time==='string'||Number.isFinite(bar.time)));
  return [...new Map(parsed.map(bar=>[bar.time,bar])).values()].sort((a,b)=>a.time>b.time?1:-1);
}
