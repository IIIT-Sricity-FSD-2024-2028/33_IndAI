import { ensure } from '../db.js';
import { approved,isAdmin,plan,rank } from './access.js';

export const courseAuthor = user => ['instructor','provider'].includes(user.role);
export function canReadCourse(db,user,courseId,requireEnrollment=true) {
  approved(user);
  const item=db.get('SELECT * FROM courses WHERE id=?',courseId);
  ensure(item,404,'COURSE_NOT_FOUND','Course not found.');
  if(user.role==='superadmin' || (courseAuthor(user) && item.owner===user.id)) return item;
  ensure(user.role==='student',403,'FORBIDDEN','You do not have access to this course.');
  const enrolled=db.get('SELECT 1 FROM enrollments WHERE student=? AND course=?',user.id,item.id);
  ensure(item.state==='published' || (item.state==='archived' && enrolled),404,'COURSE_NOT_FOUND','Course not found.');
  ensure(rank[plan(db,user.id)?.plan || 'basic']>=rank[item.policy],403,'PLAN_REQUIRED','Your plan does not include this course.');
  ensure(!requireEnrollment || enrolled,403,'ENROLLMENT_REQUIRED','Enroll to open course resources.');
  return item;
}
export function canReadAssignment(db,user,assignmentId) {
  approved(user);
  const item=db.get(`SELECT a.*,g.student,g.staff,g.state relationship_state FROM assignments a JOIN guidance g ON g.id=a.relationship WHERE a.id=?`,assignmentId);
  ensure(item,404,'ASSIGNMENT_NOT_FOUND','Assignment not found.');
  ensure(isAdmin(user) || item.student===user.id || (item.staff===user.id && item.relationship_state==='active'),
    403,'FORBIDDEN','This assignment is outside your learner relationships.');
  return item;
}
export function canReadQuiz(db,user,quizId) {
  approved(user);
  const quiz=db.get('SELECT * FROM quizzes WHERE id=?',quizId);
  ensure(quiz,404,'QUIZ_NOT_FOUND','Quiz not found.');
  if(quiz.owner===user.id || isAdmin(user)) return quiz;
  ensure(user.role==='student' && ['published','archived'].includes(quiz.state),404,'QUIZ_NOT_FOUND','Quiz not found.');
  if(quiz.course) canReadCourse(db,user,quiz.course);
  else if(quiz.assignment) {
    const assignment=canReadAssignment(db,user,quiz.assignment);
    ensure(assignment.student===user.id,403,'FORBIDDEN','This quiz belongs to a different learner.');
  } else {
    ensure(db.get('SELECT 1 FROM quiz_recipients WHERE quiz=? AND student=?',quiz.id,user.id),404,'QUIZ_NOT_FOUND','Quiz not found.');
    const active=db.get("SELECT 1 FROM guidance WHERE staff=? AND student=? AND kind='instructor' AND state='active'",quiz.owner,user.id);
    ensure(active || db.get('SELECT 1 FROM quiz_attempts WHERE quiz=? AND student=?',quiz.id,user.id),403,'RELATIONSHIP_REQUIRED','An active instructor relationship is required.');
  }
  return quiz;
}
