// Optional: populate NEW learner accounts via the same authenticated API used by React.
const base=(process.env.INDAI_DEMO_URL||'http://localhost:3000').replace(/\/$/,'');
async function request(route,token,body){
 const r=await fetch(base+'/api'+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 const value=await r.json();if(!r.ok)throw Error(value.message||JSON.stringify(value));return value.data??value;
}
try{
 const config=await request('/public/config');if(!config.demoMode)throw Error('This command requires demo mode.');
 for(const email of ['asha.demo@indai.com','neha.demo@indai.com','vikram.demo@indai.com']){
  const auth=await request('/auth/login',null,{email,password:'Learn@1234'});
  const portfolio=await request('/algo/portfolio',auth.accessToken);
  if(portfolio.orders?.length || portfolio.positions?.length){console.log(email+': existing portfolio preserved.');continue;}
  for(const symbol of ['TCS','RELIANCE']){
   const result=await request('/algo/orders',auth.accessToken,{key:'DEMO|'+symbol,symbol,exchange:'DEMO',side:'BUY',type:'MARKET',qty:1});
   if(result.order?.status!=='FILLED')throw Error(email+': order did not fill; inspect the trading screen before retrying.');
  }
  const result=await request('/algo/portfolio',auth.accessToken);
  console.log(email+': 2 virtual orders prepared; cash '+result.cash+'.');
 }
}catch(error){console.error('Demo preparation: '+error.message+' Start the built app first, then retry.');process.exitCode=1;}
