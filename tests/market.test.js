import {test,expect} from 'vitest';
import {candles,quotes,providerTime} from '../back-end/services/market.js';
import {openDatabase} from '../back-end/db.js';
import {installInstruments} from '../back-end/seed.js';
import {config} from '../back-end/config.js';
import {readFileSync} from 'node:fs';
test('demo ticks advance and the active candle agrees with the execution quote',async()=>{
 const db=openDatabase(':memory:');installInstruments(db);const row=db.get("SELECT * FROM instruments WHERE symbol='RELIANCE'");
 const now=1780000000000;const [a]=await quotes([row],now);const [b]=await quotes([row],now+config.tickMs);
 expect(b.time-a.time).toBe(config.tickMs);expect(b.price).not.toBe(a.price);
 const bars=await candles(row,'1D',now);expect(bars.at(-1).close).toBe(a.price/100);
 expect(bars.every(x=>x.low<=Math.min(x.open,x.close)&&x.high>=Math.max(x.open,x.close))).toBe(true);db.close();
});
test('provider timestamps support ISO, milliseconds and seconds',()=>{
 expect(providerTime('2026-11-23T10:00:00+05:30')).toBe(Date.parse('2026-11-23T04:30:00Z'));
 expect(providerTime('1780000000000')).toBe(1780000000000);expect(providerTime(1780000000)).toBe(1780000000000);
 for(const value of [null,'','invalid'])expect(providerTime(value)).toBeNull();
});
test('role migration retains course ownership and relationships while revoking retired admin sessions',()=>{
 const db=openDatabase(':memory:');const add=(role,division=null)=>Number(db.run("INSERT INTO users(email,name,password,role,status,division) VALUES (?,?,?,?,'approved',?)",role+'@test.invalid',role,'placeholder',role,division).lastInsertRowid);
 const learner=add('student'),staff=add('coordinator'),admin=add('admin','support');
 db.run("INSERT INTO guidance(student,staff,kind,state,goal,created,expires) VALUES (?,?,'coordinator','active','Sample goal',1,9999999999999)",learner,staff);
 db.run("INSERT INTO sessions VALUES ('retired-session',?,9999999999999)",admin);
 const course=Number(db.run("INSERT INTO courses(owner,title,description,outcomes,difficulty,prerequisites,policy,state) VALUES (?,'Preserved course','Description','Outcomes','introductory','','basic','published')",staff).lastInsertRowid);
 db.tx(()=>{for(const statement of readFileSync(new URL('../back-end/migrations/004-merged-roles.sql',import.meta.url),'utf8').split(';').filter(x=>x.trim()))db.run(statement);});
 expect(db.get('SELECT owner FROM courses WHERE id=?',course).owner).toBe(staff);
 const instructor=add('instructor');
 db.run("INSERT INTO lessons(course,module,title,body,position) VALUES (?,'Module','Lesson','Keep this material.',1)",course);
 db.tx(()=>{for(const statement of readFileSync(new URL('../back-end/migrations/005-instructor-starters.sql',import.meta.url),'utf8').split(';').filter(x=>x.trim()))db.run(statement);});
 const starter=db.get('SELECT * FROM courses WHERE owner=?',instructor);expect(starter.title).toBe('Preserved course');
 expect(db.get('SELECT body FROM lessons WHERE course=?',starter.id).body).toBe('Keep this material.');
 expect(db.get('SELECT owner FROM courses WHERE id=?',course).owner).toBe(staff);
 expect(db.get("SELECT * FROM sessions WHERE token='retired-session'")).toBeUndefined();
 expect(db.get('SELECT role FROM users WHERE id=?',staff).role).toBe('provider');
 expect(db.get('SELECT staff,kind FROM guidance WHERE student=?',learner)).toMatchObject({staff,kind:'provider'});
 expect(db.get('SELECT status,division FROM users WHERE id=?',admin)).toMatchObject({status:'archived',division:'users'});db.close();
});
