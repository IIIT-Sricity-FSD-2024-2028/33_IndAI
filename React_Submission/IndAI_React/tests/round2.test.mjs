import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('Fourteen-request update: equity, reports, notifications and PDF quiz workflow',async t=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'indai-round2-')),port=34846,base=`http://127.0.0.1:${port}`;
 const server=spawn(process.execPath,['dist/main.js'],{cwd:path.join(root,'back-end'),env:{...process.env,NODE_ENV:'test',DATA_DIR:dir,PORT:String(port),DEMO_MODE:'true',COOKIE_SECURE:'false',UPSTOX_ANALYTICS_TOKEN:'',SMTP_HOST:'',RATE_LIMIT_SENSITIVE_MAX:'5000',RATE_LIMIT_GENERAL_MAX:'20000'},stdio:'ignore'});
 async function req(route,token,body,method=body?'POST':'GET'){
  const multipart=body instanceof FormData;
  const r=await fetch(base+'/api'+route,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(!multipart&&body?{'Content-Type':'application/json'}:{})},body:body?(multipart?body:JSON.stringify(body)):undefined});const j=await r.json();return {status:r.status,data:j.data??j};
 }
 async function login(email,password){const r=await req('/auth/login',null,{email,password});assert.equal(r.status,201);return r.data.accessToken;}
 try{
  for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  const learner=await login('learner@indai.com','Learn@1234'),teacher=await login('instructor@indai.com','Inst@1234'),provider=await login('provider@indai.com','Prov@1234'),admin=await login('admin@indai.com','Admin@1234'),pay=await login('paymentadmin@indai.com','Pay@1234');
  await t.test('Equity curve uses total value rather than cash and survives changes',async()=>{
   const initial=(await req('/algo/portfolio',learner)).data;assert.equal(initial.equityHistory.at(-1).netWorth,initial.netWorth);
   const order=await req('/algo/orders',learner,{key:'DEMO|RELIANCE',symbol:'RELIANCE',exchange:'DEMO',side:'BUY',type:'MARKET',qty:2});assert.equal(order.data.order.status,'FILLED');
   const p=(await req('/algo/portfolio',learner)).data;const point=p.equityHistory.at(-1);assert.equal(point.netWorth,p.netWorth);assert.equal(Math.round((point.cash+point.holdings)*100),Math.round(p.netWorth*100));assert.ok(point.netWorth>point.cash);assert.ok(p.equityHistory.length>=2);
  });
  await t.test('Instructor can send to selected or all assigned students and cannot cross scope',async()=>{
   assert.equal((await req('/notifications/send',teacher,{userIds:['u6'],message:'Selected student message'})).data.count,1);
   assert.equal((await req('/notifications/send',teacher,{all:true,message:'All assigned student message'})).data.count,2);
   assert.equal((await req('/notifications/send',teacher,{userIds:['u2'],message:'Unauthorized recipient'})).status,403);
   const inbox=(await req('/notifications/user/u6',learner)).data;assert.ok(inbox.some(n=>n.message==='Selected student message'));assert.ok(inbox.some(n=>n.message==='All assigned student message'));
  });
  let quizId;
  await t.test('PDF quiz creates, enforces access, accepts written answers and stores manual grading',async()=>{
   const form=new FormData();form.append('pdf',new Blob(['%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF'],{type:'application/pdf'}),'assessment.pdf');form.append('title','PDF workflow assessment');form.append('courseId','c1');form.append('status','active');
   const created=await req('/quizzes/upload-pdf',provider,form);assert.equal(created.status,201,JSON.stringify(created));quizId=created.data.id;assert.equal(created.data.kind,'PDF');assert.equal((await fetch(base+created.data.pdfUrl)).status,200);
   let list=(await req('/quizzes',learner)).data.find(q=>q.id===quizId);const enrolled=(await req('/enrollments/learner/u6',learner)).data.some(e=>e.courseId==='c1');
   if(!enrolled){assert.equal(list.pdfUrl,undefined);assert.equal((await req('/enrollments',learner,{learnerId:'u6',courseId:'c1'})).status,201);}
   list=(await req('/quizzes',learner)).data.find(q=>q.id===quizId);assert.ok(list.pdfUrl.includes('signature='));
   const attempt=await req(`/quizzes/${quizId}/submit`,learner,{learnerId:'u6',submissionText:'These are my written answers to the PDF.'});assert.equal(attempt.status,201,JSON.stringify(attempt));assert.equal(attempt.data.status,'PENDING_REVIEW');
   const graded=await req(`/quizzes/${quizId}/attempts/${attempt.data.id}/grade`,provider,{score:85,feedback:'Good answer'});assert.equal(graded.status,201,JSON.stringify(graded));assert.equal(graded.data.status,'GRADED');
   assert.equal((await req('/quizzes',learner)).data.find(q=>q.id===quizId).attempts.at(-1).score,85);
   assert.equal((await req(`/quizzes/${quizId}/attempts/${attempt.data.id}/grade`,learner,{score:100})).status,403);
  });
  await t.test('Payment and User Admin receive dynamic aggregates and real activity without user management access',async()=>{
   for(const token of [pay,admin]){const r=await req('/reports/platform',token);assert.equal(r.status,200);assert.equal(r.data.roles.learner,4);assert.ok(r.data.trades>=1);assert.ok(r.data.quizAttempts>=1);assert.ok(r.data.recentActivity.length);assert.equal(r.data.trend.length,7);}
   assert.equal((await req('/users',pay)).status,403);
   const user=await req('/users',admin,{firstName:'Dynamic',lastName:'Learner',email:'dynamic-round2@example.in',password:'Test@1234',role:'learner',status:'active'});assert.equal(user.status,201,JSON.stringify(user));assert.equal((await req('/reports/platform',pay)).data.roles.learner,5);
  });
 }finally{await new Promise(r=>{server.once('exit',r);server.kill();});await rm(dir,{recursive:true,force:true});}
});
