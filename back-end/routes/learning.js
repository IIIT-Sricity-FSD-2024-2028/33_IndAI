import { ensure, log, notify } from '../db.js';
import { approved, plan, rank, reconcileGuidance, student } from '../services/access.js';
import { courseAuthor } from '../services/learning-access.js';
import { removeResourceLink } from '../services/resources.js';
import { form, id, numeric, page, read, words, z } from '../validation.js';

const courseData = form({ title:words(120, 4), description:words(3000, 15), outcomes:words(2000, 5),
  difficulty:z.enum(['introductory','intermediate','advanced']), prerequisites:z.string().trim().max(1000), policy:z.enum(['basic','pro','plus']) });
const taskData = form({ relationship:id, title:words(120, 4), body:words(5000, 5), due:numeric(1, 4102444800000) });
export function learningRoutes(app, db, auth) {
  const course = req => {
    const item = db.get('SELECT * FROM courses WHERE id=?', read(id, req.params.id));
    ensure(item, 404, 'COURSE_NOT_FOUND', 'Course not found.');
    return item;
  };
  const managed = (req, states) => {
    approved(req.user);
    ensure(courseAuthor(req.user),403,'FORBIDDEN','Only course authors can manage course content.');
    const item = course(req);
    ensure(item.owner === req.user.id, 404, 'COURSE_NOT_FOUND', 'Course not found.');
    ensure(states.includes(item.state), 409, 'INVALID_STATE', 'This course is no longer editable.');
    return item;
  };
  const eligible = (req, item, newEnrollment = false) => {
    student(db, req.user, item.policy);
    const enrolled = db.get('SELECT 1 FROM enrollments WHERE student=? AND course=?', req.user.id, item.id);
    ensure(item.state === 'published' || (item.state === 'archived' && enrolled && !newEnrollment), 404, 'COURSE_NOT_FOUND', 'Course not found.');
    return Boolean(enrolled);
  };
  app.get('/api/courses', auth, (req, res) => {
    approved(req.user);
    const user = req.user.id, offset = page(req.query.page) * 24;
    if (req.user.role === 'student') {
      const level = rank[plan(db, user)?.plan || 'basic'];
      res.json(db.all(`SELECT c.*,u.name instructor,
        EXISTS(SELECT 1 FROM enrollments WHERE course=c.id AND student=?) enrolled,
        (SELECT count(*) FROM lessons WHERE course=c.id) lessons,
        (SELECT count(*) FROM progress p JOIN lessons l ON l.id=p.lesson WHERE l.course=c.id AND p.student=?) complete
        FROM courses c JOIN users u ON u.id=c.owner WHERE c.state='published' OR (c.state='archived' AND
        EXISTS(SELECT 1 FROM enrollments WHERE course=c.id AND student=?)) ORDER BY c.id LIMIT 24 OFFSET ?`, user,user,user,offset)
        .map(item => ({ ...item, locked:rank[item.policy] > level })));
      return;
    }
    const reviewer = req.user.role==='superadmin';
    ensure(courseAuthor(req.user) || reviewer, 403, 'FORBIDDEN', 'This role does not manage courses.');
    res.json(db.all('SELECT * FROM courses WHERE owner=? OR ? ORDER BY id DESC LIMIT 24 OFFSET ?', user, Number(reviewer), offset));
  });
  app.get('/api/courses/:id', auth, (req, res) => {
    approved(req.user);
    ensure(req.user.role!=='admin',403,'FORBIDDEN','Course review requires Super Admin access.');
    const item = course(req);
    const user = req.user.id;
    const management = (courseAuthor(req.user) && user === item.owner) || req.user.role==='superadmin';
    const enrolled = management || eligible(req, item);
    res.json({ ...item, enrolled,
      quizzes:enrolled?db.all("SELECT id,title,state FROM quizzes WHERE course=? AND (state IN ('published','archived') OR owner=?) ORDER BY id",item.id,req.user.id):[],
      lessons:db.all(`SELECT l.id,l.title,l.module,l.position,
      CASE WHEN ? THEN l.body ELSE NULL END body, EXISTS(SELECT 1 FROM progress WHERE lesson=l.id AND student=?) done
      FROM lessons l WHERE l.course=? ORDER BY l.position`, Number(enrolled),user,item.id) });
  });
  app.post('/api/courses', auth, (req, res) => {
    approved(req.user);
    ensure(courseAuthor(req.user),403,'FORBIDDEN','Only course authors can manage course content.');
    const data = read(courseData, req.body);
    const row = db.run("INSERT INTO courses(owner,title,description,outcomes,difficulty,prerequisites,policy,state) VALUES (?,?,?,?,?,?,?,'draft')",
      req.user.id,data.title,data.description,data.outcomes,data.difficulty,data.prerequisites,data.policy);
    res.status(201).json({ id:row.lastInsertRowid });
  });
  app.put('/api/courses/:id', auth, (req,res) => {
    const item = managed(req,['draft']);
    const data = read(courseData,req.body);
    db.run('UPDATE courses SET title=?,description=?,outcomes=?,difficulty=?,prerequisites=?,policy=? WHERE id=?',
      data.title,data.description,data.outcomes,data.difficulty,data.prerequisites,data.policy,item.id);
    res.json({ok:true});
  });
  app.delete('/api/courses/:id', auth, (req,res) => {
    approved(req.user);
    ensure(courseAuthor(req.user),403,'FORBIDDEN','Only course authors can delete courses they own.');
    const outcome=db.tx(()=>{
      const item=course(req);
      ensure(item.owner===req.user.id,404,'COURSE_NOT_FOUND','Course not found.');
      if(item.state==='published') {
        if(req.user.role==='provider') {
          ensure(!db.get(`SELECT 1 FROM course_terms WHERE course=? AND state='agreed'
            AND coalesce(offered,requested)>0 AND NOT EXISTS(SELECT 1 FROM provider_settlements WHERE course=?)`,item.id,item.id),
          409,'EARNING_NOT_RECORDED','An Admin must record the agreed course earning before this course can be archived.');
        }
        db.run("UPDATE courses SET state='archived' WHERE id=?",item.id);
        log(db,req.user.id,'course.archive',item.id,{reason:'Course owner requested deletion of a published course'});
        return 'archived';
      }
      ensure(item.state==='draft',409,'COURSE_RETAINED',item.state==='review'
        ?'This course is under review. A Super Admin can return it to draft before deletion.'
        :'This course is archived and retained for its history.');
      ensure(!db.get(`SELECT 1 WHERE
        EXISTS(SELECT 1 FROM enrollments WHERE course=?) OR
        EXISTS(SELECT 1 FROM progress p JOIN lessons l ON l.id=p.lesson WHERE l.course=?) OR
        EXISTS(SELECT 1 FROM quizzes q WHERE q.course=? AND (
          q.state<>'draft' OR q.owner<>? OR EXISTS(SELECT 1 FROM quiz_attempts WHERE quiz=q.id)
          OR EXISTS(SELECT 1 FROM quiz_drafts WHERE quiz=q.id) OR EXISTS(SELECT 1 FROM quiz_recipients WHERE quiz=q.id))) OR
        EXISTS(SELECT 1 FROM course_terms WHERE course=?) OR
        EXISTS(SELECT 1 FROM provider_settlements WHERE course=?)`,item.id,item.id,item.id,req.user.id,item.id,item.id),
      409,'COURSE_HISTORY','This course has learner activity, assessment records or commercial history and must be retained.');
      const links=db.all(`SELECT id,resource FROM resource_links WHERE
        (kind='course' AND target=?) OR (kind='lesson' AND target IN (SELECT id FROM lessons WHERE course=?))
        OR (kind='quiz' AND target IN (SELECT id FROM quizzes WHERE course=?))`,item.id,item.id,item.id);
      for(const link of links) removeResourceLink(db,link);
      db.run('DELETE FROM quizzes WHERE course=?',item.id);
      db.run('DELETE FROM lessons WHERE course=?',item.id);
      db.run('DELETE FROM courses WHERE id=?',item.id);
      db.run("UPDATE notifications SET path='' WHERE path=?",'/courses/'+item.id);
      log(db,req.user.id,'course.delete',item.id,{title:item.title});
      return 'deleted';
    });
    res.locals.requestAudited=true;
    res.json({outcome});
  });
  app.post('/api/courses/:id/lessons', auth, (req, res) => {
    const item = managed(req, ['draft']);
    const data = read(form({ module:words(100), title:words(120, 4), body:words(18000, 10) }), req.body);
    const result = db.run('INSERT INTO lessons(course,module,title,body,position) VALUES (?,?,?,?,(SELECT coalesce(max(position),0)+1 FROM lessons WHERE course=?))',
      item.id,data.module,data.title,data.body,item.id);
    res.status(201).json({ id:result.lastInsertRowid });
  });
  app.post('/api/courses/:id/submit', auth, (req, res) => {
    db.tx(() => {
      const item = managed(req, ['draft']);
      ensure(db.get('SELECT 1 FROM lessons WHERE course=?', item.id), 422, 'LESSON_REQUIRED', 'Add at least one lesson before review.');
      db.run("UPDATE courses SET state='review' WHERE id=?", item.id);
      for(const reviewer of db.all("SELECT id FROM users WHERE role='superadmin' AND status='approved'")) {
        notify(db,reviewer.id,item.title + ' is ready for course review.','/courses/'+item.id);
      }
    });
    res.json({ ok:true });
  });
  app.post('/api/courses/:id/review', auth, (req, res) => {
    approved(req.user,'superadmin');
    const { action, reason } = read(form({ action:z.enum(['publish','return','archive']), reason:words(400).optional() }), req.body);
    ensure(action === 'publish' || reason, 422, 'REASON_REQUIRED', 'Enter a reason for this decision.');
    db.tx(() => {
      const item = course(req);
      ensure(item.state === (action === 'archive' ? 'published' : 'review'), 409, 'STATE_CHANGED', 'This course is no longer awaiting that action.');
      if(action==='publish' && db.get('SELECT role FROM users WHERE id=?',item.owner)?.role==='provider') {
        ensure(db.get("SELECT 1 FROM course_terms WHERE course=? AND state='agreed'",item.id),409,'TERMS_REQUIRED','Provider commercial terms must be agreed before publication.');
      }
      const state = { publish:'published', return:'draft', archive:'archived' }[action];
      db.run('UPDATE courses SET state=? WHERE id=?', state,item.id);
      log(db,req.user.id,'course.'+action,item.id,{ reason });
      notify(db,item.owner,`${item.title} is ${state}.${reason ? ' ' + reason : ''}`, '/courses/' + item.id);
    });
    res.json({ ok:true });
  });
  app.post('/api/courses/:id/enroll', auth, (req, res) => {
    db.tx(()=>{
      const item = course(req);
      eligible(req,item,true);
      db.run('INSERT OR IGNORE INTO enrollments VALUES (?,?,?)',req.user.id,item.id,Date.now());
    });
    res.json({ ok:true });
  });
  app.post('/api/courses/:id/lessons/:lesson/complete', auth, (req, res) => {
    const item = course(req);
    ensure(eligible(req,item), 403, 'ENROLLMENT_REQUIRED', 'Enroll before completing a lesson.');
    const lesson = read(id,req.params.lesson);
    ensure(db.get('SELECT 1 FROM lessons WHERE id=? AND course=?',lesson,item.id),404,'LESSON_NOT_FOUND','Lesson not found.');
    db.run('INSERT OR IGNORE INTO progress VALUES (?,?,?)',req.user.id,lesson,Date.now());
    res.json({ ok:true });
  });

  const relationship = (req, relationshipId, kind, actor) => {
    db.tx(() => reconcileGuidance(db));
    approved(req.user, actor === 'staff' ? kind : 'student');
    const row = db.get('SELECT * FROM guidance WHERE id=? AND kind=?',relationshipId,kind);
    ensure(row && row[actor] === req.user.id && row.state === 'active', 404, 'RELATIONSHIP_NOT_FOUND', 'An active relationship is required.');
    return row;
  };
  app.get('/api/tasks', auth, (req, res) => {
    approved(req.user);
    db.tx(() => reconcileGuidance(db));
    const user = req.user.id;
    const offset = page(req.query.page) * 25;
    const assignments = db.all(`SELECT a.*,g.student,g.staff,g.state relationship_state,u.name student_name FROM assignments a
      JOIN guidance g ON g.id=a.relationship JOIN users u ON u.id=g.student WHERE g.student=? OR (g.staff=? AND g.state='active') ORDER BY a.id DESC LIMIT 25 OFFSET ?`,user,user,offset)
      .map(a => ({ ...a,
        quizzes:db.all("SELECT id,title,state FROM quizzes WHERE assignment=? AND (state IN ('published','archived') OR owner=?) ORDER BY id",a.id,req.user.id),
        submissions:db.all('SELECT * FROM submissions WHERE assignment=? ORDER BY id DESC LIMIT 20',a.id) }));
    const milestones = db.all(`SELECT m.*,g.student,g.staff,g.state relationship_state,u.name student_name FROM milestones m
      JOIN guidance g ON g.id=m.relationship JOIN users u ON u.id=g.student WHERE g.student=? OR (g.staff=? AND g.state='active') ORDER BY m.due LIMIT 25 OFFSET ?`,user,user,offset);
    const learningPlans = db.all(`SELECT p.*,g.state relationship_state,u.name student_name FROM learning_plans p
      JOIN guidance g ON g.id=p.relationship JOIN users u ON u.id=g.student
      WHERE g.student=? OR (g.staff=? AND g.state='active') ORDER BY p.updated DESC LIMIT 25 OFFSET ?`,user,user,offset);
    res.json({ assignments,milestones,learningPlans });
  });
  for (const [resource,kind] of [['assignments','instructor'],['milestones','provider']]) {
    app.post('/api/' + resource, auth, (req, res) => {
      const data = read(taskData,req.body);
      ensure(data.due > Date.now(),422,'DUE_DATE','Choose a due date in the future.');
      const row = relationship(req,data.relationship,kind,'staff');
      const created = db.tx(() => {
        const result = db.run(`INSERT INTO ${resource}(relationship,title,body,due) VALUES (?,?,?,?)`,row.id,data.title,data.body,data.due);
        notify(db,row.student,'New ' + resource.slice(0,-1) + ': ' + data.title, '/tasks');
        return result.lastInsertRowid;
      });
      res.status(201).json({ id:created,ok:true });
    });
  }
  app.put('/api/learning-plans/:id',auth,(req,res) => {
    const row = relationship(req,read(id,req.params.id),'provider','staff');
    const data = read(form({title:words(120,4),body:words(8000,10)}),req.body);
    db.tx(() => {
      db.run(`INSERT INTO learning_plans VALUES (?,?,?,?) ON CONFLICT(relationship) DO UPDATE
        SET title=excluded.title,body=excluded.body,updated=excluded.updated`,row.id,data.title,data.body,Date.now());
      notify(db,row.student,'Your provider updated your learning plan.','/tasks');
    });
    res.json({ok:true});
  });
  app.post('/api/assignments/:id/submit', auth, (req, res) => {
    const item = db.get('SELECT * FROM assignments WHERE id=?',read(id,req.params.id));
    ensure(item,404,'ASSIGNMENT_NOT_FOUND','Assignment not found.');
    const { body } = read(form({ body:words(10000,5) }),req.body);
    const row = relationship(req,item.relationship,'instructor','student');
    const created = db.tx(() => {
      const result = db.run('INSERT INTO submissions(assignment,body,created) VALUES (?,?,?)',item.id,body,Date.now());
      notify(db,row.staff,'Submission received for ' + item.title + '.', '/tasks');
      return result.lastInsertRowid;
    });
    res.status(201).json({ id:created,ok:true });
  });
  app.post('/api/submissions/:id/review', auth, (req, res) => {
    const item = db.get('SELECT s.*,a.relationship,a.title FROM submissions s JOIN assignments a ON a.id=s.assignment WHERE s.id=?',read(id,req.params.id));
    ensure(item,404,'SUBMISSION_NOT_FOUND','Submission not found.');
    const { feedback } = read(form({ feedback:words(10000,5) }),req.body);
    const row = relationship(req,item.relationship,'instructor','staff');
    db.tx(() => {
      ensure(db.run('UPDATE submissions SET feedback=?,reviewed=? WHERE id=? AND reviewed IS NULL',feedback,Date.now(),item.id).changes,409,'ALREADY_REVIEWED','This submission has already been reviewed.');
      notify(db,row.student,'Feedback posted for ' + item.title + '.', '/tasks');
    });
    res.json({ ok:true });
  });
  app.post('/api/milestones/:id/state', auth, (req, res) => {
    const item = db.get('SELECT * FROM milestones WHERE id=?',read(id,req.params.id));
    ensure(item,404,'MILESTONE_NOT_FOUND','Milestone not found.');
    const row = relationship(req,item.relationship,'provider','staff');
    const { state } = read(form({ state:z.enum(['planned','in-progress','complete']) }),req.body);
    db.tx(() => {
      db.run('UPDATE milestones SET state=? WHERE id=?',state,item.id);
      notify(db,row.student,'Milestone update: ' + item.title + '.', '/tasks');
    });
    res.json({ ok:true });
  });
}
