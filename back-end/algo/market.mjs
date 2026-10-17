

const BASE='https://api.upstox.com';
const CACHE=new Map();
const SYMBOLS=[
  {instrument_key:'DEMO|RELIANCE',trading_symbol:'RELIANCE',name:'Reliance Industries (Synthetic)',exchange:'DEMO',segment:'DEMO',instrument_type:'EQ'},
  {instrument_key:'DEMO|TCS',trading_symbol:'TCS',name:'Tata Consultancy Services (Synthetic)',exchange:'DEMO',segment:'DEMO',instrument_type:'EQ'},
  {instrument_key:'DEMO|INFY',trading_symbol:'INFY',name:'Infosys (Synthetic)',exchange:'DEMO',segment:'DEMO',instrument_type:'EQ'},
  {instrument_key:'DEMO|HDFCBANK',trading_symbol:'HDFCBANK',name:'HDFC Bank (Synthetic)',exchange:'DEMO',segment:'DEMO',instrument_type:'EQ'},
  {instrument_key:'DEMO|ICICIBANK',trading_symbol:'ICICIBANK',name:'ICICI Bank (Synthetic)',exchange:'DEMO',segment:'DEMO',instrument_type:'EQ'},
  {instrument_key:'DEMO|SBIN',trading_symbol:'SBIN',name:'State Bank of India (Synthetic)',exchange:'DEMO',segment:'DEMO',instrument_type:'EQ'},
  {instrument_key:'DEMO|NIFTY50',trading_symbol:'NIFTY50',name:'Nifty 50 (Synthetic Index)',exchange:'DEMO',segment:'DEMO',instrument_type:'INDEX'},
];
export const hasToken=()=>Boolean((process.env.UPSTOX_ANALYTICS_TOKEN||'').trim());
export const mode=()=>hasToken()?'LIVE_DATA':'DEMO';
export const isDemoKey=(key)=>key?.startsWith('DEMO|');
function seeded(str){let s=0;for(const c of str)s=(Math.imul(s,31)+c.charCodeAt(0))>>>0;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
function isoDay(d){return new Date(d).toISOString().slice(0,10);}
function previousTradingDays(end,n){const list=[];let t=new Date(end+'T12:00:00Z'); for(let i=0;i<n*2+15 && list.length<n;i++){if(t.getUTCDay()!==0&&t.getUTCDay()!==6)list.push(isoDay(t));t.setUTCDate(t.getUTCDate()-1);}return list.reverse();}
export function demoCandles(key,start,end,unit='days',interval=1){const rand=seeded(key);const days=previousTradingDays('2036-01-01',6000);let last=key.includes('NIFTY')?18500:key.includes('BANK')?1450:key.includes('TCS')?3250:1200;
 const out=days.map((date,i)=>{const drift=.00035+Math.sin(i/41)*.0015; const change=(rand()-.49)*.045+drift;let open=last*(1+(rand()-.5)*.012);let close=Math.max(5,last*(1+change));let high=Math.max(open,close)*(1+rand()*.012);let low=Math.min(open,close)*(1-rand()*.012);last=close;return {time:date,open:round(open),high:round(high),low:round(low),close:round(close),volume:Math.floor(400000+rand()*2400000)};});const anchor=out.find(c=>c.time==='2026-01-01')?.close||last;
 const baseline=key.includes('TCS')?3200:key.includes('NIFTY')?24000:key.includes('BANK')?1400:1200;
 const scale=baseline/anchor;for(const c of out)for(const field of ['open','high','low','close'])c[field]=round(c[field]*scale);
 const daily=out.filter(c=>(!start||c.time>=start)&&(!end||c.time<=end));
 if(unit==='days')return daily;
 if(unit==='weeks'||unit==='months'){
   const bins=new Map();
   for(const c of daily){let group;if(unit==='months')group=c.time.slice(0,7);else {const monday=new Date(c.time+'T00:00:00Z');monday.setUTCDate(monday.getUTCDate()-((monday.getUTCDay()+6)%7));group=monday.toISOString().slice(0,10);}
     const prior=bins.get(group);if(!prior)bins.set(group,{...c});else {prior.high=Math.max(prior.high,c.high);prior.low=Math.min(prior.low,c.low);prior.close=c.close;prior.volume+=c.volume;}}
   return [...bins.values()];
 }
 if(unit==='minutes'||unit==='hours'){
   const step=unit==='hours'?interval*60:interval;const bars=[];
   if(daily.length>60)throw Error('Synthetic intraday demo is limited to 60 market days; shorten your date range.');
   for(const day of daily){const r=seeded(key+'@'+day.time+'@'+step);const count=Math.floor(375/step);let prev=day.open;
     for(let i=0;i<count;i++){const progress=(i+1)/count,ideal=day.open+(day.close-day.open)*progress;const close=i===count-1?day.close:Math.max(1,ideal+(r()-.5)*day.open*.009);const open=prev;const hi=Math.max(open,close)*(1+r()*.002);const low=Math.min(open,close)*(1-r()*.002);const minutes=555+i*step;bars.push({time:day.time+' '+String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0'),open:round(open),high:round(hi),low:round(low),close:round(close),volume:Math.floor(day.volume/count*(.7+r()*.6))});prev=close;}
   }
   return bars;
 }
 return daily;}
const round=n=>Number(n.toFixed(2));
function cacheGet(k){const a=CACHE.get(k);return a&&a.exp>Date.now()?a.value:null;}
async function getJson(path,ttl=0){const k='API:'+path, old=cacheGet(k);if(old)return old;
 const token=(process.env.UPSTOX_ANALYTICS_TOKEN||'').trim();if(!token)throw Error('No Upstox token configured. Edit .env and restart the server.');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);let response;
 try{response=await fetch(BASE+path,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json','User-Agent':'IndAI/3.1'},signal:controller.signal});}catch(e){throw Error(e.name==='AbortError'?'Upstox request timed out (12s).':'Cannot reach Upstox. Check internet/network connectivity. '+e.message);}finally{clearTimeout(timeout);}
 let payload;try{payload=await response.json();}catch{throw Error(`Upstox returned non-JSON response (HTTP ${response.status}).`);}
 if(!response.ok||payload.status==='error'){const msg=payload?.errors?.[0]?.message||payload?.message||payload?.error?.message||(typeof payload?.error==='string'?payload.error:'')||`HTTP ${response.status}`;if(response.status===401||response.status===403)throw Error('Upstox authorization failed. Check your Analytics Token and its expiry. '+msg);if(response.status===429)throw Error('Upstox rate limit reached; retry shortly.');throw Error(`Upstox API: ${msg}`);}
 if(ttl)CACHE.set(k,{value:payload,exp:Date.now()+ttl});return payload;
}
export async function connection(){if(!hasToken())return {mode:'DEMO',ok:false,message:'No token: synthetic demonstration mode is active.'};try{const data=await getJson('/v2/instruments/search?query=RELIANCE&segments=EQ&records=1',0);return {mode:'LIVE_DATA',ok:true,message:`Connected to Upstox. Found ${data?.data?.length??0} matching instruments.`};}catch(e){return {mode:'LIVE_DATA',ok:false,message:e.message};}}
export async function search(query,exchange='ALL',page=1){const q=String(query||'').trim().slice(0,50);if(!q)return {instruments:[],page:1,total_pages:0};
 if(!hasToken()){const a=SYMBOLS.filter(s=>s.trading_symbol.toLowerCase().includes(q.toLowerCase())||s.name.toLowerCase().includes(q.toLowerCase())||q.toLowerCase()==='demo');return {instruments:a,page:1,total_pages:1};}
 const params=new URLSearchParams({query:q,segments:'EQ',records:'30',page_number:String(page)});if(exchange==='NSE'||exchange==='BSE')params.set('exchanges',exchange);
 const data=await getJson('/v2/instruments/search?'+params,45000);return {instruments:(data.data||[]).filter(x=>x.segment==='NSE_EQ'||x.segment==='BSE_EQ'),page:Number(page),total_pages:data.meta_data?.page?.total_pages||1};
}
function validateKey(key){if(!/^(NSE_EQ|BSE_EQ)\|[a-zA-Z0-9]+$/.test(key))throw Error('Only NSE_EQ and BSE_EQ stocks are supported in real-market mode.');}
const validDay=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'));
function partition(start,end,unit,interval){const max=unit==='minutes'?(interval<=15?25:80):unit==='hours'?80:unit==='days'?3000:36500;const a=[];let cursor=new Date(start+'T00:00:00Z');const finish=new Date(end+'T00:00:00Z');while(cursor<=finish){let until=new Date(cursor);until.setUTCDate(until.getUTCDate()+max-1);if(until>finish)until=finish;a.push([isoDay(cursor),isoDay(until)]);cursor=new Date(until);cursor.setUTCDate(cursor.getUTCDate()+1);if(a.length>60)throw Error('Date range too large; narrow your history request.');}return a;}
export async function candles(key,start,end,unit='days',interval=1){if(!validDay(start)||!validDay(end)||start>end)throw Error('Provide a valid start and end date (YYYY-MM-DD).');if(!['days','weeks','months','minutes','hours'].includes(unit))throw Error('Invalid candle unit.');if(unit==='days'||unit==='weeks'||unit==='months'){if(interval!==1)throw Error('Daily/weekly/monthly candles only support interval 1.');}else if((unit==='hours'&&(interval<1||interval>5))||(unit==='minutes'&&(interval<1||interval>300)))throw Error('Invalid intraday candle interval.');
 if(isDemoKey(key))return demoCandles(key,start,end,unit,interval);
 if(!hasToken())throw Error('To use real NSE/BSE symbols, configure your Upstox Analytics Token in .env.');validateKey(key);
 const ck=JSON.stringify([key,start,end,unit,interval]);const hit=cacheGet(ck);if(hit)return hit;
 let results=[];for(const [from,to] of partition(start,end,unit,interval)){const raw=await getJson(`/v3/historical-candle/${encodeURIComponent(key)}/${unit}/${interval}/${to}/${from}`,300000);results.push(...(raw.data?.candles||[]).map(x=>({time:x[0]?.slice(0,10)+(unit==='minutes'||unit==='hours'?' '+x[0]?.slice(11,16):''),open:Number(x[1]),high:Number(x[2]),low:Number(x[3]),close:Number(x[4]),volume:Number(x[5]||0)})));}
 const unique=[...new Map(results.map(x=>[x.time,x])).values()].sort((a,b)=>a.time.localeCompare(b.time));CACHE.set(ck,{value:unique,exp:Date.now()+300000});return unique;
}
export function nowIST(){const f=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',weekday:'short'}).formatToParts(new Date());return Object.fromEntries(f.map(x=>[x.type,x.value]));}
export function isMarketOpen(){const t=nowIST();const minutes=Number(t.hour)*60+Number(t.minute);return !['Sat','Sun'].includes(t.weekday)&&minutes>=555&&minutes<=930;}
export async function quotes(keys){const uniq=[...new Set(keys.filter(Boolean))];const answer={};for(const key of uniq.filter(isDemoKey)){const all=demoCandles(key,undefined,isoDay(Date.now()));const last=all.at(-1);answer[key]={instrument_key:key,last_price:last.close,previous_close:all.at(-2)?.close||last.close,asof:new Date().toISOString(),source:'SYNTHETIC'};}
 const real=uniq.filter(x=>!isDemoKey(x));if(real.length){if(!hasToken())throw Error('No Upstox Analytics Token configured.');real.forEach(validateKey);for(let i=0;i<real.length;i+=100){const batch=real.slice(i,i+100);const data=await getJson('/v3/market-quote/ltp?instrument_key='+encodeURIComponent(batch.join(',')),0);for(const q of Object.values(data.data||{})){const key=q.instrument_token;if(key&&batch.includes(key))answer[key]={instrument_key:key,last_price:Number(q.last_price),previous_close:Number(q.cp||q.last_price),asof:new Date().toISOString(),source:'UPSTOX_LTP'};}}}
 return answer;
}
export const demoUniverse=()=>SYMBOLS;
export const requestUpstox=getJson;
