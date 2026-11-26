import { ensure, notify,log } from '../db.js';

export const rank = { basic: 0, pro: 1, plus: 2 };
export const ownerPlan = { instructor: 'plus', provider: 'pro' };
export const userView = user => ({ id: user.id, name: user.name, email: user.email, status: user.status, role: user.role });
export function plan(db, id, now = Date.now()) {
  return db.get("SELECT * FROM subscriptions WHERE student=? AND state IN ('active','canceled') AND starts<=? AND ends>? ORDER BY starts DESC,id DESC LIMIT 1", id, now, now);
}
export function approved(user, role) {
  ensure(user?.status === 'approved', 403, 'APPROVAL_REQUIRED', 'This feature requires an approved account.');
  ensure(!role || role === user.role, 403, 'FORBIDDEN', 'Your role cannot perform this action.');
}
export function student(db, user, minimum = 'basic') {
  approved(user, 'student');
  ensure(rank[plan(db, user.id)?.plan || 'basic'] >= rank[minimum], 403, 'PLAN_REQUIRED', `An active ${minimum.toUpperCase()} plan is required.`);
}
export const isAdmin = user => ['admin','superadmin'].includes(user.role);
export function admin(user) {
  approved(user);
  ensure(isAdmin(user),403,'FORBIDDEN','Administrator access is required.');
}
export function reconcileGuidance(db, now = Date.now()) {
  for (const request of db.all("SELECT g.*,s.status student_status,u.status staff_status FROM guidance g JOIN users s ON s.id=g.student JOIN users u ON u.id=g.staff WHERE g.state IN ('pending','active')")) {
    const expired = request.state === 'pending' && request.expires <= now;
    const eligible = request.student_status === 'approved' && request.staff_status === 'approved' &&
      rank[plan(db, request.student, now)?.plan || 'basic'] >= rank[ownerPlan[request.kind]];
    if (!expired && eligible) continue;
    const state = expired ? 'expired' : 'ended';
    db.run('UPDATE guidance SET state=?,reason=? WHERE id=?', state, expired ? 'Response window elapsed' : 'Eligibility ended', request.id);
    log(db,null,'guidance.'+state,request.id,{student:request.student,staff:request.staff,reason:expired?'Request expired':'Eligibility ended'});
    notify(db, request.student, `Your ${request.kind} relationship or request ${state}.`, '/guidance');
    notify(db, request.staff, `A ${request.kind} relationship or request ${state}.`, '/guidance');
  }
}
