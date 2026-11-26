import { DAY, ensure, log, notify } from '../db.js';
import { plan, approved, ownerPlan } from './access.js';

export function startingCapital(db,userId) {
  const user=db.get('SELECT role FROM users WHERE id=?',userId);
  if(user?.role==='instructor') return 100000000;
  return {basic:10000000,pro:15000000,plus:20000000}[plan(db,userId)?.plan || 'basic'];
}
export function syncCapital(db,userId,now=Date.now()) {
  const amount=startingCapital(db,userId);
  const current=db.get('SELECT cash,funded FROM accounts WHERE user_id=?',userId);
  if(!current) {
    db.run('INSERT INTO accounts(user_id,cash,funded) VALUES (?,?,?)',userId,amount,amount);
    db.run('INSERT INTO ledger(user_id,delta,balance,reason,created) VALUES (?,?,?,?,?)',userId,amount,amount,'Initial paper cash',now);
  } else if(current.funded<amount) {
    const difference=amount-current.funded;
    db.run('UPDATE accounts SET cash=cash+?,funded=? WHERE user_id=?',difference,amount,userId);
    db.run('INSERT INTO ledger(user_id,delta,balance,reason,created) VALUES (?,?,?,?,?)',userId,difference,current.cash+difference,'Plan paper funding increase',now);
    log(db,null,'paper.plan_funding',userId,{amount:difference});
  }
  return db.get('SELECT * FROM accounts WHERE user_id=?',userId);
}
export function grantCapital(db,instructor,student,submission,amount,reason,now=Date.now()) {
  approved(instructor,'instructor');
  return db.tx(()=>{
    ensure(db.get("SELECT 1 FROM guidance WHERE staff=? AND student=? AND kind='instructor' AND state='active'",instructor.id,student),
      403,'ACTIVE_LEARNER_REQUIRED','Only your active learners can receive an award.');
    const learner=db.get('SELECT * FROM users WHERE id=?',student);
    ensure(learner?.status==='approved' && plan(db,student,now)?.plan===ownerPlan.instructor,403,'PLAN_REQUIRED','This learner needs active guidance access.');
    ensure(db.get(`SELECT 1 FROM submissions s JOIN assignments a ON a.id=s.assignment JOIN guidance g ON g.id=a.relationship
      WHERE s.id=? AND s.reviewed IS NOT NULL AND g.staff=? AND g.student=?`,submission,instructor.id,student),
      422,'REVIEW_REQUIRED','Choose reviewed work completed by this learner.');
    ensure(!db.get('SELECT 1 FROM capital_awards WHERE submission=?',submission),409,'WORK_ALREADY_REWARDED','This submission has already received an award.');
    const used=db.get('SELECT coalesce(sum(amount),0) used FROM capital_awards WHERE student=? AND created>?',student,now-7*DAY).used;
    ensure(used+amount<=1000000,409,'WEEKLY_AWARD_LIMIT','A learner can receive at most ₹10,000 across the last seven days.');
    const acc=syncCapital(db,student,now);
    db.run('INSERT INTO capital_awards(student,instructor,submission,amount,reason,created) VALUES (?,?,?,?,?,?)',student,instructor.id,submission,amount,reason,now);
    db.run('UPDATE accounts SET cash=cash+? WHERE user_id=?',amount,student);
    db.run("INSERT INTO ledger(user_id,delta,balance,reason,created) VALUES (?,?,?,'Instructor paper-fund award',?)",student,amount,acc.cash+amount,now);
    log(db,instructor.id,'paper.award',student,{amount,submission,reason});
    notify(db,student,'Your instructor awarded additional paper funds for reviewed work.','/portfolio');
    return {awarded:amount,remaining:1000000-used-amount};
  });
}
export function tradingAccess(db,user) {
  approved(user);
  ensure(['student','instructor'].includes(user.role),403,'FORBIDDEN','This role does not have a paper trading account.');
}
