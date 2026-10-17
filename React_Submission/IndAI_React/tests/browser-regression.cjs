// Regression coverage for the reported provider, profile, upload and trading failures.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..'), dir=fs.mkdtempSync(path.join(os.tmpdir(),'indai-regression-')), port=34844, base=`http://127.0.0.1:${port}`;
 const server=spawn(process.execPath,['dist/main.js'],{cwd:path.join(root,'back-end'),env:{...process.env,NODE_ENV:'test',PORT:String(port),DATA_DIR:dir,DEMO_MODE:'true',COOKIE_SECURE:'false',UPSTOX_ANALYTICS_TOKEN:'',RAZORPAY_KEY_ID:'',RAZORPAY_KEY_SECRET:'',SMTP_HOST:'',RATE_LIMIT_SENSITIVE_MAX:'5000',RATE_LIMIT_GENERAL_MAX:'20000'},stdio:'ignore'});
 let browser;
 const failures=[], contexts=[];
 const evidence=process.env.EVIDENCE_DIR; if(evidence)fs.mkdirSync(evidence,{recursive:true});
 async function api(page,route,body,method=body?'POST':'GET'){
  return page.evaluate(async ({route,body,method})=>{const r=await fetch('/api'+route,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+sessionStorage.getItem('indai_token')},body:body?JSON.stringify(body):undefined});const p=await r.json();if(!r.ok)throw Error(JSON.stringify(p));return p.data??p;},{route,body,method});
 }
 async function login(email,password){const context=await browser.newContext({viewport:{width:1440,height:1000}});contexts.push(context);const p=await context.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>failures.push(e.message));await p.goto(base+'/login.html');await p.locator('#email').fill(email);await p.locator('#password').fill(password);await p.locator('#login-btn').click();await p.waitForURL('**/*dashboard.html');return p;}
 async function waitText(p,text){await p.getByText(text,{exact:true}).first().waitFor();}
 async function save(p,name='Save'){const dialog=p.getByRole('dialog');await dialog.getByRole('button',{name,exact:true}).click();await dialog.waitFor({state:'hidden'});}
 try{
  for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const provider=await login('provider@indai.com','Prov@1234');
  for(const [email,password] of [['provider@indai.com','Prov@1234'],['learner@indai.com','Learn@1234'],['instructor@indai.com','Inst@1234'],['admin@indai.com','Admin@1234'],['paymentadmin@indai.com','Pay@1234'],['superadmin@indai.com','Admin@1234']]){
   const p=await login(email,password);await p.getByTitle('Profile',{exact:true}).click();const d=p.getByRole('dialog',{name:'My Profile'});await d.waitFor();assert.equal(await d.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');await d.locator('#field-major').fill('React Regression');await d.getByRole('button',{name:'Save profile',exact:true}).click();await p.getByText('Profile updated.',{exact:true}).waitFor().catch(async e=>{console.log((await p.locator('body').innerText()).slice(-4000));await p.screenshot({path:path.join(os.tmpdir(),'indai-profile-failure.png'),fullPage:true});throw e;});assert.equal((await api(p,'/auth/me')).major,'React Regression');await p.keyboard.press('Escape');await d.waitFor({state:'hidden'});
   await p.reload();await p.getByTitle('Profile',{exact:true}).click();await p.getByRole('dialog',{name:'My Profile'}).waitFor();assert.equal(await p.locator('#field-major').inputValue(),'React Regression');
   await p.waitForTimeout(400);if(evidence&&email.startsWith('learner'))await p.screenshot({path:path.join(evidence,'profile-reload.png'),fullPage:true});
   await p.keyboard.press('Escape');
  }
  await provider.getByTitle('Profile',{exact:true}).click();await provider.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
  console.log('PASS profile opens, edits, saves, reloads and closes for all six roles');
  await provider.getByRole('button',{name:'+ New Course',exact:true}).click();
  for(const [field,value]of [['title','Browser Regression Course'],['description','A course created through the React form.'],['category','Fundamentals']])await provider.locator('#field-'+field).fill(value);
  await save(provider);await waitText(provider,'Browser Regression Course');
  let course=(await api(provider,'/courses/provider/u5')).find(c=>c.title==='Browser Regression Course');assert.ok(course);
  await provider.locator('#tab-videos').click();await provider.locator('#upload-course-video').selectOption(course.id);
  await provider.getByLabel('Upload video',{exact:true}).setInputFiles(path.join(__dirname,'fixtures/lesson.webm'));
  await provider.locator('#upload-title-video').fill('Browser Video Lesson');
  await provider.getByRole('button',{name:'Upload video',exact:true}).click();
  await waitText(provider,'Browser Video Lesson');
  const pv=provider.locator('video').first();await pv.waitFor();await pv.evaluate(async video=>{video.muted=true;await video.play();});
  const modules=await api(provider,`/courses/${course.id}/modules`);assert.equal(modules.length,1);assert.equal(modules[0].title,'Browser Video Lesson');
  await provider.locator('#tab-materials').click();await provider.locator('#upload-course-pdf').selectOption(course.id);
  await provider.getByLabel('Upload pdf',{exact:true}).setInputFiles({name:'lesson.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF')});
  await provider.locator('#upload-title-pdf').fill('Browser PDF Lesson');await provider.getByRole('button',{name:'Upload PDF',exact:true}).click();await waitText(provider,'Browser PDF Lesson');
  const pdf=(await api(provider,`/courses/${course.id}/modules`)).find(m=>m.type==='document');assert.ok(pdf);assert.equal((await provider.request.get(base+pdf.url)).status(),200);assert.equal((await provider.request.get(base+pdf.url.split('?')[0])).status(),403);
  console.log('PASS course creation, video playback, PDF upload, signed media access and immediate module refresh');
  await provider.locator('#tab-quizzes').click();await provider.getByRole('button',{name:'+ Create Quiz',exact:true}).click();
  await provider.locator('#quiz-title').fill('Browser Assessment');await provider.locator('#quiz-course').selectOption(course.id);
  await provider.getByLabel('Question 1',{exact:true}).fill('What is paper trading?');await provider.getByLabel('Option 1 for question 1',{exact:true}).fill('Trading with virtual funds');await provider.getByLabel('Option 2 for question 1',{exact:true}).fill('Trading real money');await save(provider,'Save quiz');await waitText(provider,'Browser Assessment');
  await provider.locator('#tab-courses').click();
  const card=provider.locator('.card').filter({has:provider.getByText('Browser Regression Course',{exact:true})});
  await card.getByRole('button',{name:'Submit review',exact:true}).click();
  const payment=await login('paymentadmin@indai.com','Pay@1234');await payment.locator('#tab-commercial').click();const reviewCard=payment.locator('.flex-between').filter({has:payment.getByText('Browser Regression Course',{exact:true})});await reviewCard.getByRole('button',{name:'Review',exact:true}).click();await payment.getByRole('button',{name:'Sanction & Publish',exact:true}).click();await payment.getByRole('dialog').waitFor({state:'hidden'});
  const learner=await login('learner@indai.com','Learn@1234');await learner.locator('#tab-learning').click();const learnerCard=learner.locator('.card').filter({has:learner.getByText('Browser Regression Course',{exact:true})});await learnerCard.getByRole('button',{name:'Enroll',exact:true}).click();await learnerCard.getByRole('button',{name:'Open course',exact:true}).click();const lessonDialog=learner.getByRole('dialog',{name:'Browser Regression Course'});await lessonDialog.getByText('Browser Video Lesson',{exact:true}).waitFor();await lessonDialog.locator('video').evaluate(async v=>{v.muted=true;await v.play();});assert.equal((await learner.request.get(base+pdf.url)).status(),200);
  await lessonDialog.getByRole('button',{name:'Mark lesson complete',exact:true}).first().click();await lessonDialog.getByRole('button',{name:'Completed',exact:true}).waitFor();await lessonDialog.getByRole('button',{name:'Mark lesson complete',exact:true}).click();await lessonDialog.getByText('100% complete · 2 lessons completed',{exact:true}).waitFor();assert.equal((await api(learner,'/enrollments/learner/u6')).find(e=>e.courseId===course.id).progress,100);await lessonDialog.getByRole('button',{name:'Close',exact:true}).click();
  const quizRow=learner.getByRole('row').filter({has:learner.getByText('Browser Assessment',{exact:true})});await quizRow.getByRole('button',{name:'Take quiz',exact:true}).click();await learner.getByRole('dialog').getByLabel('Trading with virtual funds',{exact:true}).check();await learner.getByRole('button',{name:'Submit answers',exact:true}).click();await learner.getByText('Score: 1/1 — Passed',{exact:true}).waitFor();
  const quiz=(await api(provider,'/quizzes')).find(q=>q.title==='Browser Assessment');assert.equal(quiz.attempts.length,1);assert.equal(quiz.attempts[0].score,1);
  await learner.reload();await learner.locator('#tab-learning').click();await learner.getByText('Browser Regression Course',{exact:true}).first().waitFor();assert.equal((await api(learner,'/enrollments/learner/u6')).find(e=>e.courseId===course.id).progress,100);assert.equal((await api(provider,'/quizzes')).find(q=>q.id===quiz.id).attempts.length,1);
  if(evidence)await learner.screenshot({path:path.join(evidence,'learning-reload.png'),fullPage:true});
  console.log('PASS payment-admin course publication, learner enrollment, uploaded lesson playback, completion and quiz result synchronization after reload');
  await learner.locator('#tab-trading').click();await learner.locator('#trade-quantity').fill('2');await learner.getByRole('button',{name:'Place virtual BUY',exact:true}).click();await learner.getByText('BUY 2 RELIANCE: FILLED',{exact:true}).waitFor();let p=await api(learner,'/algo/portfolio');assert.equal(p.positions[0].qty,2);
  await learner.getByRole('button',{name:'Sell',exact:true}).click();await learner.locator('#trade-quantity').fill('1');await learner.getByRole('button',{name:'Place virtual SELL',exact:true}).click();await learner.getByText('SELL 1 RELIANCE: FILLED',{exact:true}).waitFor();assert.equal((await api(learner,'/algo/portfolio')).positions[0].qty,1);
  await learner.locator('#trade-quantity').fill('999');await learner.getByRole('button',{name:'Place virtual SELL',exact:true}).click();await learner.getByText('You do not hold enough shares to sell this quantity.',{exact:true}).waitFor();assert.equal((await api(learner,'/algo/portfolio')).positions[0].qty,1);
  await learner.getByRole('button',{name:'+ Add to watchlist',exact:true}).click();await learner.getByText('Symbol already exists in watchlist.',{exact:true}).waitFor();
  await learner.locator('#tab-watchlist').click();const existing=learner.getByRole('row').filter({has:learner.getByText('RELIANCE',{exact:true})});await existing.getByRole('button',{name:'Remove',exact:true}).click();await existing.waitFor({state:'hidden'});await learner.locator('#tab-trading').click();await learner.getByRole('button',{name:'+ Add to watchlist',exact:true}).click();await learner.getByText('Added to your watchlist.',{exact:true}).waitFor();
  await learner.locator('#trade-quantity').fill('1');await learner.getByRole('button',{name:'Buy',exact:true}).click();await learner.locator('#trade-type').selectOption('LIMIT');await learner.locator('#trade-price').fill('1');await learner.getByRole('button',{name:'Place virtual BUY',exact:true}).click();await learner.getByText('BUY 1 RELIANCE: PENDING',{exact:true}).waitFor();await learner.getByRole('button',{name:'Cancel',exact:true}).click();await learner.getByText('Order cancelled.',{exact:true}).waitFor();await learner.locator('#tab-portfolio').click();await learner.getByText('RELIANCE',{exact:true}).first().waitFor();p=await api(learner,'/algo/portfolio');assert.equal(p.orders.filter(o=>o.status==='FILLED').length,2);assert.equal(p.orders.filter(o=>o.status==='CANCELLED').length,1);
  await learner.reload();await learner.locator('#tab-portfolio').click();await learner.getByText('RELIANCE',{exact:true}).first().waitFor();assert.equal((await api(learner,'/algo/portfolio')).positions[0].qty,1);
  await learner.locator('#tab-watchlist').click();await learner.getByText('RELIANCE',{exact:true}).first().waitFor();
  if(evidence)await learner.screenshot({path:path.join(evidence,'watchlist-reload.png'),fullPage:true});
  await provider.locator('#tab-courses').click();await provider.screenshot({path:evidence?path.join(evidence,'provider-courses.png'):path.join(os.tmpdir(),'indai-provider-qa.png'),fullPage:true});
  console.log('PASS virtual buy, sell, oversell validation, limit cancellation, watchlist and portfolio synchronization after reload');
  assert.deepEqual(failures,[]);console.log('PASS no uncaught browser errors');
 }finally{await browser?.close();await new Promise(r=>{server.once('exit',r);server.kill();});fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
