import { ensure,notify } from '../db.js';
import { approved,isAdmin } from '../services/access.js';
import { canReadQuiz,canReadAssignment,canReadCourse,courseAuthor } from '../services/learning-access.js';
import { form,id,numeric,page,read,words,z } from '../validation.js';

const questionSchema=form({kind:z.enum(['mcq','short','long']),prompt:words(2000,3),options:z.array(words(500)).min(2).max(10).optional(),
  correct:numeric(0,9).optional(),points:numeric(1,100),required:z.boolean()}).superRefine((q,ctx)=>{
  if(q.kind==='mcq' && (!q.options || q.correct==null || q.correct>=q.options.length || new Set(q.options).size!==q.options.length))
    ctx.addIssue({code:'custom',message:'MCQs need distinct options and a valid correct answer.'});
  if(q.kind!=='mcq' && (q.options || q.correct!=null)) ctx.addIssue({code:'custom',message:'Written questions do not use answer options.'});
});
const quizSchema=form({title:words(120,4),description:z.string().trim().max(2000),course:id.optional(),assignment:id.optional(),
  recipients:z.array(id).max(100).optional(),due:numeric(1,4102444800000).optional(),questions:z.array(questionSchema).min(1).max(50)});
const answersSchema=form({answers:z.record(z.string().max(10000)).refine(a=>Object.keys(a).length<=50,'Too many answers.')});
const questions=(db,quiz)=>db.all('SELECT * FROM quiz_questions WHERE quiz=? ORDER BY position',quiz).map(q=>({...q,options:q.options?JSON.parse(q.options):null}));
function validateAnswers(items,answers,final=false) {
  ensure(Object.keys(answers).every(key=>items.some(q=>String(q.id)===key)),422,'INVALID_ANSWER','An answer references an unknown question.');
  for(const q of items) {
    const answer=answers[q.id]?.trim() || '';
    ensure(!final || !q.required || answer.length>0,422,'ANSWER_REQUIRED','Complete all required questions.');
    if(answer && q.kind==='mcq') ensure(/^\d+$/.test(answer) && Number(answer)<q.options.length,422,'INVALID_CHOICE','Choose an available answer option.');
    if(q.kind==='short') ensure(answer.length<=1000,422,'ANSWER_TOO_LONG','Short answers allow 1,000 characters.');
  }
}
export function quizRoutes(app,db,auth) {
  const owned=req=>{
    approved(req.user);
    const quiz=db.get('SELECT * FROM quizzes WHERE id=?',read(id,req.params.id));
    ensure(quiz && quiz.owner===req.user.id,404,'QUIZ_NOT_FOUND','Your quiz was not found.');
    return quiz;
  };
  app.get('/api/quizzes',auth,(req,res)=>{
    approved(req.user);
    const offset=page(req.query.page)*24;
    const rows=req.user.role==='student'?db.all(`SELECT DISTINCT q.* FROM quizzes q
      LEFT JOIN quiz_recipients r ON r.quiz=q.id AND r.student=?
      LEFT JOIN enrollments e ON e.course=q.course AND e.student=?
      LEFT JOIN assignments a ON a.id=q.assignment LEFT JOIN guidance g ON g.id=a.relationship
      WHERE q.state IN ('published','archived') AND (r.student IS NOT NULL OR e.student IS NOT NULL OR g.student=?)
      ORDER BY q.id DESC LIMIT 24 OFFSET ?`,req.user.id,req.user.id,req.user.id,offset):
      db.all('SELECT * FROM quizzes WHERE owner=? OR ? ORDER BY id DESC LIMIT 24 OFFSET ?',req.user.id,Number(isAdmin(req.user)),offset);
    res.json(rows.map(q=>({...q,questionCount:db.get('SELECT count(*) n FROM quiz_questions WHERE quiz=?',q.id).n,
      attempt:req.user.role==='student'?db.get('SELECT id,state,score,maximum,created,graded FROM quiz_attempts WHERE quiz=? AND student=?',q.id,req.user.id)||null:null})));
  });
  app.post('/api/quizzes',auth,(req,res)=>{
    approved(req.user);
    const data=read(quizSchema,req.body);
    ensure(courseAuthor(req.user),403,'FORBIDDEN','Only instructors and course providers create quizzes.');
    ensure(!(data.course && data.assignment),422,'QUIZ_SCOPE','Choose a course or assignment scope.');
    if(data.course) {
      const course=db.get('SELECT * FROM courses WHERE id=?',data.course);
      ensure(course?.owner===req.user.id && course.state!=='archived',403,'COURSE_OWNERSHIP','Choose one of your active courses.');
    } else {
      ensure(req.user.role==='instructor',403,'COURSE_REQUIRED','Course providers create quizzes inside their own courses.');
      if(data.assignment) ensure(canReadAssignment(db,req.user,data.assignment).staff===req.user.id,403,'ASSIGNMENT_OWNERSHIP','Choose your assignment.');
      else {
        ensure(data.recipients?.length && new Set(data.recipients).size===data.recipients.length,422,'LEARNERS_REQUIRED','Select distinct active learners.');
        for(const student of data.recipients) ensure(db.get("SELECT 1 FROM guidance WHERE staff=? AND student=? AND kind='instructor' AND state='active'",req.user.id,student),
          403,'ACTIVE_LEARNER_REQUIRED','Quizzes can be assigned only to your active learners.');
      }
    }
    ensure(!data.due || data.due>Date.now(),422,'DUE_DATE','Choose a future due date.');
    const created=db.tx(()=>{
      const result=db.run("INSERT INTO quizzes(owner,course,assignment,title,description,state,due,created) VALUES (?,?,?,?,?,'draft',?,?)",
        req.user.id,data.course||null,data.assignment||null,data.title,data.description,data.due||null,Date.now());
      for(const [position,q] of data.questions.entries()) db.run('INSERT INTO quiz_questions(quiz,position,kind,prompt,options,correct,points,required) VALUES (?,?,?,?,?,?,?,?)',
        result.lastInsertRowid,position,q.kind,q.prompt,q.options?JSON.stringify(q.options):null,q.correct??null,q.points,Number(q.required));
      if(!data.course && !data.assignment) for(const student of data.recipients) db.run('INSERT INTO quiz_recipients VALUES (?,?)',result.lastInsertRowid,student);
      return result.lastInsertRowid;
    });
    res.status(201).json({id:created});
  });
  app.put('/api/quizzes/:id',auth,(req,res)=>{
    const quiz=owned(req);
    ensure(quiz.state==='draft',409,'DRAFT_REQUIRED','Only draft quizzes can be edited.');
    const data=read(form({title:words(120,4),description:z.string().trim().max(2000),due:numeric(1,4102444800000).optional(),
      questions:z.array(questionSchema).min(1).max(50)}),req.body);
    ensure(!data.due || data.due>Date.now(),422,'DUE_DATE','Choose a future deadline.');
    db.tx(()=>{
      db.run('UPDATE quizzes SET title=?,description=?,due=? WHERE id=?',data.title,data.description,data.due||null,quiz.id);
      db.run('DELETE FROM quiz_questions WHERE quiz=?',quiz.id);
      db.run('DELETE FROM quiz_drafts WHERE quiz=?',quiz.id);
      for(const [position,q] of data.questions.entries()) db.run('INSERT INTO quiz_questions(quiz,position,kind,prompt,options,correct,points,required) VALUES (?,?,?,?,?,?,?,?)',
        quiz.id,position,q.kind,q.prompt,q.options?JSON.stringify(q.options):null,q.correct??null,q.points,Number(q.required));
    });
    res.json({ok:true});
  });
  app.get('/api/quizzes/:id',auth,(req,res)=>{
    const quiz=canReadQuiz(db,req.user,read(id,req.params.id));
    const manager=quiz.owner===req.user.id || isAdmin(req.user);
    const attempt=req.user.role==='student'?db.get('SELECT * FROM quiz_attempts WHERE quiz=? AND student=?',quiz.id,req.user.id):null;
    const items=questions(db,quiz.id).map(q=>{
      if(manager || attempt?.state==='graded') return q;
      const {correct,...visible}=q;return visible;
    });
    res.json({...quiz,questions:items,manager,canReviewAttempts:quiz.owner===req.user.id||isAdmin(req.user),attempt:attempt?{...attempt,answers:db.all('SELECT * FROM quiz_answers WHERE attempt=?',attempt.id)}:null,
      draft:!manager?JSON.parse(db.get('SELECT answers FROM quiz_drafts WHERE quiz=? AND student=?',quiz.id,req.user.id)?.answers||'{}'):{}});
  });
  app.post('/api/quizzes/:id/publish',auth,(req,res)=>{
    const quiz=owned(req);
    ensure(quiz.state==='draft',409,'STATE_CHANGED','Only a draft quiz can be published.');
    ensure(!quiz.due || quiz.due>Date.now(),422,'DUE_DATE','This quiz deadline has passed.');
    db.tx(()=>{
      db.run("UPDATE quizzes SET state='published' WHERE id=?",quiz.id);
      const learners=quiz.course?db.all('SELECT student FROM enrollments WHERE course=?',quiz.course):
        quiz.assignment?[{student:canReadAssignment(db,req.user,quiz.assignment).student}]:db.all('SELECT student FROM quiz_recipients WHERE quiz=?',quiz.id);
      for(const row of learners) notify(db,row.student,'New quiz: '+quiz.title,'/quizzes/'+quiz.id);
    });
    res.json({ok:true});
  });
  app.post('/api/quizzes/:id/archive',auth,(req,res)=>{
    const quiz=owned(req);
    ensure(quiz.state==='published',409,'STATE_CHANGED','Only a published quiz can be archived.');
    db.run("UPDATE quizzes SET state='archived' WHERE id=?",quiz.id);
    res.json({ok:true});
  });
  const learnerQuiz=req=>{
    approved(req.user,'student');
    const quiz=canReadQuiz(db,req.user,read(id,req.params.id));
    ensure(quiz.state==='published' && (!quiz.due || quiz.due>Date.now()),409,'QUIZ_CLOSED','This quiz no longer accepts answers.');
    ensure(!db.get('SELECT 1 FROM quiz_attempts WHERE quiz=? AND student=?',quiz.id,req.user.id),409,'ALREADY_SUBMITTED','This quiz has already been submitted.');
    if(quiz.course) canReadCourse(db,req.user,quiz.course);
    if(quiz.assignment) ensure(canReadAssignment(db,req.user,quiz.assignment).relationship_state==='active',403,'RELATIONSHIP_REQUIRED','Your instructor relationship has ended.');
    if(!quiz.course && !quiz.assignment) ensure(db.get("SELECT 1 FROM guidance WHERE staff=? AND student=? AND kind='instructor' AND state='active'",quiz.owner,req.user.id),
      403,'RELATIONSHIP_REQUIRED','Your instructor relationship has ended.');
    return quiz;
  };
  app.put('/api/quizzes/:id/draft',auth,(req,res)=>{
    const quiz=learnerQuiz(req);
    const {answers}=read(answersSchema,req.body);
    validateAnswers(questions(db,quiz.id),answers);
    db.run('INSERT INTO quiz_drafts VALUES (?,?,?,?) ON CONFLICT(quiz,student) DO UPDATE SET answers=excluded.answers,updated=excluded.updated',
      quiz.id,req.user.id,JSON.stringify(answers),Date.now());
    res.json({ok:true});
  });
  app.post('/api/quizzes/:id/submit',auth,(req,res)=>{
    const {answers}=read(answersSchema,req.body);
    const created=db.tx(()=>{
      const quiz=learnerQuiz(req);
      const items=questions(db,quiz.id);
      validateAnswers(items,answers,true);
      const maximum=items.reduce((n,q)=>n+q.points,0);
      const needsReview=items.some(q=>q.kind!=='mcq' && answers[q.id]?.trim());
      const result=db.run('INSERT INTO quiz_attempts(quiz,student,state,maximum,created) VALUES (?,?,?,?,?)',quiz.id,req.user.id,needsReview?'submitted':'graded',maximum,Date.now());
      let total=0;
      for(const q of items) {
        const answer=answers[q.id]?.trim()||'';
        const score=q.kind==='mcq'?(answer!=='' && Number(answer)===q.correct?q.points:0):answer===''?0:null;
        total+=score||0;
        db.run('INSERT INTO quiz_answers VALUES (?,?,?,?,NULL)',result.lastInsertRowid,q.id,answer,score);
      }
      db.run('UPDATE quiz_attempts SET score=?,graded=? WHERE id=?',total,needsReview?null:Date.now(),result.lastInsertRowid);
      db.run('DELETE FROM quiz_drafts WHERE quiz=? AND student=?',quiz.id,req.user.id);
      notify(db,quiz.owner,'Quiz submission received for '+quiz.title,'/quizzes/'+quiz.id);
      return result.lastInsertRowid;
    });
    res.status(201).json({id:created});
  });
  function reviewerAttempt(req,attemptId) {
    const row=db.get('SELECT a.*,q.owner,q.course FROM quiz_attempts a JOIN quizzes q ON q.id=a.quiz WHERE a.id=?',attemptId);
    ensure(row && (row.owner===req.user.id || isAdmin(req.user)),404,'ATTEMPT_NOT_FOUND','Attempt not found.');
    if(req.user.role==='instructor' && !row.course) ensure(db.get("SELECT 1 FROM guidance WHERE staff=? AND student=? AND kind='instructor' AND state='active'",req.user.id,row.student),
      403,'RELATIONSHIP_REQUIRED','Only active learners can be reviewed.');
    return row;
  }
  app.get('/api/quizzes/:id/attempts',auth,(req,res)=>{
    const quiz=canReadQuiz(db,req.user,read(id,req.params.id));
    ensure(quiz.owner===req.user.id || isAdmin(req.user),403,'FORBIDDEN','Only the quiz author or a member administrator can review attempts.');
    const rows=db.all(`SELECT a.*,u.name FROM quiz_attempts a JOIN users u ON u.id=a.student WHERE quiz=?
      AND (?=1 OR EXISTS(SELECT 1 FROM guidance g WHERE g.staff=? AND g.student=a.student AND g.kind='instructor' AND g.state='active'))
      ORDER BY a.id DESC LIMIT 25 OFFSET ?`,quiz.id,Number(Boolean(quiz.course)||isAdmin(req.user)),req.user.id,page(req.query.page)*25);
    res.json(rows.map(a=>({...a,answers:db.all(`SELECT a.*,q.prompt,q.kind,q.points,q.options FROM quiz_answers a JOIN quiz_questions q ON q.id=a.question WHERE a.attempt=? ORDER BY q.position`,a.id)})));
  });
  app.post('/api/quiz-attempts/:id/grade',auth,(req,res)=>{
    approved(req.user);
    const attemptId=read(id,req.params.id);
    const {grades}=read(form({grades:z.array(form({question:id,score:numeric(0,100),feedback:z.string().trim().max(2000)})).min(1).max(50)}),req.body);
    db.tx(()=>{
      const attempt=reviewerAttempt(req,attemptId);
      ensure(new Set(grades.map(g=>g.question)).size===grades.length,422,'DUPLICATE_GRADE','Grade each written answer once.');
      for(const grade of grades) {
        const question=db.get('SELECT q.* FROM quiz_questions q JOIN quiz_answers a ON a.question=q.id WHERE a.attempt=? AND q.id=?',attemptId,grade.question);
        ensure(question && question.kind!=='mcq' && grade.score<=question.points,422,'INVALID_GRADE','Grades must belong to written answers and stay within available points.');
        db.run('UPDATE quiz_answers SET score=?,feedback=? WHERE attempt=? AND question=?',grade.score,grade.feedback,attemptId,grade.question);
      }
      const aggregate=db.get('SELECT sum(score) score,sum(score IS NULL) missing FROM quiz_answers WHERE attempt=?',attemptId);
      db.run('UPDATE quiz_attempts SET state=?,score=?,graded=? WHERE id=?',aggregate.missing?'submitted':'graded',aggregate.score||0,aggregate.missing?null:Date.now(),attemptId);
      notify(db,attempt.student,'Your quiz feedback has been updated.','/quizzes/'+attempt.quiz);
    });
    res.json({ok:true});
  });
}
