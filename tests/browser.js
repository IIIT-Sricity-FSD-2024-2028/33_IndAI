import assert from 'node:assert/strict';
import { spawn,spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const testPort=process.env.TEST_PORT || '3321';
const base='http://localhost:'+testPort;
const directory=await mkdtemp(join(tmpdir(),'indai-browser-'));
const root=new URL('../',import.meta.url);
const env={...process.env, NODE_ENV:'development',DEMO_MODE:'true',MARKET_SOURCE:'demo',PORT:testPort,DATA_DIR:directory,PUBLIC_URL:base};
let processServer,browser;const extraBrowsers=[];let contextsUsed=0;
const launchOptions={headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:process.env.PLAYWRIGHT_SINGLE_PROCESS==='true'?['--single-process','--no-zygote','--in-process-gpu']:[]};
const pass='IndAI-Demo-2026';
const sleeper=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try {
  const setup=spawnSync(process.execPath,['scripts/setup.js'],{env,cwd:root,encoding:'utf8'});
  assert.equal(setup.status,0,setup.stderr);
  const counts=spawnSync(process.execPath,['--input-type=module','-e',
    "import {openDatabase} from './back-end/db.js'; const db=openDatabase(); console.log(JSON.stringify(db.all('SELECT role,count(*) n FROM users GROUP BY role ORDER BY role'))); db.close();"],{env,cwd:root,encoding:'utf8'});
  assert.equal(counts.status,0,counts.stderr);
  assert.deepEqual(Object.fromEntries(JSON.parse(counts.stdout).map(r=>[r.role,r.n])),{admin:1,instructor:32,provider:18,student:300,superadmin:1});
  processServer=spawn(process.execPath,[fileURLToPath(new URL('../back-end/server.js',import.meta.url)),'--serve'],{env,cwd:tmpdir(),stdio:'inherit'});
  let started=false;
  for(let i=0;i<40;i++) {
    try {if((await fetch(base+'/api/ready')).ok){started=true;break;}} catch {}
    await sleeper(200);
  }
  assert(started,'Built app did not report readiness.');
  const missing=await fetch(base+'/api/unknown');
  assert.equal(missing.status,404);
  assert.equal((await missing.json()).code,'NOT_FOUND');
  const reloaded=await fetch(base+'/trading');
  assert.match(await reloaded.text(),/id="root"/);
  browser=await chromium.launch(launchOptions);
  const errors=[];
  async function page(viewport={width:1440,height:1000}) {
    const owner=process.env.PLAYWRIGHT_SINGLE_PROCESS==='true'&&contextsUsed++>0?await chromium.launch(launchOptions):browser;
    if(owner!==browser)extraBrowsers.push(owner);
    const context=await owner.newContext({viewport});
    await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
    const tab=await context.newPage();
    tab.on('pageerror',error=>errors.push(error.message));
    tab.on('dialog',dialog=>dialog.accept());
    return tab;
  }
  async function login(address) {
    const tab=await page();
    await tab.goto(base+'/login');
    await tab.getByLabel('Email address',{exact:true}).first().fill(address);
    await tab.getByLabel('Password',{exact:true}).first().fill(pass);
    await tab.getByRole('button',{name:'Sign in',exact:true}).click();
    await tab.getByRole('heading',{name:/Welcome/}).waitFor();
    return tab;
  }
  const landing=await page({width:390,height:844});
  await landing.goto(base);
  await landing.getByRole('heading',{name:'Learn the market. Find your process.'}).waitFor();
  assert(await landing.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth));
  await landing.getByRole('link',{name:'Sign in',exact:true}).first().click();
  await landing.getByRole('heading',{name:'Explore a demo workspace'}).waitFor();
  const quickAccounts=[
    ['Free learner','student1@indai.test','student','basic'],
    ['Pro learner','student201@indai.test','student','pro'],
    ['Plus learner','student261@indai.test','student','plus'],
    ['Instructor','instructor1@indai.test','instructor'],
    ['Course provider','provider1@indai.test','provider'],
    ['Admin','users@indai.test','admin'],
    ['Super admin','super@indai.test','superadmin']
  ];
  for (const [label,email,role,plan] of quickAccounts) {
    await landing.goto(base+'/login');
    await landing.getByRole('button',{name:'Quick login as '+label,exact:true}).click();
    await landing.getByRole('heading',{name:/Welcome/}).waitFor();
    assert.match(landing.url(),/\/overview$/);
    const me=await (await landing.request.get(base+'/api/me')).json();
    assert.equal(me.email,email);
    assert.equal(me.role,role);
    if(plan) assert.equal(me.plan,plan);
  }
  await landing.context().close();
  console.log('PASS mobile homepage, sign-in navigation, and all '+quickAccounts.length+' quick demo logins');
  const learner=await page();
  await learner.goto(base+'/register');
  await learner.getByLabel('Full name').fill('Avery O’Malley');
  await learner.getByLabel('Email address',{exact:true}).first().fill('avery@example.test');
  await learner.getByLabel('Password',{exact:true}).first().fill(pass);
  await learner.getByLabel('Confirm password').fill(pass);
  await learner.getByRole('button',{name:'Submit application'}).click();
  const notice=learner.getByText('Demo verification code');
  await notice.waitFor();
  const code=(await notice.innerText()).match(/\d{6}/)[0];
  await learner.getByLabel('Verification code').fill(code);
  await learner.getByRole('button',{name:'Verify and continue'}).click();
  await learner.getByRole('heading',{name:'Awaiting administrator review'}).waitFor();
  await learner.goto(base+'/trading');
  await learner.getByRole('heading',{name:'Awaiting administrator review'}).waitFor();

  const admin=await login('users@indai.test');
  await admin.getByRole('link',{name:'Operations',exact:true}).click();
  await admin.getByPlaceholder('Search queue').fill('avery@example.test');
  await admin.getByRole('button',{name:'Approve',exact:true}).click();
  await admin.getByRole('row').filter({hasText:'avery@example.test'}).getByText('approved',{exact:true}).waitFor();
  await learner.reload();
  await learner.getByRole('heading',{name:'Welcome, Avery'}).waitFor();
  await learner.goto(base+'/guidance');
  await learner.getByText('This feature requires Pro or Plus.').waitFor();
  console.log('PASS signup, demo verification, pending gate, and admin approval');

  await learner.goto(base+'/courses');
  await learner.getByRole('article').filter({hasText:'Paper Trading Foundations'}).getByRole('link').click();
  await learner.getByRole('button',{name:'Enroll',exact:true}).click();
  await learner.getByText('Module 1 · Core concept',{exact:true}).click();
  await learner.getByRole('button',{name:'Mark complete',exact:true}).click();
  await learner.getByText('complete',{exact:true}).waitFor();
  await learner.goto(base+'/support');
  await learner.getByLabel('Subject').fill('Paper practice help');
  await learner.getByLabel('How can we help?').fill('Where can I see my reserved paper cash?');
  await learner.getByRole('button',{name:'Create ticket'}).click();
  await learner.getByRole('heading',{name:'Paper practice help'}).waitFor();
  await learner.reload();
  await learner.getByText('Where can I see my reserved paper cash?').waitFor();
  console.log('PASS course enrollment and progress, ticket persistence');

  await learner.setViewportSize({width:390,height:844});
  await learner.goto(base+'/trading');
  await learner.getByRole('heading',{name:'Price chart'}).waitFor();
  assert(await learner.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth));
  await learner.getByRole('button',{name:'Submit paper buy'}).click();
  await learner.getByRole('status').getByText('filled',{exact:true}).waitFor();
  await learner.getByLabel('Order type').selectOption('limit');
  await learner.getByLabel('Limit price (₹)').fill('500');
  await learner.getByRole('button',{name:'Submit paper buy'}).click();
  const working=learner.getByRole('row').filter({hasText:'Limit ₹500'});
  await working.getByRole('button',{name:'Cancel',exact:true}).click();
  await learner.getByText('No working orders.').waitFor();
  await learner.goto(base+'/portfolio');
  await learner.getByRole('heading',{name:'Positions'}).waitFor();
  await learner.getByRole('table').first().getByText('RELIANCE',{exact:true}).waitFor();
  console.log('PASS mobile trading, market fill, limit order cancellation, and portfolio route refresh');

  const basic=await login('student1@indai.test');
  await basic.goto(base+'/plans');
  const card=(tab,title)=>tab.locator('.plan-card').filter({has:tab.getByRole('heading',{name:title,exact:true})});
  await card(basic,'Free').getByText('Current plan',{exact:true}).waitFor();
  assert(await card(basic,'Plus').getByRole('button',{name:'Simulate Plus',exact:true}).isEnabled());
  await basic.getByRole('button',{name:'Simulate Pro',exact:true}).click();
  await basic.getByText('Simulated payment confirmed.').waitFor();
  await card(basic,'Pro').getByText('Current plan',{exact:true}).waitFor();
  assert.equal(await card(basic,'Pro').getByRole('button').count(),0);
  const upgrade=card(basic,'Plus').getByRole('button',{name:'Upgrade to Plus',exact:true});
  await card(basic,'Plus').getByText(/Plus starts after your current Pro term ends on .* IST/).waitFor();
  await basic.getByText(/Paid through .* IST/).waitFor();
  const upgradeConfirmation=basic.waitForEvent('dialog');
  await upgrade.click();
  assert.match((await upgradeConfirmation).message(),/Plus starts after your current Pro term ends on .* IST.*No payment will be charged/);
  await basic.getByText(/Scheduled PLUS term begins .* IST/).waitFor();
  await card(basic,'Pro').getByText('Current plan',{exact:true}).waitFor();
  assert.equal(await basic.locator('.plan-card button').count(),0);
  const billing=await (await basic.request.get(base+'/api/plans')).json();
  assert.equal(billing.current.plan,'pro');
  assert.equal(billing.scheduled[0].plan,'plus');
  assert.equal(billing.scheduled[0].starts,billing.current.ends);
  await basic.reload();
  await basic.getByText(/Scheduled PLUS term begins .* IST/).waitFor();
  assert.equal(await basic.locator('.plan-card button').count(),0);
  await basic.goto(base+'/guidance');
  await basic.getByRole('heading',{name:'provider directory',exact:true}).waitFor();
  await basic.getByRole('button',{name:'instructor',exact:true}).click();
  await basic.getByText('This feature requires Plus.',{exact:false}).waitFor();
  console.log('PASS simulated Pro upgrade unlocks provider guidance only');

  const plus=await login('student299@indai.test');
  await plus.route('**/api/me',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,json:{...await response.json(),plan:'basic'}});
  });
  await plus.route('**/api/plans',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,json:{...await response.json(),live:true}});
  });
  await plus.goto(base+'/plans');
  await card(plus,'Plus').getByText('Current plan',{exact:true}).waitFor();
  assert.equal(await plus.locator('.plan-card').count(),3);
  assert.equal(await plus.locator('.plan-card button').count(),0);
  await plus.getByRole('heading',{name:'Payment history',exact:true}).waitFor();
  await plus.unroute('**/api/me');
  await plus.unroute('**/api/plans');
  console.log('PASS Free purchase options, deferred Pro upgrade, scheduled term, and Plus purchase controls');
  await plus.goto(base+'/guidance');
  const specialist=plus.getByRole('heading',{name:'instructor directory',exact:true}).locator('..');
  const available=specialist.locator('.record').filter({hasText:'Maya Menon'});
  await available.getByRole('button',{name:'Request',exact:true}).click();
  await available.getByLabel('Your learning goals').fill('Improve my paper order process.');
  await available.getByRole('button',{name:'Send request'}).click();
  await plus.getByText('Improve my paper order process.').waitFor();
  const instructor=await login('instructor1@indai.test');
  await admin.goto(base+'/admin');
  assert.equal(await admin.getByRole('link',{name:'Course review',exact:true}).count(),0);
  assert.equal(await admin.getByRole('button',{name:'Course review',exact:true}).count(),0);
  for (const path of ['/admin?queue=courses','/courses','/courses/1']) {
    await admin.goto(base+path);
    await admin.getByText('This page is unavailable for your role.').waitFor();
  }
  const superAdmin=await login('super@indai.test');
  await superAdmin.goto(base+'/admin?queue=courses');
  await superAdmin.getByRole('link',{name:'Review course',exact:true}).first().click();
  await superAdmin.getByRole('button',{name:'Publish course',exact:true}).waitFor();
  console.log('PASS Course Review is limited to Super Admin');
  const draft=await instructor.request.post(base+'/api/courses',{headers:{'X-IndAI-Request':'1'},data:{
    title:'Browser deletion draft',description:'A temporary course for deletion verification.',outcomes:'Verify draft deletion.',difficulty:'introductory',prerequisites:'',policy:'basic'
  }});
  assert.equal(draft.status(),201);
  await instructor.goto(base+'/courses');
  const draftCard=instructor.locator('.course-card').filter({hasText:'Browser deletion draft'});
  await draftCard.getByRole('button',{name:'Delete course'}).click();
  await instructor.getByRole('status').filter({hasText:'Browser deletion draft was deleted.'}).waitFor();
  assert.equal(await draftCard.count(),0);
  console.log('PASS instructor can confirm deletion of an owned draft');
  await admin.goto(base+'/admin');
  const broadcastForm=admin.getByRole('heading',{name:'Send a notification'}).locator('..');
  await broadcastForm.getByLabel('Audience').selectOption('instructors');
  await broadcastForm.getByLabel('Title').fill('Browser verification');
  await broadcastForm.getByLabel('Message').fill('An in-app message for the isolated demo database.');
  const confirmation=admin.waitForEvent('dialog');
  await broadcastForm.getByRole('button',{name:'Review recipients'}).click();
  assert.match((await confirmation).message(),/Estimated recipients: [1-9]\d*/);
  await broadcastForm.getByRole('status').filter({hasText:/Notification sent to/}).waitFor();
  const bell=instructor.locator('.notification-bell');
  await instructor.reload();
  await bell.locator('.notification-badge').waitFor();
  await instructor.getByRole('button',{name:'Switch to dark mode'}).click();
  assert.equal(await instructor.evaluate(()=>document.documentElement.dataset.theme),'dark');
  assert(await bell.locator('.notification-badge').isVisible());
  await instructor.getByRole('button',{name:'Switch to light mode'}).click();
  await bell.focus();
  await instructor.keyboard.press('Enter');
  const notification=instructor.locator('.record').filter({hasText:'Browser verification'});
  await notification.getByRole('button',{name:'Open notification'}).click();
  await notification.getByText('read',{exact:true}).waitFor();
  const markAll=instructor.getByRole('button',{name:'Mark all as read'});
  if(await markAll.isVisible()) await markAll.click();
  await bell.locator('.notification-badge').waitFor({state:'hidden'});
  await instructor.reload();
  await instructor.getByRole('heading',{name:'Notifications'}).waitFor();
  assert.equal(await bell.getAttribute('aria-label'),'Notifications');
  console.log('PASS broadcast confirmation, keyboard inbox access, and unread badge updates');
  await instructor.goto(base+'/guidance');
  const pending=instructor.locator('.record').filter({hasText:'Improve my paper order process.'});
  await pending.getByRole('button',{name:'Accept',exact:true}).click();
  await pending.getByText('active',{exact:true}).waitFor();
  await plus.reload();
  await plus.getByText('active',{exact:true}).waitFor();
  console.log('PASS Plus instructor request and acceptance');

  async function providerTabName(){const response=await admin.request.get(base+'/api/members?search=provider1@indai.test');const data=await response.json();return data.members[0].name;}
  await plus.getByRole('button',{name:'provider',exact:true}).click();
  const directoryNode=plus.getByRole('heading',{name:'provider directory',exact:true}).locator('..');
  const providerName=(await providerTabName());
  const search=directoryNode.getByRole('searchbox',{name:'Search course providers'});
  await search.fill('No specialist with this name');
  await search.press('Enter');
  await directoryNode.getByText(/No specialists match your search/).waitFor();
  await directoryNode.getByRole('button',{name:'Clear search'}).click();
  await directoryNode.getByText(providerName,{exact:true}).waitFor();
  await search.fill(providerName.toUpperCase());
  await search.press('Enter');
  await directoryNode.locator('.record').nth(1).waitFor({state:'hidden'});
  await directoryNode.getByText(providerName,{exact:true}).waitFor();
  assert.equal(await directoryNode.locator('.record').count(),1);
  const target=directoryNode.locator('.record').filter({hasText:providerName});
  await target.getByRole('button',{name:'Request',exact:true}).click();
  await target.getByLabel('Your learning goals').fill('Plan my first three trading lessons.');
  await target.getByRole('button',{name:'Send request'}).click();
  await plus.getByText('Plan my first three trading lessons.').waitFor();
  const providerTab=await login('provider1@indai.test');
  await providerTab.goto(base+'/guidance');
  const providerRow=providerTab.locator('.record').filter({hasText:'Plan my first three trading lessons.'});
  await providerRow.getByRole('button',{name:'Accept',exact:true}).click();
  await providerRow.getByText('active',{exact:true}).waitFor();
  console.log('PASS Plus provider request and acceptance');
  await instructor.goto(base+'/portfolio');
  await instructor.getByRole('button',{name:'Switch to dark mode'}).click();
  assert.equal(await instructor.evaluate(()=>document.documentElement.dataset.theme),'dark');
  await instructor.reload();
  await instructor.getByRole('button',{name:'Switch to light mode'}).waitFor();
  await instructor.getByRole('button',{name:'Buy shares',exact:true}).click();
  const orderDialog=instructor.getByRole('dialog',{name:'Portfolio order'});
  await orderDialog.getByRole('button',{name:'Change stock'}).click();
  await orderDialog.getByLabel('Search NSE stocks').fill('INFY');
  await orderDialog.getByRole('button',{name:/^INFY /}).click();
  await orderDialog.getByRole('button',{name:'Submit paper buy',exact:true}).click();
  await orderDialog.getByText('filled',{exact:true}).waitFor();
  await instructor.keyboard.press('Escape');
  await orderDialog.waitFor({state:'hidden'});
  console.log('PASS remembered theme and portfolio order dialog');
  await instructor.goto(base+'/trading');
  await instructor.getByRole('button',{name:'Stocks & watchlists',exact:true}).click();
  await instructor.getByLabel('Search NSE stocks').fill('M&M');
  await instructor.locator('.instrument-picker .symbol-results button').filter({hasText:'M&M'}).first().click();
  await instructor.getByRole('button',{name:'Back to chart',exact:true}).click();
  await instructor.getByRole('heading',{name:'M&M',exact:true}).waitFor();
  await instructor.reload();
  await instructor.getByRole('heading',{name:'M&M',exact:true}).waitFor();
  assert((await instructor.request.get(base+'/api/trading/catalog').then(r=>r.json())).count>2500);
  console.log('PASS full catalogue search and special-symbol route refresh');
  await instructor.getByRole('button',{name:'Open profile',exact:true}).click();
  const profile=instructor.getByRole('dialog');
  await profile.getByText('instructor1@indai.test',{exact:true}).waitFor();
  const brand=instructor.locator('.sidebar .brand');
  assert.equal(await brand.evaluate(node=>getComputedStyle(node).color),'rgb(243, 251, 246)');
  await instructor.keyboard.press('Escape');
  await profile.waitFor({state:'hidden'});
  assert(await instructor.getByRole('button',{name:'Open profile',exact:true}).evaluate(node=>node===document.activeElement));
  await basic.getByRole('button',{name:'Open profile',exact:true}).click();
  const learnerProfile=basic.getByRole('dialog');
  await learnerProfile.getByText('Change password',{exact:true}).click();
  await learnerProfile.getByLabel('Current password',{exact:true}).fill(pass);
  const changedPassword='Isolated-Browser-Password-2026';
  await learnerProfile.getByLabel('New password',{exact:true}).fill(changedPassword);
  await learnerProfile.getByLabel('Confirm new password',{exact:true}).fill(changedPassword);
  await learnerProfile.getByRole('button',{name:'Update password'}).click();
  await learnerProfile.getByText('Password updated. Other sessions were signed out.').waitFor();
  await admin.goto(base+'/commerce');
  await admin.getByRole('button',{name:'Open profile',exact:true}).click();
  const adminProfile=admin.getByRole('dialog');
  await adminProfile.getByText('users@indai.test',{exact:true}).waitFor();
  assert.equal(await adminProfile.getByText('Change password',{exact:true}).count(),0);
  await adminProfile.getByRole('button',{name:'Close profile'}).click();
  const proposal=admin.locator('.record').filter({has:admin.locator('select[name="action"]')}).first();
  const decision=proposal.locator('select[name="action"]');
  await decision.waitFor();
  assert.equal(await proposal.getByLabel(/Counteroffer amount/).count(),0);
  await decision.selectOption('counter');
  const counter=proposal.getByLabel(/Counteroffer amount/);
  await counter.fill('1234.50');
  await decision.selectOption('reject');
  await proposal.getByLabel('Rejection reason').waitFor();
  assert.equal(await counter.count(),0);
  await decision.selectOption('counter');
  assert.equal(await counter.inputValue(),'');
  await decision.selectOption('accept');
  await proposal.getByLabel('Decision notes').waitFor();
  assert.equal(await counter.count(),0);
  await superAdmin.goto(base+'/admin?queue=staff');
  await superAdmin.getByLabel('Search queue').fill('users@indai.test');
  const adminRow=superAdmin.getByRole('row').filter({hasText:'users@indai.test'});
  await adminRow.locator('summary').filter({hasText:'Suspend Admin'}).click();
  await adminRow.getByLabel('Reason',{exact:true}).fill('Suspend an isolated demo account.');
  await adminRow.getByRole('button',{name:'Suspend Admin'}).click();
  await adminRow.getByText('suspended',{exact:true}).waitFor();
  assert.equal((await admin.request.get(base+'/api/me')).status(),401);
  console.log('PASS profile dialog, password change, dark logo, licensing decision fields, and Admin suspension');
  assert.deepEqual(errors,[]);
} finally {
  for(const instance of extraBrowsers)await instance.close();
  await browser?.close();
  if(processServer?.exitCode===null) {
    processServer.kill();
    await once(processServer,'exit');
  }
  await rm(directory,{recursive:true,force:true});
}
