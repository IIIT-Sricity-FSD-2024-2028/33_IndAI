import { randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import request from 'supertest';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { createApp } from '../back-end/app.js';
import { DAY, notify, openDatabase } from '../back-end/db.js';
import { hash } from '../back-end/services/auth.js';
import { sendSubscriptionReminders } from '../back-end/services/subscription-reminders.js';

let db, app;
beforeEach(()=>{
  db=openDatabase(':memory:');
  app=createApp(db);
});
afterEach(()=>db.close());

function account(name,role,status='approved') {
  const id=db.run('INSERT INTO users(email,name,password,role,status) VALUES (?,?,?,?,?)',
    name+'@indai.test',name,'fixture',role,status).lastInsertRowid;
  const token=randomBytes(32).toString('hex');
  db.run('INSERT INTO sessions VALUES (?,?,?)',hash(token),id,Date.now()+DAY);
  const client=method=>path=>request(app)[method]('/api'+path).set('Cookie','indai_session='+token);
  return { id,get:client('get'),post:(path,body={})=>client('post')(path).set('X-IndAI-Request','1').send(body) };
}

const unread=async user=>(await user.get('/notifications/unread').expect(200)).body.count;
const preview=(user,audience)=>user.get('/admin/notifications/preview?audience='+audience);
const broadcast=(user,audience,confirmedCount,fields={})=>user.post('/admin/notifications',
  {audience,confirmedCount,title:'Workspace update',message:'Broadcast content',...fields});

test('only approved Admin and Super Admin can preview and send to eligible distinct recipients',async()=>{
  const admin=account('Admin','admin');
  const superadmin=account('Super Admin','superadmin');
  const pending=account('Pending Admin','admin','pending');
  const teacher=account('Instructor','instructor');
  const provider=account('Provider','provider');
  const learner=account('Learner','student');
  const suspended=account('Suspended Instructor','instructor','suspended');
  const archived=account('Archived Provider','provider','archived');
  const unverified=account('Unverified Instructor','instructor','unverified');
  for (const user of [pending,teacher,provider,learner]) {
    await preview(user,'both').expect(403);
    await broadcast(user,'both',2).expect(403);
  }
  await preview(admin,'instructors').expect(200,{count:1});
  await preview(admin,'providers').expect(200,{count:1});
  await preview(superadmin,'both').expect(200,{count:2});
  await broadcast(admin,'both',undefined).expect(422);
  await broadcast(admin,'both',1).expect(409);
  await broadcast(admin,'both',2,{message:'x'.repeat(4001)}).expect(422);
  await broadcast(admin,'both',2,{message:'  '}).expect(422);
  await broadcast(admin,'instructors',1).expect(201,{count:1});
  expect(await unread(teacher)).toBe(1);
  expect(await unread(provider)).toBe(0);
  await broadcast(admin,'providers',1).expect(201,{count:1});
  await broadcast(superadmin,'both',2).expect(201,{count:2});
  expect(await unread(teacher)).toBe(2);
  expect(await unread(provider)).toBe(2);
  for (const user of [suspended,archived,unverified,learner]) expect(await unread(user)).toBe(0);
  const event=db.get("SELECT * FROM audit WHERE action='notification.broadcast' ORDER BY id DESC LIMIT 1");
  expect(event).toMatchObject({actor:superadmin.id,target:'both',created:expect.any(Number)});
  expect(JSON.parse(event.detail)).toEqual({audience:'both',recipientCount:2});
  await admin.post('/admin/users/'+superadmin.id+'/suspend',{reason:'Attempted privileged change'}).expect(409);
  await admin.post('/members/'+superadmin.id+'/permissions',{role:'student',reason:'Attempted privileged change'}).expect(403);
});

test('a broadcast rolls back delivery when its audit event cannot be persisted',async()=>{
  const admin=account('Admin','admin');
  account('Instructor','instructor');
  account('Provider','provider');
  db.run(`CREATE TRIGGER reject_broadcast BEFORE INSERT ON audit WHEN NEW.action='notification.broadcast'
    BEGIN SELECT RAISE(ABORT,'simulated audit failure'); END`);
  await broadcast(admin,'both',2).expect(500);
  expect(db.get('SELECT count(*) count FROM notifications').count).toBe(0);
});

test('inbox paginates and isolates reads and destinations by recipient',async()=>{
  const owner=account('Learner','student');
  const other=account('Other learner','student');
  const ticket=db.run("INSERT INTO tickets(user_id,subject,created) VALUES (?,'Help',1)",owner.id).lastInsertRowid;
  const allowed=notify(db,owner.id,'Owned ticket','/support/'+ticket,{title:'Support reply',source:'Support',now:2});
  const forbidden=notify(db,other.id,'Private ticket','/support/'+ticket);
  const external=notify(db,other.id,'External URL','//example.test');
  const missing=notify(db,other.id,'Missing resource','/quizzes/999');
  const wrongRole=notify(db,other.id,'Billing operations','/commerce');
  for (let i=0;i<25;i++) notify(db,owner.id,'More history','/overview');
  const {body:first}=await owner.get('/notifications').expect(200);
  expect(first.items).toHaveLength(25);
  expect(first.more).toBe(true);
  const {body:second}=await owner.get('/notifications?page=1').expect(200);
  expect(second).toEqual({items:[{id:allowed,title:'Support reply',source:'Support',message:'Owned ticket',created:2,read:0}],more:false});
  await other.post('/notifications/'+allowed+'/read').expect(404);
  await other.post('/notifications/'+allowed+'/open').expect(404);
  expect(await unread(owner)).toBe(26);
  await owner.post('/notifications/'+allowed+'/open').expect(200,{destination:'/support/'+ticket});
  expect(await unread(owner)).toBe(25);
  for (const item of [forbidden,external,missing,wrongRole]) await other.post('/notifications/'+item+'/open').expect(200,{destination:null});
  expect(await unread(other)).toBe(0);
  const newItem=notify(db,other.id,'New activity','/');
  await other.post('/notifications/'+newItem+'/read').expect(200);
  expect(await unread(other)).toBe(0);
  notify(db,other.id,'More activity','/');
  await owner.post('/notifications/read-all').expect(200);
  expect(await unread(owner)).toBe(0);
  expect(await unread(other)).toBe(1);
});

const end=Date.UTC(2026,10,30,12);
function term(store,user,plan,ends=end,starts=ends-30*DAY,state='active') {
  return store.run('INSERT INTO subscriptions(student,plan,starts,ends,state) VALUES (?,?,?,?,?)',user,plan,starts,ends,state).lastInsertRowid;
}
const reminders=(store,subscription)=>store.all('SELECT ends,lead_days FROM subscription_reminders WHERE subscription=? ORDER BY ends,lead_days DESC',subscription);

test.each(['pro','plus'])('%s reminders obey cutoff times and follow an updated end date',plan=>{
  const learner=account('Learner','student');
  const id=term(db,learner.id,plan);
  sendSubscriptionReminders(db,end-7*DAY-1);
  expect(reminders(db,id)).toEqual([]);
  sendSubscriptionReminders(db,end-7*DAY);
  sendSubscriptionReminders(db,end-DAY-1);
  expect(reminders(db,id)).toEqual([{ends:end,lead_days:7}]);
  sendSubscriptionReminders(db,end-DAY);
  sendSubscriptionReminders(db,end-DAY);
  const extended=end+14*DAY;
  db.run('UPDATE subscriptions SET ends=? WHERE id=?',extended,id);
  sendSubscriptionReminders(db,end);
  sendSubscriptionReminders(db,extended-7*DAY);
  sendSubscriptionReminders(db,extended-DAY);
  expect(reminders(db,id)).toEqual([end,extended].flatMap(ends=>[7,1].map(lead_days=>({ends,lead_days}))));
  expect(db.all("SELECT source,path FROM notifications WHERE source='IndAI Billing'")).toEqual(
    Array.from({length:4},()=>({source:'IndAI Billing',path:'/plans'})));
});

test('the worker skips expired, superseded, renewed, refunded and suspended terms',()=>{
  const learner=account('Learner','student');
  const suspended=account('Suspended','student','suspended');
  const expired=term(db,learner.id,'pro',end-DAY);
  const previous=term(db,learner.id,'pro');
  const current=term(db,learner.id,'plus',end+DAY,end-10*DAY,'canceled');
  term(db,learner.id,'plus',end+31*DAY,end+DAY);
  const refunded=term(db,learner.id,'plus',end,end-3*DAY,'refunded');
  const blocked=term(db,suspended.id,'pro');
  sendSubscriptionReminders(db,end-DAY);
  for (const id of [expired,previous,current,refunded,blocked]) expect(reminders(db,id)).toEqual([]);
});

test('upgrade unifies split-admin permissions and preserves sessions, history and pending operations across restarts',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'indai-notifications-'));
  const path=join(directory,'upgrade.sqlite');
  const migrations=new URL('../back-end/migrations/',import.meta.url);
  const tokens=[randomBytes(32).toString('hex'),randomBytes(32).toString('hex')];
  let store;
  try {
    const legacy=new DatabaseSync(path);
    try {
      legacy.exec('CREATE TABLE migrations(version TEXT PRIMARY KEY)');
      for (const file of readdirSync(migrations).sort().filter(file=>file<'008-')) {
        legacy.exec(readFileSync(new URL(file,migrations),'utf8'));
        legacy.prepare('INSERT INTO migrations VALUES (?)').run(file);
      }
      legacy.exec(`INSERT INTO users(id,email,name,password,role,status,division) VALUES
        (1,'u@indai.test','User Admin','fixture','admin','approved','users'),
        (2,'b@indai.test','Payments Admin','fixture','admin','approved','payments'),
        (3,'s@indai.test','Super Admin','fixture','superadmin','approved',NULL),
        (4,'l@indai.test','Learner','fixture','student','approved',NULL),
        (5,'p@indai.test','Pending','fixture','student','pending',NULL),
        (6,'q@indai.test','Plus learner','fixture','student','approved',NULL);
        INSERT INTO notifications(user_id,message,path,created,read) VALUES (1,'History','/overview',100,1);
        INSERT INTO applications(student,state,created) VALUES (5,'pending',100);
        INSERT INTO payments(student,plan,amount,provider,status,created) VALUES (4,'pro',100,'demo','pending',100);`);
      for (const [index,token] of tokens.entries()) {
        legacy.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(token),index+1,Date.now()+DAY);
      }
    } finally { legacy.close(); }
    store=openDatabase(path);
    expect(store.all('SELECT id,role,division,status FROM users WHERE id<=3 ORDER BY id')).toEqual([
      {id:1,role:'admin',division:null,status:'approved'},
      {id:2,role:'admin',division:null,status:'approved'},
      {id:3,role:'superadmin',division:null,status:'approved'}
    ]);
    const upgradedApp=createApp(store);
    for (const token of tokens) {
      const get=path=>request(upgradedApp).get('/api'+path).set('Cookie','indai_session='+token);
      for (const queue of ['users','staff','payments','support']) await get('/admin?queue='+queue).expect(200);
      await get('/members').expect(200);
      await get('/commerce').expect(200);
      await get('/admin/notifications/preview?audience=both').expect(200,{count:0});
      await get('/admin?queue=audit').expect(403);
      await get('/admin?queue=courses').expect(403);
    }
    expect(store.get('SELECT * FROM notifications')).toMatchObject({user_id:1,message:'History',path:'/overview',created:100,read:1,title:'IndAI notification',source:'IndAI'});
    expect(store.get('SELECT state FROM applications').state).toBe('pending');
    expect(store.get('SELECT status FROM payments').status).toBe('pending');
    const pro=term(store,4,'pro');
    const plus=term(store,6,'plus',end,end-30*DAY,'canceled');
    sendSubscriptionReminders(store,end-7*DAY-1);
    store.close();
    store=openDatabase(path);
    sendSubscriptionReminders(store,end-1);
    store.close();
    store=openDatabase(path);
    sendSubscriptionReminders(store,end-1);
    sendSubscriptionReminders(store,end);
    for (const id of [pro,plus]) expect(reminders(store,id)).toEqual([{ends:end,lead_days:7},{ends:end,lead_days:1}]);
  } finally {
    store?.close();
    for (const file of [path,path+'-wal',path+'-shm',path+'-journal']) rmSync(file,{force:true});
    rmdirSync(directory);
  }
});
