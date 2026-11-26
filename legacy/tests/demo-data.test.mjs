import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('Linked demo: identities, cross-actor changes, boundaries and restart',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'indai-linked-')),port=34859,base=`http://127.0.0.1:${port}`;let server;let logs='';
 const env={...process.env,PORT:String(port),DATA_DIR:dir,DEMO_MODE:'true',NODE_ENV:'test',COOKIE_SECURE:'false',JWT_SECRET:'x'.repeat(64),JWT_REFRESH_SECRET:'y'.repeat(64),RATE_LIMIT_SENSITIVE_MAX:'500',RATE_LIMIT_GENERAL_MAX:'2000'};
 async function start(){server=spawn(process.execPath,['dist/main.js'],{cwd:path.join(root,'back-end'),env,stdio:['ignore','pipe','pipe']});server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);for(let i=0;i<100;i++){try{if((await fetch(base+'/api/public/config')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error(logs);}
 async function stop(){if(server&&!server.killed)await new Promise(r=>{server.once('exit',r);server.kill();});}
 async function api(route,token,body,method=body?'POST':'GET'){const r=await fetch(base+'/api'+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});const v=await r.json();return {status:r.status,data:v.data??v};}
 async function login(email,password){const r=await api('/auth/login',null,{email,password});assert.equal(r.status,201,JSON.stringify(r));assert.ok(r.data.accessToken);return r.data;}
 try{
  await start();
  const original=[['superadmin','Admin@1234'],['admin','Admin@1234'],['paymentadmin','Pay@1234'],['instructor','Inst@1234'],['provider','Prov@1234'],['learner','Learn@1234']];
  for(const [name,pw]of original)await login(name+'@indai.com',pw);await login('iiitprovider@iiits.in','Prov@1234');
  const newAccounts=[['superadmin.demo','Admin@1234','superuser'],['useradmin.demo','Admin@1234','admin'],['paymentadmin.demo','Pay@1234','admin'],['instructor.demo','Inst@1234','instructor'],['provider.demo','Prov@1234','provider'],['asha.demo','Learn@1234','learner'],['neha.demo','Learn@1234','learner'],['vikram.demo','Learn@1234','learner']];
  for(const [name,pw,role] of newAccounts)assert.equal((await login(name+'@indai.com',pw)).user.role,role);
  const teacher=await login('instructor.demo@indai.com','Inst@1234'),neha=await login('neha.demo@indai.com','Learn@1234'),vikram=await login('vikram.demo@indai.com','Learn@1234'),asha=await login('asha.demo@indai.com','Learn@1234'),provider=await login('provider.demo@indai.com','Prov@1234');
  assert.equal((await api('/notifications/send',teacher.accessToken,{userIds:[neha.user.id],message:'Selected learner notice'})).status,201);
  let inbox=(await api('/notifications/user/'+neha.user.id,neha.accessToken)).data;assert.ok(inbox.some(n=>n.message==='Selected learner notice'&&n.senderId===teacher.user.id));
  assert.ok(!(await api('/notifications/user/'+vikram.user.id,vikram.accessToken)).data.some(n=>n.message==='Selected learner notice'));
  const all=await api('/notifications/send',teacher.accessToken,{all:true,message:'Both assigned learners notice'});assert.equal(all.data.count,2);
  assert.equal((await api('/notifications/send',teacher.accessToken,{userIds:[asha.user.id],message:'Must be rejected'})).status,403);
  assert.equal((await api('/assignments/demo_assignment_private/submit',neha.accessToken,{learnerId:neha.user.id,submissionText:'My virtual risk budget is 1000 with 10 risk per share.'})).status,201);
  const list=(await api('/assignments',teacher.accessToken)).data;assert.ok(list.find(a=>a.id==='demo_assignment_private').submissions.some(s=>s.learnerId===neha.user.id));
  assert.equal((await api('/assignments/demo_assignment_private/approve/'+neha.user.id,teacher.accessToken,{})).status,201);
  assert.equal((await api('/auth/me',neha.accessToken)).data.skillPoints,30);
  await api('/assignments/demo_assignment_private/approve/'+neha.user.id,teacher.accessToken,{});assert.equal((await api('/auth/me',neha.accessToken)).data.skillPoints,30);
  assert.equal((await api('/assignments/demo_assignment_private/submit',asha.accessToken,{learnerId:asha.user.id,submissionText:'Wrong class'})).status,400);
  const title='Risk Workbook - Updated by Provider';assert.equal((await api('/course-modules/demo_course_private_pdf',provider.accessToken,{title},'PATCH')).status,200);
  let modules=(await api('/courses/demo_course_private/modules',neha.accessToken)).data;assert.ok(modules.some(m=>m.title===title));
  for(const module of modules){const response=await fetch(base+module.url);assert.equal(response.status,200);assert.ok((await response.arrayBuffer()).byteLength>500);}
  assert.equal((await api('/courses/demo_course_private/modules',asha.accessToken)).status,403);
  assert.equal((await api('/course-modules/demo_course_public_pdf',provider.accessToken,{title:'Illegal edit'},'PATCH')).status,403);
  const runPrepare=()=>new Promise((resolve,reject)=>{const c=spawn(process.execPath,['scripts/prepare-demo.mjs'],{cwd:root,env:{...env,INDAI_DEMO_URL:base},stdio:['ignore','pipe','pipe']});let out='';c.stdout.on('data',d=>out+=d);c.stderr.on('data',d=>out+=d);c.on('exit',code=>code?reject(Error(out)):resolve(out));});
  await runPrepare();let orders=(await api('/algo/portfolio',neha.accessToken)).data.orders;assert.equal(orders.length,2);await runPrepare();assert.equal((await api('/algo/portfolio',neha.accessToken)).data.orders.length,2);
  const portfolio=(await api('/algo/portfolio',neha.accessToken)).data;assert.ok(portfolio.cash<100000);assert.equal(portfolio.positions.length,2);
  const state=JSON.parse(await readFile(path.join(dir,'platform.json'),'utf8'));assert.equal(state.users.length,15);for(const user of state.users.filter(u=>u.instructorId))assert.ok(state.users.find(i=>i.id===user.instructorId).studentIds.includes(user.id));
  for(const course of state.courses)assert.equal(course.enrolledCount,state.enrollments.filter(e=>e.courseId===course.id).length);
  for(const org of state.organizations)assert.equal(org.memberCount,state.users.filter(u=>u.organizationId===org.id).length);
  await stop();await start();const again=await login('neha.demo@indai.com','Learn@1234');assert.equal(again.user.skillPoints,30);assert.equal((await api('/algo/portfolio',again.accessToken)).data.orders.length,2);assert.ok((await api('/courses/demo_course_private/modules',again.accessToken)).data.some(m=>m.title===title));assert.equal((await api('/notifications/user/'+again.user.id,again.accessToken)).data.filter(n=>n.message==='Selected learner notice').length,1);
  console.log('PASS 15 logins; instructor selected/all notifications; other-class denial; submission/approval; provider edit and signed media; private-course isolation; real virtual orders; repeat preparation; restart persistence.');
 }finally{await stop();await rm(dir,{recursive:true,force:true});}
});
