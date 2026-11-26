import { ensure,log,notify,notifyAdmins } from '../db.js';
import { admin, approved, isAdmin } from '../services/access.js';
import { form,id,numeric,page,read,words,z } from '../validation.js';

export function providerRoutes(app,db,auth) {
  app.get('/api/provider',auth,(req,res)=>{
    approved(req.user,'provider');
    res.json({
      courses:db.all(`SELECT c.*,t.requested,t.offered,t.state terms_state,t.note,
        (SELECT count(*) FROM enrollments WHERE course=c.id) enrollments,
        (SELECT count(*) FROM quiz_attempts a JOIN quizzes q ON q.id=a.quiz WHERE q.course=c.id) quizSubmissions
        FROM courses c LEFT JOIN course_terms t ON t.course=c.id WHERE c.owner=? ORDER BY c.id DESC LIMIT 25 OFFSET ?`,req.user.id,page(req.query.page)*25),
      settlements:db.all('SELECT s.*,c.title FROM provider_settlements s JOIN courses c ON c.id=s.course WHERE provider=? ORDER BY s.id DESC LIMIT 25 OFFSET ?',req.user.id,page(req.query.page)*25),
      totals:db.get("SELECT coalesce(sum(amount),0) earned,coalesce(sum(CASE WHEN state='paid' THEN amount ELSE 0 END),0) paid FROM provider_settlements WHERE provider=?",req.user.id)
    });
  });
  app.get('/api/courses/:id/terms',auth,(req,res)=>{
    approved(req.user);
    const course=db.get('SELECT * FROM courses WHERE id=?',read(id,req.params.id));
    ensure(course && (course.owner===req.user.id || isAdmin(req.user)),403,'FORBIDDEN','Commercial terms are visible to the provider and relevant administrators.');
    res.json(db.get('SELECT * FROM course_terms WHERE course=?',course.id)||null);
  });
  app.post('/api/courses/:id/terms',auth,(req,res)=>{
    approved(req.user,'provider');
    const course=db.get('SELECT * FROM courses WHERE id=?',read(id,req.params.id));
    ensure(course?.owner===req.user.id && ['draft','review'].includes(course.state),403,'COURSE_OWNERSHIP','Choose your draft or review course.');
    const {amount,note}=read(form({amount:numeric(0,100000000),note:words(2000,5)}),req.body);
    const current=db.get('SELECT state FROM course_terms WHERE course=?',course.id);
    ensure(!current || current.state==='rejected',409,'TERMS_PENDING','Existing commercial terms must be resolved first.');
    db.tx(()=>{
      db.run("INSERT INTO course_terms VALUES (?,?,NULL,'submitted',?,?) ON CONFLICT(course) DO UPDATE SET requested=excluded.requested,offered=NULL,state='submitted',note=excluded.note,updated=excluded.updated",
        course.id,amount,note,Date.now());
      notifyAdmins(db,'Course licensing proposal: '+course.title,'/commerce');
    });
    res.status(201).json({ok:true});
  });
  app.get('/api/commerce',auth,(req,res)=>{
    admin(req.user);
    res.json({proposals:db.all(`SELECT t.*,c.title,c.owner,c.state course_state,u.name provider,
      EXISTS(SELECT 1 FROM provider_settlements WHERE course=c.id) earning_recorded FROM course_terms t JOIN courses c ON c.id=t.course
      JOIN users u ON u.id=c.owner ORDER BY t.updated DESC LIMIT 25 OFFSET ?`,page(req.query.page)*25),
      settlements:db.all('SELECT s.*,c.title,u.name provider_name FROM provider_settlements s JOIN courses c ON c.id=s.course JOIN users u ON u.id=s.provider ORDER BY s.id DESC LIMIT 25 OFFSET ?',page(req.query.page)*25)});
  });
  app.post('/api/commerce/:id/decision',auth,(req,res)=>{
    admin(req.user);
    const courseId=read(id,req.params.id);
    const {action,amount,note}=read(form({action:z.enum(['accept','counter','reject']),amount:numeric(0,100000000).optional(),note:words(2000,5)}),req.body);
    ensure(action!=='counter' || amount!=null,422,'AMOUNT_REQUIRED','Enter a counteroffer amount.');
    ensure(action==='counter' || amount==null,422,'AMOUNT_NOT_ALLOWED','Only counteroffers can include a different amount.');
    db.tx(()=>{
      const term=db.get('SELECT * FROM course_terms WHERE course=?',courseId);
      ensure(term?.state==='submitted',409,'STATE_CHANGED','The proposal is no longer awaiting a decision.');
      const state={accept:'agreed',counter:'countered',reject:'rejected'}[action];
      const offered=action==='accept'?term.requested:action==='counter'?amount:null;
      db.run('UPDATE course_terms SET state=?,offered=?,note=?,updated=? WHERE course=?',state,offered,note,Date.now(),courseId);
      const course=db.get('SELECT * FROM courses WHERE id=?',courseId);
      notify(db,course.owner,'Your course proposal is '+state+'.','/provider');
      log(db,req.user.id,'course_terms.'+action,courseId,{note,amount});
    });
    res.json({ok:true});
  });
  app.post('/api/courses/:id/terms/respond',auth,(req,res)=>{
    approved(req.user,'provider');
    const courseId=read(id,req.params.id);
    const {accept}=read(form({accept:z.boolean()}),req.body);
    db.tx(()=>{
      const course=db.get('SELECT * FROM courses WHERE id=?',courseId);
      const term=db.get('SELECT * FROM course_terms WHERE course=?',courseId);
      ensure(course?.owner===req.user.id && term?.state==='countered',409,'COUNTEROFFER_UNAVAILABLE','No counteroffer is awaiting your response.');
      db.run('UPDATE course_terms SET state=?,updated=? WHERE course=?',accept?'agreed':'rejected',Date.now(),courseId);
      log(db,req.user.id,'course_terms.response',courseId,{accepted:accept});
    });
    res.json({ok:true});
  });
  app.post('/api/commerce/:id/earning',auth,(req,res)=>{
    admin(req.user);
    const courseId=read(id,req.params.id);
    db.tx(()=>{
      const course=db.get('SELECT * FROM courses WHERE id=?',courseId);
      const term=db.get('SELECT * FROM course_terms WHERE course=?',courseId);
      ensure(course?.state==='published' && term?.state==='agreed',409,'AGREEMENT_REQUIRED','Earnings require a published course and agreed commercial terms.');
      const amount=term.offered??term.requested;
      ensure(amount>0 && !db.get('SELECT 1 FROM provider_settlements WHERE course=?',courseId),409,'EARNING_EXISTS','This agreement has no new payable earning.');
      db.run("INSERT INTO provider_settlements(course,provider,amount,state,created) VALUES (?,?,?,'earned',?)",courseId,course.owner,amount,Date.now());
      notify(db,course.owner,'Your course licensing earning is recorded.','/provider');
    });
    res.status(201).json({ok:true});
  });
  app.post('/api/settlements/:id/paid',auth,(req,res)=>{
    admin(req.user);
    const {reference}=read(form({reference:words(200,5)}),req.body);
    const result=db.run("UPDATE provider_settlements SET state='paid',reference=?,paid=? WHERE id=? AND state='earned'",reference,Date.now(),read(id,req.params.id));
    ensure(result.changes,409,'SETTLEMENT_UNAVAILABLE','The earning is no longer awaiting payment.');
    res.json({ok:true});
  });
}
