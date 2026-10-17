// Pure indicator calculations and next-open, long/cash backtesting engine.
const finite=n=>Number.isFinite(n)?n:null;
export const STRATEGIES=[
 {id:'sma',name:'SMA Crossover',description:'Buy when the fast SMA crosses above the slow SMA.'},
 {id:'ema',name:'EMA Crossover',description:'Follow exponential moving-average trends.'},
 {id:'rsi',name:'RSI Reversion',description:'Buy oversold and exit on overbought readings.'},
 {id:'bollinger',name:'Bollinger Mean Reversion',description:'Enter below the lower band, exit at the midline.'},
 {id:'breakout',name:'Donchian Breakout',description:'Close breaks the preceding N-day high; exit below prior low.'},
 {id:'momentum',name:'Momentum',description:'Buy when N-day rate of change turns positive.'},
 {id:'rules',name:'Custom Rules',description:'Enter and exit using safe indicator expressions.'}
];
export function sma(vals,n,i){if(!Number.isInteger(n)||n<1||i<n-1)return null;let sum=0;for(let j=i-n+1;j<=i;j++)sum+=vals[j];return sum/n;}
export function ema(vals,n,i){if(n<1||i<n-1)return null;let v=sma(vals,n,n-1);for(let j=n;j<=i;j++)v=(2/(n+1))*vals[j]+(1-2/(n+1))*v;return v;}
export function rsi(vals,n,i){if(n<1||i<n)return null;let ups=0,downs=0;for(let j=i-n+1;j<=i;j++){const d=vals[j]-vals[j-1];if(d>=0)ups+=d;else downs-=d;}if(downs===0)return ups===0?50:100;return 100-100/(1+ups/downs);}
export function roc(vals,n,i){return i>=n&&vals[i-n]?100*(vals[i]/vals[i-n]-1):null;}
const prevHigh=(candles,n,i)=>i<n?null:Math.max(...candles.slice(i-n,i).map(x=>x.high));
const prevLow=(candles,n,i)=>i<n?null:Math.min(...candles.slice(i-n,i).map(x=>x.low));
function stdev(vals,n,i){const mean=sma(vals,n,i);if(mean===null)return null;return Math.sqrt(vals.slice(i-n+1,i+1).reduce((a,x)=>a+(x-mean)**2,0)/n);}

// Small expression language. No eval/new Function/execution of user JS.
function tokenize(input){const tokens=String(input||'').match(/(?:\d+(?:\.\d+)?|[a-z_][a-z_0-9]*|>=|<=|==|!=|&&|\|\||[()+\-*/%,<>!])/gi)||[];if(tokens.join('').toLowerCase()!==String(input||'').replace(/\s/g,'').toLowerCase())throw Error('Custom expression contains unsupported characters.');if(tokens.length>120)throw Error('Custom expression too long.');return tokens.map(t=>t.toLowerCase());}
const precedence={or:1,'||':1,and:2,'&&':2,'>':3,'<':3,'>=':3,'<=':3,'==':3,'!=':3,'+':4,'-':4,'*':5,'/':5,'%':5};
export function parseRule(input){const t=tokenize(input);let at=0;if(!t.length)throw Error('Custom rule cannot be empty.');function expr(min=0){let token=t[at++];if(token===undefined)throw Error('Unexpected end of custom expression.');let left;if(token==='('){left=expr();if(t[at++]!==')')throw Error('Missing closing parenthesis.');}else if(['-','not','!'].includes(token)){left={type:'unary',op:token,node:expr(6)};}else if(/^\d/.test(token)){left={type:'num',value:Number(token)};}else if(/^[a-z_]/.test(token)){if(t[at]==='('){at++;const args=[];if(t[at]!==')'){do{args.push(expr());if(t[at]!==',')break;at++;}while(true);}if(t[at++]!==')')throw Error('Expected closing ) in function.');if(!['sma','ema','rsi','roc','highest','lowest','abs'].includes(token)||args.length!==1)throw Error('Unsupported function '+token);left={type:'call',name:token,args};}else{if(!['open','high','low','close','volume','prev_close','bar_index','true','false'].includes(token))throw Error('Unknown variable '+token);left={type:'var',name:token};}}else throw Error('Unexpected token '+token);while(t[at]&&precedence[t[at]]>=min){const op=t[at++];const right=expr(precedence[op]+1);left={type:'bin',op,left,right};}return left;}
const ast=expr();if(at!==t.length)throw Error('Unexpected token '+t[at]);return ast;}
export function evaluateRule(ast,candles,i,vals=candles.map(c=>c.close)){let operations=0;function run(x){if(++operations>500)throw Error('Rule too complex.');if(x.type==='num')return x.value;if(x.type==='var'){const row=candles[i];return {open:row.open,high:row.high,low:row.low,close:row.close,volume:row.volume,prev_close:candles[i-1]?.close??null,bar_index:i,true:true,false:false}[x.name];}if(x.type==='unary'){const v=run(x.node);return x.op==='-'?-Number(v):!Boolean(v);}if(x.type==='call'){const n=Number(run(x.args[0]));if(x.name==='abs')return Math.abs(n);if(!Number.isInteger(n)||n<1||n>500)throw Error('Indicator length must be an integer between 1 and 500.');switch(x.name){case 'sma':return sma(vals,n,i);case 'ema':return ema(vals,n,i);case 'rsi':return rsi(vals,n,i);case 'roc':return roc(vals,n,i);case 'highest':return prevHigh(candles,n,i);case 'lowest':return prevLow(candles,n,i);case 'abs':return Math.abs(n);}}if(x.type==='bin'){const a=run(x.left);if(['and','&&'].includes(x.op))return Boolean(a)&&Boolean(run(x.right));if(['or','||'].includes(x.op))return Boolean(a)||Boolean(run(x.right));const b=run(x.right);if(a==null||b==null)return false;switch(x.op){case '>':return a>b;case '<':return a<b;case '>=':return a>=b;case '<=':return a<=b;case '==':return a===b;case '!=':return a!==b;case '+':return Number(a)+Number(b);case '-':return Number(a)-Number(b);case '*':return Number(a)*Number(b);case '/':return Number(b)===0?null:Number(a)/Number(b);case '%':return Number(b)===0?null:Number(a)%Number(b);}}return false;}
return run(ast);}
export function calculateSignals(candles,{strategy='sma',fast=20,slow=50,period=14,oversold=30,overbought=70,entry='sma(20)>sma(50)',exit='sma(20)<sma(50)'}={}){
 const close=candles.map(c=>c.close);fast=Number(fast);slow=Number(slow);period=Number(period);oversold=Number(oversold);overbought=Number(overbought);
 if(!Number.isInteger(fast)||fast<1||fast>500||!Number.isInteger(slow)||slow<1||slow>500||!Number.isInteger(period)||period<2||period>500)throw Error('Indicator parameters must be valid integers between 1 and 500.');
 const enterAst=strategy==='rules'?parseRule(entry):null;const exitAst=strategy==='rules'?parseRule(exit):null;
 return candles.map((c,i)=>{let buy=false,sell=false;let a,b;
 if(strategy==='sma'||strategy==='ema'){const fn=strategy==='sma'?sma:ema;a=fn(close,fast,i);b=fn(close,slow,i);if(a!=null&&b!=null){buy=a>b;sell=a<b;}}
 else if(strategy==='rsi'){a=rsi(close,period,i);buy=a!==null&&a<=oversold;sell=a!==null&&a>=overbought;}
 else if(strategy==='bollinger'){a=sma(close,period,i);b=stdev(close,period,i);buy=a!=null&&c.close<a-2*b;sell=a!=null&&c.close>a;}
 else if(strategy==='breakout'){a=prevHigh(candles,period,i);b=prevLow(candles,period,i);buy=a!=null&&c.close>a;sell=b!=null&&c.close<b;}
 else if(strategy==='momentum'){a=roc(close,period,i);buy=a!=null&&a>0;sell=a!=null&&a<0;}
 else if(strategy==='rules'){buy=Boolean(evaluateRule(enterAst,candles,i,close));sell=Boolean(evaluateRule(exitAst,candles,i,close));}
 else throw Error('Unknown strategy: '+strategy);
 return {time:c.time,buy,sell,fast:finite(a),slow:finite(b)};});}
export function backtest(candles,params={}){
 if(!Array.isArray(candles)||candles.length<30)throw Error('At least 30 historical candles are required.');
 if(candles.length>15000)throw Error('Reduce candle range below 15,000 bars.');
 const initial=Number(params.capital??100000),feePct=Number(params.feePct??0.05),slippagePct=Number(params.slippagePct??0.03),allocation=Number(params.allocation??95);
 if(!(initial>0&&initial<=1e10)||feePct<0||feePct>10||slippagePct<0||slippagePct>10||allocation<=0||allocation>100)throw Error('Invalid backtest capital, fees, slippage or allocation.');
 const signals=calculateSignals(candles,params);let cash=initial,shares=0,costBasis=0,equity=[];let trades=[],closed=[],peak=initial,maxDD=0,opened=null;
 const fee=feePct/100,slip=slippagePct/100;
 // Decision from PREVIOUS completed bar; execute at next bar OPEN.
 for(let i=0;i<candles.length;i++){
  const bar=candles[i];const prior=signals[i-1];
  if(prior&&prior.sell&&shares>0){const price=bar.open*(1-slip);const gross=price*shares;const cost=gross*fee;cash+=gross-cost;const pnl=(gross-cost)-costBasis;closed.push(pnl);trades.push({date:bar.time,side:'SELL',qty:shares,price:Number(price.toFixed(2)),pnl:Number(pnl.toFixed(2))});shares=0;costBasis=0;opened=null;}
  if(prior&&prior.buy&&shares===0){const price=bar.open*(1+slip);const qty=Math.floor(Math.min(cash,cash*allocation/100)/(price*(1+fee)));if(qty>0){const total=qty*price*(1+fee);cash-=total;shares=qty;costBasis=total;opened=bar.time;trades.push({date:bar.time,side:'BUY',qty,price:Number(price.toFixed(2)),pnl:null});}}
  const value=cash+shares*bar.close;peak=Math.max(peak,value);maxDD=Math.max(maxDD,(peak-value)/peak);equity.push({time:bar.time,equity:Number(value.toFixed(2)),benchmark:Number((initial*bar.close/candles[0].close).toFixed(2))});
 }
 const final=equity.at(-1).equity;const returns=equity.slice(1).map((e,i)=>e.equity/equity[i].equity-1);const avg=returns.reduce((a,b)=>a+b,0)/(returns.length||1);const sd=Math.sqrt(returns.reduce((a,b)=>a+(b-avg)**2,0)/Math.max(1,returns.length-1));
 // Intraday Sharpe not annualized with 252 by default; caller should use daily bars for 252 convention.
 const annualFactor=params.unit==='minutes'?252*375/(Number(params.interval)||1):params.unit==='hours'?252*6:params.unit==='weeks'?52:params.unit==='months'?12:252;
 const years=Math.max(1/annualFactor,(candles.length-1)/annualFactor);const cagr=(Math.pow(final/initial,1/years)-1)*100;
 return {initial,final,returnPct:(final/initial-1)*100,cagr:Number.isFinite(cagr)?cagr:0,sharpe:sd?avg/sd*Math.sqrt(annualFactor):0,maxDrawdown:maxDD*100,trades,tradeCount:trades.length,closedCount:closed.length,winRate:closed.length?closed.filter(n=>n>0).length/closed.length*100:0,openPosition:shares,openSince:opened,equity,signals,warning:'Hypothetical, long-only fills at next candle open; no corporate actions, taxes, partial fills, spread, market impact, or exchange holidays modeled.'};
}
