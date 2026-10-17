// Exercise documented root launch commands against real HTTP endpoints and React.
const {spawn}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const evidence=process.env.EVIDENCE_DIR;
let server,browser;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function start(mode){
  const npm=process.platform==='win32'?'npm.cmd':'npm';
  server=spawn(npm,mode==='dev'?['run','dev']:['start'],{cwd:root,detached:process.platform!=='win32',shell:process.platform==='win32',env:{...process.env,UPSTOX_ANALYTICS_TOKEN:'',SMTP_HOST:'',RAZORPAY_KEY_ID:'',RAZORPAY_KEY_SECRET:''},stdio:['ignore','pipe','pipe']});
  let log='';server.stdout.on('data',d=>{log+=d;if(evidence)fs.appendFileSync(path.join(evidence,'root-launch.log'),d);});server.stderr.on('data',d=>{log+=d;if(evidence)fs.appendFileSync(path.join(evidence,'root-launch.log'),d);});
  const base=mode==='dev'?'http://localhost:5173':'http://localhost:3000';
  for(let i=0;i<300;i++){try{if((await fetch(base+'/login.html')).ok&&(await fetch(base+'/api/payments/razorpay/config')).ok)return base;}catch{}if(server.exitCode!==null)throw Error(log);await delay(100);}
  throw Error('Root launch timed out: '+log);
}
async function stop(){if(!server)return;const p=server;server=null;try{if(process.platform==='win32')spawn('taskkill',['/pid',String(p.pid),'/T','/F']);else process.kill(-p.pid,'SIGTERM');}catch{}await Promise.race([new Promise(r=>p.once('exit',r)),delay(5000)]);await delay(500);}
async function api(base,route,token,body,method=body?'POST':'GET'){
 const res=await fetch(base+'/api'+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});const value=await res.json();return {status:res.status,data:value.data??value};
}
async function login(base){const r=await api(base,'/auth/login',null,{email:'learner@indai.com',password:'Learn@1234'});assert.equal(r.status,201);return r.data;}
(async()=>{
 if(evidence)fs.mkdirSync(evidence,{recursive:true});
 // Fail clearly instead of accidentally testing an old running server.
 for(const port of [3000,5173]){let occupied=false;try{await fetch('http://localhost:'+port);occupied=true;}catch{}assert.ok(!occupied,`Port ${port} is already occupied; stop existing servers.`);}
 try{
  const base=await start('production');
  const a=await login(base);assert.equal((await api(base,'/auth/me',a.accessToken)).data.role,'learner');
  assert.equal((await api(base,'/users',a.accessToken)).status,403);
  assert.equal((await api(base,'/account/profile',a.accessToken,{firstName:'',lastName:'Sharma',email:'learner@indai.com'},'PATCH')).status,400);
  assert.equal((await api(base,'/auth/login',null,{email:'learner@indai.com',password:'wrong'})).status,401);
  const updated=await api(base,'/account/profile',a.accessToken,{firstName:'Rahul',lastName:'Sharma',email:'learner@indai.com',major:'Fresh root launcher verification'},'PATCH');assert.equal(updated.status,200);
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/login.html');await page.locator('#email').fill('learner@indai.com');await page.locator('#password').fill('Learn@1234');await page.locator('#login-btn').click();await page.waitForURL('**/learner-dashboard.html');await page.reload();await page.getByTitle('Profile',{exact:true}).click();assert.equal(await page.locator('#field-major').inputValue(),'Fresh root launcher verification');await delay(400);if(evidence)await page.screenshot({path:path.join(evidence,'production-profile.png'),fullPage:true});
  await stop();await start('production');const again=await login(base);assert.equal((await api(base,'/auth/me',again.accessToken)).data.major,'Fresh root launcher verification');
  console.log('PASS npm start at 3000 serves React and APIs; browser login/reload, invalid password and profile persistence across root server restart');
  await stop();const dev=await start('dev');const d=await login(dev);assert.equal((await api(dev,'/auth/me',d.accessToken)).data.role,'learner');
  await page.goto(dev+'/login.html');await page.locator('#email').fill('learner@indai.com');await page.locator('#password').fill('Learn@1234');await page.locator('#login-btn').click();await page.waitForURL('**/learner-dashboard.html');await page.locator('#tab-trading').click();await page.getByRole('button',{name:'Place virtual BUY',exact:true}).waitFor();await page.reload();await page.getByTitle('Profile',{exact:true}).click();assert.equal(await page.locator('#field-major').inputValue(),'Fresh root launcher verification');
  assert.deepEqual(errors,[]);console.log('PASS npm run dev at 5173 connects React through Vite proxy to real NestJS on 3000, login and reload succeed');
 }finally{await browser?.close();await stop();}
})().catch(e=>{console.error(e);process.exitCode=1;});
