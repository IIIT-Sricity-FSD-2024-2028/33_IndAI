import {expect,test,beforeAll,afterAll} from 'vitest';
import request from 'supertest';
import {openDatabase,DAY} from '../back-end/db.js';
import {seed} from '../back-end/seed.js';
import {createApp} from '../back-end/app.js';
import {grantCapital} from '../back-end/services/capital.js';
import {readFileSync} from 'node:fs';

const db=openDatabase(':memory:');
const app=createApp(db);
const clients={};
const users={};
const post=(client,path,body={})=>client.post('/api'+path).set('X-IndAI-Request','1').send(body);
const put=(client,path,body)=>client.put('/api'+path).set('X-IndAI-Request','1').send(body);
beforeAll(async()=>{
  await seed(db);
  for(const [key,email] of Object.entries({
    basic:'student1@indai.test',pro:'student201@indai.test',coached:'student261@indai.test',plus:'student262@indai.test',other:'student206@indai.test',
    instructor:'instructor1@indai.test',second:'instructor2@indai.test',provider:'provider1@indai.test',
    admin:'users@indai.test',super:'super@indai.test'
  })) {
    const client=request.agent(app);
    await post(client,'/auth/login',{email,password:'IndAI-Demo-2026'}).expect(200);
    clients[key]=client;
    users[key]=db.get('SELECT * FROM users WHERE email=?',email);
  }
},30000);
afterAll(()=>db.close());
test('fresh seed has exactly 200 Free, 60 Pro, 40 Plus and varied instructor rosters',()=>{
  const tiers=db.all("SELECT coalesce(s.plan,'basic') plan,count(*) n FROM users u LEFT JOIN subscriptions s ON s.student=u.id WHERE u.role='student' GROUP BY coalesce(s.plan,'basic')");
  expect(Object.fromEntries(tiers.map(t=>[t.plan,t.n]))).toEqual({basic:200,pro:60,plus:40});
  const counts=db.all("SELECT count(g.id) n FROM users u LEFT JOIN guidance g ON g.staff=u.id AND g.state='active' AND g.kind='instructor' WHERE u.role='instructor' GROUP BY u.id").map(x=>x.n);
  expect(new Set(counts)).toEqual(new Set([0,1,2,3,4,5]));
  expect(db.get("SELECT count(*) n FROM users WHERE role='provider'").n).toBe(18);
});
test('paper funding is role and plan aware and instructors have a trading workspace API',async()=>{
  for(const [key,cash] of [['basic',10000000],['pro',15000000],['plus',20000000],['instructor',100000000]]) {
    const {body}=await clients[key].get('/api/trading/account').expect(200);
    expect(body.funded).toBe(cash);
    if(['pro','plus'].includes(key))expect(body.cash).toBe(cash);
  }
  await clients.provider.get('/api/trading/account').expect(403);
  await post(clients.instructor,'/trading/orders',{symbol:'RELIANCE',clientKey:crypto.randomUUID(),side:'buy',type:'market',qty:1,validity:'DAY'}).expect(201);
});
test('member admins can search every actor and inspect learner portfolios without exposing secrets',async()=>{
  const {body:list}=await clients.admin.get('/api/members?role=student&search=student261@').expect(200);
  expect(list.total).toBe(1);
  const {body:detail}=await clients.admin.get('/api/members/'+users.coached.id).expect(200);
  expect(detail.account.funded).toBe(20000000);
  expect(detail.assignments.length).toBe(1);
  expect(detail.relationships.some(r=>r.staff===users.instructor.id)).toBe(true);
  expect(JSON.stringify(detail)).not.toContain('password');
  expect(JSON.stringify(detail)).not.toContain('mfa');
  await clients.basic.get('/api/members').expect(403);
  await clients.instructor.get('/api/members/'+users.other.id).expect(403);
  await put(clients.admin,'/members/'+users.instructor.id+'/profile',{name:users.instructor.name,email:users.instructor.email,capacity:1,reason:'Testing a capacity reduction.'}).expect(409);
  await put(clients.admin,'/members/'+users.super.id+'/profile',{name:'Unauthorized administrator',email:users.super.email,reason:'An unauthorized profile change.'}).expect(403);
});
test('member editing and notes are audited and privileged changes remain bounded',async()=>{
  const target=users.other.id;
  await put(clients.admin,'/members/'+target+'/profile',{name:'Updated Learner',email:users.other.email,reason:'Correcting the learner display name.'}).expect(200);
  await post(clients.admin,'/members/'+target+'/notes',{body:'Check the next assignment review.'}).expect(201);
  const details=(await clients.admin.get('/api/members/'+target).expect(200)).body;
  expect(details.user.name).toBe('Updated Learner');
  expect(details.notes[0].body).toContain('next assignment');
  expect(db.get("SELECT count(*) n FROM audit WHERE actor=? AND action='member.profile'",users.admin.id).n).toBe(1);
  expect(db.get("SELECT count(*) n FROM audit WHERE action='request.post'").n).toBeGreaterThan(0);
  await post(clients.admin,'/members',{name:'Test Provider',email:'newprovider@example.test',password:'ProviderPassphrase2026',role:'provider',reason:'Provisioning a new content partner.'}).expect(201);
});
test('protected default resources support PDF and video ranges and reject other learners and mismatched uploads',async()=>{
  const course=db.get("SELECT id FROM courses WHERE title='Paper Trading Foundations'").id;
  const {body:resources}=await clients.basic.get('/api/resources/course/'+course).expect(200);
  expect(resources.map(r=>r.mime).sort()).toEqual(['application/pdf','video/mp4']);
  const video=resources.find(r=>r.mime==='video/mp4');
  const ranged=await clients.basic.get('/api/resource-files/'+video.id).set('Range','bytes=0-99').expect(206);
  expect(ranged.headers['content-range']).toBe('bytes 0-99/'+video.size);
  expect(ranged.headers['content-length']).toBe('100');
  await clients.basic.get('/api/resource-files/'+video.id).set('Range','bytes=99999999999-').expect(416);
  const premium=db.get("SELECT id FROM courses WHERE policy='plus' LIMIT 1").id;
  await clients.basic.get('/api/resources/course/'+premium).expect(403);
  const assignment=db.get('SELECT a.id FROM assignments a JOIN guidance g ON g.id=a.relationship WHERE g.student=?',users.coached.id).id;
  const upload=(client,data,mime='application/pdf',filename='review.pdf')=>client.post('/api/resources/assignment/'+assignment+'/upload')
    .set('X-IndAI-Request','1').set('Content-Type',mime).set('X-File-Name',filename).send(data);
  await upload(clients.second,Buffer.from('%PDF-1.7\n')).expect(403);
  await upload(clients.instructor,Buffer.from('untrusted executable')).expect(422);
  const {body:created}=await upload(clients.instructor,readFileSync(new URL('../back-end/assets/trading-guide.pdf',import.meta.url))).expect(201);
  await clients.coached.get('/api/resource-files/'+created.id).expect(200);
  await clients.other.get('/api/resource-files/'+created.id).expect(403);
});
let standalone,attemptId;
test('mixed quizzes hide answers, save learner drafts, submit once, and require review for written answers',async()=>{
  const created=await post(clients.instructor,'/quizzes',{
    title:'Mixed paper trading quiz',description:'Test an MCQ and two written responses.',recipients:[users.coached.id],due:Date.now()+DAY,
    questions:[
      {kind:'mcq',prompt:'What does a buy limit constrain?',options:['Maximum purchase price','Guaranteed gains'],correct:0,points:2,required:true},
      {kind:'short',prompt:'Name an execution uncertainty.',points:3,required:true},
      {kind:'long',prompt:'Explain your trading review process.',points:5,required:false}
    ]}).expect(201);
  standalone=created.body.id;
  await clients.coached.get('/api/quizzes/'+standalone).expect(404);
  await post(clients.instructor,'/quizzes/'+standalone+'/publish').expect(200);
  const {body:quiz}=await clients.coached.get('/api/quizzes/'+standalone).expect(200);
  expect(quiz.questions[0]).not.toHaveProperty('correct');
  const [mcq,short,long]=quiz.questions;
  const answers={[mcq.id]:'0',[short.id]:'A market gap changes execution.',[long.id]:'I review the order instructions, position size, and outcome.'};
  await put(clients.coached,'/quizzes/'+standalone+'/draft',{answers}).expect(200);
  expect((await clients.coached.get('/api/quizzes/'+standalone)).body.draft).toEqual(answers);
  await post(clients.other,'/quizzes/'+standalone+'/submit',{answers}).expect(404);
  await post(clients.coached,'/quizzes/'+standalone+'/submit',{answers:{[mcq.id]:'9'}}).expect(422);
  const submitted=await post(clients.coached,'/quizzes/'+standalone+'/submit',{answers}).expect(201);
  attemptId=submitted.body.id;
  await post(clients.coached,'/quizzes/'+standalone+'/submit',{answers}).expect(409);
  const result=(await clients.coached.get('/api/quizzes/'+standalone)).body;
  expect(result.attempt.state).toBe('submitted');
  expect(result.attempt.score).toBe(2);
  expect(result.questions[0]).not.toHaveProperty('correct');
  await post(clients.second,'/quiz-attempts/'+attemptId+'/grade',{grades:[{question:short.id,score:3,feedback:'Clear.'}]}).expect(404);
  await post(clients.instructor,'/quiz-attempts/'+attemptId+'/grade',{grades:[{question:short.id,score:4,feedback:'Over maximum.'}]}).expect(422);
  await post(clients.instructor,'/quiz-attempts/'+attemptId+'/grade',{grades:[{question:short.id,score:3,feedback:'Clear explanation.'},{question:long.id,score:4,feedback:'Good review routine.'}]}).expect(200);
  const graded=(await clients.coached.get('/api/quizzes/'+standalone)).body;
  expect(graded.attempt.state).toBe('graded');
  expect(graded.attempt.score).toBe(9);
  expect(graded.questions[0].correct).toBe(0);
});
test('weekly paper awards use reviewed work, prevent duplicate awards, and enforce a rolling learner cap',async()=>{
  const learner=users.coached.id;
  const relation=db.get("SELECT id FROM guidance WHERE student=? AND staff=? AND kind='instructor' AND state='active'",learner,users.instructor.id).id;
  const reviewed=db.get('SELECT s.id FROM submissions s JOIN assignments a ON a.id=s.assignment WHERE a.relationship=? AND s.reviewed IS NOT NULL',relation).id;
  const before=(await clients.coached.get('/api/trading/account')).body.cash;
  const payload={submission:reviewed,amount:600000,reason:'A strong risk explanation and consistent reviewed work.'};
  await post(clients.second,'/teaching/learners/'+learner+'/award',payload).expect(403);
  await post(clients.instructor,'/teaching/learners/'+learner+'/award',payload).expect(200);
  await post(clients.instructor,'/teaching/learners/'+learner+'/award',payload).expect(409);
  const assignment=db.run('INSERT INTO assignments(relationship,title,body,due) VALUES (?,?,?,?)',relation,'Another reviewed task','Explain the risk budget.',Date.now()+DAY).lastInsertRowid;
  const work=db.run('INSERT INTO submissions(assignment,body,created,feedback,reviewed) VALUES (?,?,?,?,?)',assignment,'Reviewed response.',Date.now(),'Reviewed with feedback.',Date.now()).lastInsertRowid;
  await post(clients.instructor,'/teaching/learners/'+learner+'/award',{...payload,submission:Number(work),amount:500000}).expect(409);
  await post(clients.instructor,'/teaching/learners/'+learner+'/award',{...payload,submission:Number(work),amount:400000}).expect(200);
  expect((await clients.coached.get('/api/trading/account')).body.cash).toBe(before+1000000);
  await post(clients.coached,'/trading/reset',{confirm:'RESET PAPER ACCOUNT'}).expect(200);
  expect((await clients.coached.get('/api/trading/account')).body.cash).toBe(21000000);
  expect(db.get('SELECT sum(amount) n FROM capital_awards WHERE student=?',learner).n).toBe(1000000);
});
test('provider proposal, counteroffer, acceptance, publication and settlement records form a real workflow',async()=>{
  const {body:course}=await post(clients.provider,'/courses',{title:'Provider practice workshop',description:'A course on paper order risk and review.',outcomes:'Read orders and explain execution.',difficulty:'introductory',prerequisites:'',policy:'pro'}).expect(201);
  const remove=()=>clients.provider.delete('/api/courses/'+course.id).set('X-IndAI-Request','1');
  await post(clients.provider,'/courses/'+course.id+'/lessons',{module:'Order review',title:'Understand the order',body:'Review the order instructions before placing it.'}).expect(201);
  await post(clients.provider,'/courses/'+course.id+'/terms',{amount:250000,note:'One-time course licensing fee for the workshop.'}).expect(201);
  expect((await remove().expect(409)).body.code).toBe('COURSE_HISTORY');
  await post(clients.provider,'/courses/'+course.id+'/submit').expect(200);
  await post(clients.super,'/courses/'+course.id+'/review',{action:'publish'}).expect(409);
  for(const action of ['accept','reject']) {
    await post(clients.admin,'/commerce/'+course.id+'/decision',{action,amount:200000,note:'An amount is invalid for this decision.'}).expect(422);
  }
  await post(clients.admin,'/commerce/'+course.id+'/decision',{action:'counter',note:'Counteroffers need an amount.'}).expect(422);
  await post(clients.admin,'/commerce/'+course.id+'/decision',{action:'counter',amount:200000,note:'Counteroffer for the initial course license.'}).expect(200);
  await post(clients.provider,'/courses/'+course.id+'/terms/respond',{accept:true}).expect(200);
  await post(clients.super,'/courses/'+course.id+'/review',{action:'publish'}).expect(200);
  expect((await remove().expect(409)).body.code).toBe('EARNING_NOT_RECORDED');
  await post(clients.admin,'/commerce/'+course.id+'/earning').expect(201);
  await post(clients.admin,'/commerce/'+course.id+'/earning').expect(409);
  const earning=db.get('SELECT id FROM provider_settlements WHERE course=?',course.id).id;
  await remove().expect(200,{outcome:'archived'});
  await post(clients.admin,'/settlements/'+earning+'/paid',{reference:'TEST-EXTERNAL-TRANSFER-001'}).expect(200);
  expect((await clients.provider.get('/api/provider')).body.totals.paid).toBeGreaterThanOrEqual(200000);
  await post(clients.provider,'/quizzes',{title:'Unscoped provider quiz',description:'',recipients:[users.coached.id],questions:[{kind:'short',prompt:'A sample prompt.',points:1,required:true}]}).expect(403);
});
test('Admin and Super Admin use operations without creating their own help tickets',async()=>{
  for(const key of ['admin','super']) await post(clients[key],'/support',{subject:'A top-level ticket',body:'This should use the operations queue.'}).expect(403);
  const audit=(await clients.super.get('/api/admin?queue=audit')).body;
  expect(audit.some(event=>event.action.startsWith('request.'))).toBe(true);
  expect(JSON.stringify(audit)).not.toContain('IndAI-Demo-2026');
});

test('only the super admin can edit privileges, with an audited role change',async()=>{
  await post(clients.admin,'/members/'+users.super.id+'/permissions',{role:'admin',reason:'Unauthorized role change.'}).expect(403);
  await post(clients.super,'/members/'+users.super.id+'/permissions',{role:'student',reason:'Attempt to remove the only super admin.'}).expect(409);
  const member=db.get("SELECT id FROM users WHERE email='newprovider@example.test'").id;
  await post(clients.super,'/members/'+member+'/permissions',{role:'admin',reason:'Assigning a new administrator.'}).expect(200);
  expect(db.get('SELECT role,division FROM users WHERE id=?',member)).toMatchObject({role:'admin',division:null});
  expect(db.get("SELECT count(*) n FROM audit WHERE action='member.permissions' AND target=?",String(member)).n).toBe(1);
});
test('funding awards track a learner cap and renew after seven days',async()=>{
  const learner=users.plus.id;
  const relationship=db.get("SELECT * FROM guidance WHERE student=? AND kind='instructor' AND state='active'",learner);
  const instructor=db.get('SELECT * FROM users WHERE id=?',relationship.staff);
  const work=Array.from({length:3},(_,index)=>{
    const assignment=db.run('INSERT INTO assignments(relationship,title,body,due) VALUES (?,?,?,?)',relationship.id,'Concurrency work '+index,'Review your paper order process.',Date.now()+DAY).lastInsertRowid;
    return Number(db.run('INSERT INTO submissions(assignment,body,created,feedback,reviewed) VALUES (?,?,?,?,?)',assignment,'A reviewed answer.',Date.now(),'Reviewed successfully.',Date.now()).lastInsertRowid);
  });
  const now=Date.now();
  grantCapital(db,instructor,learner,work[0],700000,'Strong reviewed work justifies this award.',now);
  expect(()=>grantCapital(db,instructor,learner,work[1],700000,'Another reviewed work award request.',now)).toThrow(/seven days/);
  grantCapital(db,instructor,learner,work[1],700000,'A reviewed award after the weekly window.',now+7*DAY+1);
  expect(db.get('SELECT sum(amount) n FROM capital_awards WHERE student=?',learner).n).toBe(1400000);
});
