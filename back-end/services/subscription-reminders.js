import { DAY,notify } from '../db.js';
import { plan } from './access.js';

const intervals = [7,1];
const formatter = new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'});

export function sendSubscriptionReminders(db, now = Date.now()) {
  db.tx(() => {
    const terms = db.all(`SELECT s.id,s.student,s.plan,s.ends FROM subscriptions s JOIN users u ON u.id=s.student
      WHERE s.state IN ('active','canceled') AND s.plan IN ('pro','plus')
      AND s.starts<=? AND s.ends>? AND s.ends<=? AND u.status='approved' AND u.role='student'`,
    now,now,now+intervals[0]*DAY);
    for (const term of terms) {
      if (plan(db,term.student,now)?.id !== term.id) continue;
      if (db.get("SELECT 1 FROM subscriptions WHERE student=? AND starts=? AND state='active' AND plan IN ('pro','plus')",term.student,term.ends)) continue;
      for (const days of intervals) {
        if (now < term.ends-days*DAY || db.get('SELECT 1 FROM subscription_reminders WHERE subscription=? AND ends=? AND lead_days=?',term.id,term.ends,days)) continue;
        const end = formatter.format(term.ends);
        const notification = notify(db,term.student,`Your ${term.plan.toUpperCase()} term ends on ${end} IST.`,'/plans',
          { title:'Subscription ending soon',source:'IndAI Billing',now });
        db.run('INSERT INTO subscription_reminders(subscription,ends,lead_days,notification) VALUES (?,?,?,?)',term.id,term.ends,days,notification);
      }
    }
  });
}
