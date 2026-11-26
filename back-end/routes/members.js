import { ensure,log,notify } from '../db.js';
import { admin,approved,plan,reconcileGuidance,userView } from '../services/access.js';
import { grantCapital } from '../services/capital.js';
import { cashReserved,sharesReserved } from '../services/trading.js';
import { quotes } from '../services/market.js';
import { passwordHash,issue } from '../services/auth.js';
import { form,id,numeric,page,read,words,email,password,z } from '../validation.js';

export const roles=['student','instructor','provider','admin','superadmin'];
export function memberRoutes(app,db,auth) {
  const access=(req,res,next)=>{admin(req.user);next();};
  app.get('/api/members',auth,access,(req,res)=>{
    const search='%'+read(z.string().trim().max(90),req.query.search||'')+'%';
    const role=read(z.enum(['all',...roles]),req.query.role||'all');
    const status=read(z.enum(['all','approved','pending','rejected','suspended','archived','unverified']),req.query.status||'all');
    const where="WHERE (name LIKE ? OR email LIKE ?) AND (?='all' OR role=?) AND (?='all' OR status=?)";
    const params=[search,search,role,role,status,status];
    const rows=db.all('SELECT id,name,email,role,status FROM users '+where+' ORDER BY id LIMIT 25 OFFSET ?',...params,page(req.query.page)*25);
    res.json({total:db.get('SELECT count(*) n FROM users '+where,...params).n,counts:db.all('SELECT role,count(*) count FROM users GROUP BY role'),
      members:rows.map(user=>({...user,plan:user.role==='student'?plan(db,user.id)?.plan||'basic':null,
        activeLearners:db.get("SELECT count(*) n FROM guidance WHERE staff=? AND state='active'",user.id).n}))});
  });
  app.get('/api/members/:id',auth,access,async(req,res)=>{
    const memberId=read(id,req.params.id);
    const user=db.get('SELECT * FROM users WHERE id=?',memberId);
    ensure(user,404,'MEMBER_NOT_FOUND','Member not found.');
    const offset=page(req.query.page)*25;
    const account=db.get('SELECT * FROM accounts WHERE user_id=?',memberId)||null;
    const positions=db.all('SELECT p.*,i.name,i.provider_key,i.base FROM positions p JOIN instruments i ON i.symbol=p.symbol WHERE user_id=? AND qty>0',memberId);
    const ticks=new Map((await quotes(positions)).map(q=>[q.symbol,q]));
    const relationships=db.all(`SELECT g.*,s.name student_name,s.email student_email,u.name staff_name,u.email staff_email
      FROM guidance g JOIN users s ON s.id=g.student JOIN users u ON u.id=g.staff WHERE g.student=? OR g.staff=? ORDER BY g.id DESC LIMIT 25 OFFSET ?`,memberId,memberId,offset);
    const assignments=db.all(`SELECT a.*,g.student,g.staff,s.name student_name,u.name instructor_name FROM assignments a
      JOIN guidance g ON g.id=a.relationship JOIN users s ON s.id=g.student JOIN users u ON u.id=g.staff
      WHERE g.student=? OR g.staff=? ORDER BY a.id DESC LIMIT 25 OFFSET ?`,memberId,memberId,offset)
      .map(a=>({...a,submissions:db.all('SELECT * FROM submissions WHERE assignment=? ORDER BY id DESC LIMIT 20',a.id)}));
    const learning=db.all(`SELECT c.id,c.title,c.difficulty,c.policy,e.created,
      (SELECT count(*) FROM lessons WHERE course=c.id) lessons,
      (SELECT count(*) FROM progress p JOIN lessons l ON l.id=p.lesson WHERE l.course=c.id AND p.student=?) completed
      FROM enrollments e JOIN courses c ON c.id=e.course WHERE e.student=? ORDER BY c.id LIMIT 25 OFFSET ?`,memberId,memberId,offset);
    const activity=db.all('SELECT a.*,u.name actor_name FROM audit a LEFT JOIN users u ON u.id=a.actor WHERE a.actor=? OR a.target=? ORDER BY a.id DESC LIMIT 25 OFFSET ?',memberId,String(memberId),offset);
    log(db,req.user.id,'member.view',memberId,{page:page(req.query.page)});
    res.json({user:userView(user),profile:db.get('SELECT * FROM staff WHERE user_id=?',memberId)||null,
      subscription:plan(db,memberId)||null,subscriptions:db.all('SELECT * FROM subscriptions WHERE student=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,offset),
      applications:db.all('SELECT * FROM applications WHERE student=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,offset),
      account:account?{...account,reservedCash:cashReserved(db,memberId),positions:positions.map(({provider_key,base,...p})=>({...p,sellable:p.qty-sharesReserved(db,memberId,p.symbol),quote:ticks.get(p.symbol)}))}:null,
      journal:db.all('SELECT * FROM journal WHERE user_id=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,offset),
      watchlists:db.all('SELECT id,name FROM watchlists WHERE user_id=? ORDER BY id',memberId).map(w=>({...w,symbols:db.all('SELECT symbol FROM watchlist_items WHERE list=? ORDER BY position',w.id).map(s=>s.symbol)})),
      orders:db.all('SELECT o.*,e.price fill_price,e.fee,e.realized FROM orders o LEFT JOIN executions e ON e.order_id=o.id WHERE o.user_id=? ORDER BY o.id DESC LIMIT 25 OFFSET ?',memberId,offset),
      ledger:db.all('SELECT * FROM ledger WHERE user_id=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,offset),
      relationships,assignments,learning,activity,
      courses:db.all('SELECT * FROM courses WHERE owner=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,offset),
      plans:db.all(`SELECT p.* FROM learning_plans p JOIN guidance g ON g.id=p.relationship WHERE g.student=? OR g.staff=? ORDER BY p.updated DESC LIMIT 25 OFFSET ?`,memberId,memberId,offset),
      milestones:db.all(`SELECT m.* FROM milestones m JOIN guidance g ON g.id=m.relationship WHERE g.student=? OR g.staff=? ORDER BY m.id DESC LIMIT 25 OFFSET ?`,memberId,memberId,offset),
      quizAttempts:db.all('SELECT a.*,q.title FROM quiz_attempts a JOIN quizzes q ON q.id=a.quiz WHERE student=? ORDER BY a.id DESC LIMIT 25 OFFSET ?',memberId,offset),
      authoredQuizzes:db.all('SELECT id,title,state,created FROM quizzes WHERE owner=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,offset),
      payments:db.all('SELECT id,plan,amount,status,provider,created FROM payments WHERE student=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,offset),
      settlements:db.all('SELECT * FROM provider_settlements WHERE provider=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,offset),
      awards:db.all('SELECT * FROM capital_awards WHERE student=? OR instructor=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,memberId,offset),
      notes:db.all('SELECT n.*,u.name author_name FROM admin_notes n JOIN users u ON u.id=n.author WHERE member=? ORDER BY n.id DESC LIMIT 25 OFFSET ?',memberId,offset),
      tickets:db.all('SELECT id,subject,state,created FROM tickets WHERE user_id=? ORDER BY id DESC LIMIT 25 OFFSET ?',memberId,offset)});
  });
  const changeTarget=req=>{
    const user=db.get('SELECT * FROM users WHERE id=?',read(id,req.params.id));
    ensure(user,404,'MEMBER_NOT_FOUND','Member not found.');
    ensure(req.user.role==='superadmin' || !['admin','superadmin'].includes(user.role),403,'SUPERADMIN_REQUIRED','A super admin manages privileged accounts.');
    return user;
  };
  app.put('/api/members/:id/profile',auth,access,(req,res)=>{
    const user=changeTarget(req);
    const data=read(form({name:words(90,2),email,reason:words(400,5),capacity:numeric(1,50).optional(),expertise:words(120).optional(),languages:words(100).optional()}),req.body);
    db.tx(()=>{
      ensure(!db.get('SELECT 1 FROM users WHERE email=? AND id<>?',data.email,user.id),409,'EMAIL_IN_USE','This email is already in use.');
      db.run('UPDATE users SET name=?,email=? WHERE id=?',data.name,data.email,user.id);
      const staff=db.get('SELECT * FROM staff WHERE user_id=?',user.id);
      if(staff) {
        const active=db.get("SELECT count(*) n FROM guidance WHERE staff=? AND state='active'",user.id).n;
        ensure((data.capacity||staff.capacity)>=active,409,'CAPACITY_BELOW_ROSTER','Capacity must cover the active roster.');
        db.run('UPDATE staff SET capacity=?,expertise=?,languages=? WHERE user_id=?',data.capacity||staff.capacity,data.expertise||staff.expertise,data.languages||staff.languages,user.id);
      } else ensure(!data.capacity && !data.expertise && !data.languages,422,'STAFF_FIELDS','These profile fields apply to specialists.');
      if(data.email!==user.email) {
        db.run('DELETE FROM sessions WHERE user_id=?',user.id);
        db.run('DELETE FROM challenges WHERE user_id=?',user.id);
      }
      log(db,req.user.id,'member.profile',user.id,{before:{name:user.name,email:user.email},after:{name:data.name,email:data.email},reason:data.reason});
    });
    res.json({ok:true});
  });
  app.post('/api/members/:id/status',auth,access,(req,res)=>{
    const user=changeTarget(req);
    const data=read(form({status:z.enum(['approved','rejected','suspended','archived']),reason:words(400,5)}),req.body);
    ensure(user.id!==req.user.id,409,'SELF_STATUS','Use another authorized super admin to change your account status.');
    ensure(user.status!==data.status,409,'STATE_UNCHANGED','This member already has that status.');
    ensure(user.status!=='unverified',409,'VERIFICATION_REQUIRED','The account owner must first verify their email.');
    db.tx(()=>{
      if(data.status==='rejected') ensure(user.status==='pending',409,'PENDING_REQUIRED','Only a pending application may be rejected.');
      if(data.status==='approved') ensure(['pending','suspended','archived','rejected'].includes(user.status),409,'STATUS_UNAVAILABLE','This member cannot be approved from the current state.');
      db.run('UPDATE users SET status=? WHERE id=?',data.status,user.id);
      const application=db.get("SELECT id FROM applications WHERE student=? AND state='pending'",user.id);
      if(application && ['approved','rejected'].includes(data.status)) db.run('UPDATE applications SET state=?,note=?,decided=? WHERE id=?',data.status,data.reason,Date.now(),application.id);
      db.run('DELETE FROM sessions WHERE user_id=?',user.id);
      if(data.status!=='approved') db.run("UPDATE orders SET state='canceled',hold=0,reason='Account access ended' WHERE user_id=? AND state IN ('pending','open')",user.id);
      reconcileGuidance(db);
      notify(db,user.id,'Your account status is '+data.status+'. '+data.reason,'/overview');
      log(db,req.user.id,'member.status',user.id,{from:user.status,to:data.status,reason:data.reason});
    });
    res.json({ok:true});
  });
  app.post('/api/members/:id/permissions',auth,access,(req,res)=>{
    ensure(req.user.role==='superadmin',403,'SUPERADMIN_REQUIRED','Only a super admin changes role permissions.');
    const member=read(id,req.params.id);
    const {role,reason}=read(form({role:z.enum(roles),reason:words(400,5)}),req.body);
    db.tx(()=>{
      const target=db.get('SELECT * FROM users WHERE id=?',member);
      ensure(target,404,'MEMBER_NOT_FOUND','Member not found.');
      if(target.role==='superadmin' && role!=='superadmin') ensure(db.get("SELECT count(*) n FROM users WHERE role='superadmin' AND status='approved' AND id<>?",target.id).n>0,
        409,'LAST_SUPERADMIN','Keep an approved super admin account.');
      if(role!==target.role) {
        ensure(!db.get("SELECT 1 FROM guidance WHERE (staff=? OR student=?) AND state IN ('active','pending')",target.id,target.id),
          409,'RELATIONSHIPS_ACTIVE','End or cancel active relationships before changing roles.');
        const teacherRecords=db.get('SELECT 1 FROM courses WHERE owner=? UNION SELECT 1 FROM quizzes WHERE owner=?',target.id,target.id);
        ensure(!teacherRecords || ['instructor','provider'].includes(role),409,'CONTENT_OWNERSHIP','This account owns content and must retain an author role.');
        ensure(!db.get("SELECT 1 FROM subscriptions WHERE student=? AND state IN ('active','canceled') AND ends>?",target.id,Date.now()) || role==='student',
          409,'PAID_ACCESS_ACTIVE','Finish or refund active learner subscriptions before changing the learner role.');
        ensure(!db.get('SELECT 1 FROM positions WHERE user_id=? AND qty>0',target.id) && !db.get("SELECT 1 FROM orders WHERE user_id=? AND state IN ('open','pending')",target.id),
          409,'TRADING_ACTIVE','Close positions and working orders before changing roles.');
      }
      db.run('UPDATE users SET role=? WHERE id=?',role,target.id);
      if(['instructor','provider'].includes(role)) db.run("INSERT OR IGNORE INTO staff VALUES (?,8,'Learning support','English')",target.id);
      db.run('DELETE FROM sessions WHERE user_id=?',target.id);
      log(db,req.user.id,'member.permissions',target.id,{from:{role:target.role},to:{role},reason});
    });
    res.json({ok:true});
  });
  app.post('/api/members/:id/revoke-sessions',auth,access,(req,res)=>{
    const user=changeTarget(req);
    const {reason}=read(form({reason:words(400,5)}),req.body);
    db.tx(()=>{db.run('DELETE FROM sessions WHERE user_id=?',user.id);log(db,req.user.id,'member.revoke_sessions',user.id,{reason});});
    res.json({ok:true});
  });
  app.post('/api/members/:id/reset-password',auth,access,async(req,res)=>{
    const user=changeTarget(req);
    const {reason}=read(form({reason:words(400,5)}),req.body);
    ensure(user.status!=='unverified',409,'VERIFICATION_REQUIRED','This account needs initial email verification.');
    const result=await issue(db,user,'reset');
    log(db,req.user.id,'member.password_recovery',user.id,{reason});
    res.json(result);
  });
  app.post('/api/members/:id/notes',auth,access,(req,res)=>{
    const member=read(id,req.params.id);
    ensure(db.get('SELECT 1 FROM users WHERE id=?',member),404,'MEMBER_NOT_FOUND','Member not found.');
    const {body}=read(form({body:words(4000,5)}),req.body);
    db.run('INSERT INTO admin_notes(member,author,body,created) VALUES (?,?,?,?)',member,req.user.id,body,Date.now());
    res.status(201).json({ok:true});
  });
  app.post('/api/members',auth,access,(req,res)=>{
    const data=read(form({name:words(90,2),email,password:password.min(16),role:z.enum(['instructor','provider','admin']),
      capacity:numeric(1,50).optional(),expertise:words(120).optional(),languages:words(100).optional(),
      mfa:z.string().regex(/^[A-Z2-7]{16,128}$/i).optional(),reason:words(400,5)}),req.body);
    ensure(data.role!=='admin' || req.user.role==='superadmin',403,'SUPERADMIN_REQUIRED','Only super admins create administrators.');
    ensure(!db.get('SELECT 1 FROM users WHERE email=?',data.email),409,'EMAIL_IN_USE','An account already uses this email.');
    const uid=db.tx(()=>{
      const result=db.run("INSERT INTO users(name,email,password,role,status,mfa) VALUES (?,?,?,?,'pending',?)",data.name,data.email,passwordHash(data.password),data.role,data.mfa||null);
      if(data.role!=='admin') db.run('INSERT INTO staff VALUES (?,?,?,?)',result.lastInsertRowid,data.capacity||8,data.expertise||'Course content',data.languages||'English');
      log(db,req.user.id,'member.create',result.lastInsertRowid,{role:data.role,reason:data.reason});
      return result.lastInsertRowid;
    });
    res.status(201).json({id:uid});
  });
  app.get('/api/teaching/learners',auth,(req,res)=>{
    approved(req.user,'instructor');
    db.tx(()=>reconcileGuidance(db));
    const rows=db.all(`SELECT g.id relationship,u.id,u.name,u.email FROM guidance g JOIN users u ON u.id=g.student
      WHERE g.staff=? AND g.kind='instructor' AND g.state='active' ORDER BY u.name LIMIT 50`,req.user.id);
    res.json(rows.map(u=>({...u,plan:plan(db,u.id)?.plan||'basic',
      awardedLastWeek:db.get('SELECT coalesce(sum(amount),0) n FROM capital_awards WHERE student=? AND created>?',u.id,Date.now()-7*86400000).n,
      reviewedWork:db.all(`SELECT s.id,s.reviewed,a.title FROM submissions s JOIN assignments a ON a.id=s.assignment
        JOIN guidance g ON g.id=a.relationship WHERE g.student=? AND g.staff=? AND s.reviewed IS NOT NULL
        AND NOT EXISTS(SELECT 1 FROM capital_awards WHERE submission=s.id) ORDER BY s.id DESC LIMIT 25`,u.id,req.user.id)})));
  });
  app.post('/api/teaching/learners/:id/award',auth,(req,res)=>{
    const data=read(form({submission:id,amount:numeric(1,1000000),reason:words(1000,10)}),req.body);
    db.tx(()=>reconcileGuidance(db));
    res.json(grantCapital(db,req.user,read(id,req.params.id),data.submission,data.amount,data.reason));
  });
}
