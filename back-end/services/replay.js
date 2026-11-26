import { config } from '../config.js';
import { DAY,ensure } from '../db.js';

export const marketDay=time=>new Date(time+19800000).toISOString().slice(0,10);
export function validBars(raw){
 const bars=(raw||[]).map(([stamp,open,high,low,close])=>({time:Date.parse(stamp)/1000,open,high,low,close})).filter(bar=>
  Number.isFinite(bar.time)&&[bar.open,bar.high,bar.low,bar.close].every(x=>Number.isFinite(x)&&x>0)&&
  bar.low<=Math.min(bar.open,bar.close)&&bar.high>=Math.max(bar.open,bar.close)&&bar.low<=bar.high);
 return [...new Map(bars.map(bar=>[bar.time,bar])).values()].sort((a,b)=>a.time-b.time);
}
export function latestSession(raw,now=Date.now()){
 const bars=validBars(raw).filter(bar=>bar.time*1000<=now);
 ensure(bars.length,503,'REPLAY_UNAVAILABLE','No recent historical candles are available for this stock.');
 const groups=new Map();
 for(const bar of bars){const day=marketDay(bar.time*1000);if(!groups.has(day))groups.set(day,[]);groups.get(day).push(bar);}
 const day=[...groups.keys()].reverse().find(key=>groups.get(key).length>=2);
 ensure(day,503,'REPLAY_UNAVAILABLE','This stock needs at least two historical candles to replay.');
 return {day,bars:groups.get(day)};
}
export function replayFrame(session,now,epoch,tickMs=config.tickMs){
 const elapsed=Math.max(0,Math.floor((now-epoch)/tickMs));
 const index=elapsed%session.bars.length;
 return {bar:session.bars[index],index,cycle:Math.floor(elapsed/session.bars.length),day:session.day,count:session.bars.length,visible:session.bars.slice(0,index+1)};
}
// History requests are per instrument and globally bounded, including simultaneous watchlists.
let active=0;const waiting=[];
async function limited(work){
 if(active>=4)await new Promise(resolve=>waiting.push(resolve));else active++;
 try{return await work();}finally{const next=waiting.shift();if(next)next();else active--;}
}
const sessions=new Map();
export async function recordedSession(instrument,now,load){
 const key=instrument.provider_key+':'+marketDay(now);
 let entry=sessions.get(key);
 if(!entry||entry.expires<=Date.now()){
  const promise=limited(async()=>{
   const encoded=encodeURIComponent(instrument.provider_key);
   // Prefer today's completed intraday candles, otherwise search the previous two weeks.
   const today=await load(`v3/historical-candle/intraday/${encoded}/minutes/5`).catch(()=>null);
   if(today?.candles?.length){try{return latestSession(today.candles,now);}catch{/* A holiday or newly listed stock may need an earlier session. */}}
   const data=await load(`v3/historical-candle/${encoded}/minutes/5/${marketDay(now)}/${marketDay(now-14*DAY)}`);
   return latestSession(data?.candles,now);
  });
  entry={promise,expires:Date.now()+15*60000};sessions.set(key,entry);
  promise.catch(()=>{if(sessions.get(key)===entry)entry.expires=Date.now()+15000;});
  if(sessions.size>1000){for(const [old,value] of sessions)if(value.expires<Date.now())sessions.delete(old);while(sessions.size>1000)sessions.delete(sessions.keys().next().value);}
 }
 return entry.promise;
}
export async function replayQuote(row,now,epoch,load){
 try{
  const session=await recordedSession(row,now,load);const frame=replayFrame(session,now,epoch);
  return {symbol:row.symbol,source:'upstox',mode:'replay',status:'replay',executable:true,time:Math.floor(now/config.tickMs)*config.tickMs,
   price:Math.round(frame.bar.close*100),recordedTime:frame.bar.time*1000,replayDay:frame.day,replayIndex:frame.index,replayCount:frame.count,replayCycle:frame.cycle,replayBar:frame.bar};
 }catch{return {symbol:row.symbol,source:'upstox',mode:'replay',status:'unavailable',executable:false,time:null,price:null,reason:'Historical replay is unavailable for this stock. Check the Upstox historical-data connection.'};}
}
