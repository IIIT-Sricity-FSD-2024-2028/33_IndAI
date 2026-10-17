const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'indai-holdings-')),port=34861,base=`http://127.0.0.1:${port}`;
 const server=spawn(process.execPath,['dist/main.js'],{cwd:path.join(root,'back-end'),env:{...process.env,PORT:String(port),DATA_DIR:dir,DEMO_MODE:'true',COOKIE_SECURE:'false',NODE_ENV:'test',UPSTOX_ANALYTICS_TOKEN:'',RATE_LIMIT_SENSITIVE_MAX:'1000',RATE_LIMIT_GENERAL_MAX:'10000'},stdio:'ignore'});
 let browser;const errors=[];
 async function api(page,route,body){return page.evaluate(async({route,body})=>{const r=await fetch('/api'+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+sessionStorage.getItem('indai_token')},body:body?JSON.stringify(body):undefined});const v=await r.json();if(!r.ok)throw Error(JSON.stringify(v));return v.data;},{route,body});}
 try{
  for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  // Quotes may arrive before the account; the order form must wait for both.
  await page.route('**/api/algo/portfolio',async route=>{await new Promise(r=>setTimeout(r,250));await route.continue();});
  await page.goto(base+'/login.html');await page.locator('#email').fill('neha.demo@indai.com');await page.locator('#password').fill('Learn@1234');await page.locator('#login-btn').click();await page.waitForURL('**/learner-dashboard.html');
  for(const symbol of ['TCS','RELIANCE'])await api(page,'/algo/orders',{key:'DEMO|'+symbol,symbol,exchange:'DEMO',side:'BUY',type:'MARKET',qty:2});
  await page.reload();const holdings=page.locator('.card').filter({has:page.getByText('Holdings',{exact:true})});for(const width of [390,768,1440]){
   await page.setViewportSize({width,height:1000});
   const buy=await holdings.getByRole('button',{name:'Buy TCS',exact:true}).boundingBox(),sell=await holdings.getByRole('button',{name:'Sell TCS',exact:true}).boundingBox();
   assert.ok(buy&&sell);assert.ok(Math.abs((buy.y+buy.height/2)-(sell.y+sell.height/2))<2,'Buy/Sell must share a row at '+width);assert.ok(sell.x>=buy.x+buy.width,'Sell must follow Buy at '+width);
  }
  if(process.env.HOLDINGS_SCREENSHOT)await holdings.screenshot({path:process.env.HOLDINGS_SCREENSHOT});
  await holdings.getByRole('button',{name:'Sell TCS',exact:true}).click();
  await page.getByRole('button',{name:'Place virtual SELL',exact:true}).waitFor();assert.equal(await page.getByLabel('Search stocks',{exact:true}).inputValue(),'TCS');
  // Clicking the shortcut only prepares the existing form; it does not place an order.
  assert.equal((await api(page,'/algo/portfolio')).orders.length,2);
  await page.locator('#trade-quantity').fill('3');await page.getByRole('button',{name:'Place virtual SELL',exact:true}).click();await page.getByRole('alert').filter({hasText:'You do not hold enough shares'}).waitFor();assert.equal((await api(page,'/algo/portfolio')).orders.length,2);
  await page.locator('#trade-quantity').fill('1');await page.getByRole('button',{name:'Place virtual SELL',exact:true}).click();await page.getByRole('status').filter({hasText:'SELL 1 TCS: FILLED'}).waitFor();
  let p=await api(page,'/algo/portfolio');assert.equal(p.positions.find(x=>x.instrument_key==='DEMO|TCS').qty,1);
  await page.locator('#tab-portfolio').click();await page.getByRole('button',{name:'Buy TCS',exact:true}).click();await page.getByRole('button',{name:'Place virtual BUY',exact:true}).waitFor();await page.getByRole('button',{name:'Place virtual BUY',exact:true}).click();await page.getByRole('status').filter({hasText:'BUY 1 TCS: FILLED'}).waitFor();
  p=await api(page,'/algo/portfolio');assert.equal(p.positions.find(x=>x.instrument_key==='DEMO|TCS').qty,2);
  const ownHoldings=page.locator('.card').filter({has:page.getByText('Your holdings',{exact:true})});await page.locator('#trade-type').selectOption('LIMIT');await page.locator('#trade-quantity').fill('10');await ownHoldings.getByRole('button',{name:'Sell RELIANCE',exact:true}).click();
  await page.getByRole('button',{name:'Place virtual SELL',exact:true}).waitFor();assert.equal(await page.getByLabel('Search stocks',{exact:true}).inputValue(),'RELIANCE');assert.equal(await page.locator('#trade-type').inputValue(),'MARKET');assert.equal(await page.locator('#trade-quantity').inputValue(),'1');
  await page.getByRole('button',{name:'Place virtual SELL',exact:true}).click();await page.getByRole('status').filter({hasText:'SELL 1 RELIANCE: FILLED'}).waitFor();p=await api(page,'/algo/portfolio');assert.equal(p.positions.find(x=>x.instrument_key==='DEMO|RELIANCE').qty,1);assert.equal(p.orders[0].instrument_key,'DEMO|RELIANCE');
  await page.reload();await page.getByRole('button',{name:'Sell RELIANCE',exact:true}).waitFor();p=await api(page,'/algo/portfolio');assert.equal(p.positions.find(x=>x.instrument_key==='DEMO|RELIANCE').qty,1);assert.deepEqual(errors,[]);
  console.log('PASS Side-by-side buttons at 390/768/1440px and Holdings Buy/Sell shortcuts: selected instrument and side, explicit order confirmation, oversell validation, real fills, in-workspace instrument switching, clean form defaults and reload persistence.');
 }finally{await browser?.close();await new Promise(r=>{server.once('exit',r);server.kill();});fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
