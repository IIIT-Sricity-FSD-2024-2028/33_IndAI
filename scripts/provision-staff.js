import { openDatabase, ensure, log, notifyAdmins } from '../back-end/db.js';
import { config } from '../back-end/config.js';
import { passwordHash } from '../back-end/services/auth.js';
import { email, form, numeric, password, read, words, z } from '../back-end/validation.js';

const env = process.env;
const role = process.argv[2];
const user = read(form({
  email,name:words(90,2),password:password.min(16),role:z.enum(['instructor','provider','admin']),
  mfa:z.string().regex(/^[A-Z2-7]{16,128}$/i)
}),{email:env.STAFF_EMAIL,name:env.STAFF_NAME,password:env.STAFF_PASSWORD,role,mfa:env.STAFF_TOTP_SECRET});
const db = openDatabase();
try {
  db.tx(() => {
    const actor = db.get("SELECT id FROM users WHERE email=? AND role='superadmin' AND status='approved'",config.admin.email?.trim().toLowerCase() || 'super@indai.test');
    ensure(actor,403,'BOOTSTRAP_REQUIRED','Bootstrap the super admin before provisioning staff.');
    ensure(!db.get('SELECT 1 FROM users WHERE email=?',user.email),409,'EMAIL_IN_USE','An account exists with this email.');
    const privileged = role==='admin';
    const state = privileged ? 'approved' : 'pending';
    const result = db.run('INSERT INTO users(email,name,password,role,status,mfa) VALUES (?,?,?,?,?,?)',
      user.email,user.name,passwordHash(user.password),role,state,user.mfa);
    if (!privileged) {
      db.run('INSERT INTO staff VALUES (?,?,?,?)',result.lastInsertRowid,read(numeric(1,50),Number(env.STAFF_CAPACITY||8)),
        read(words(120),env.STAFF_EXPERTISE),read(words(100),env.STAFF_LANGUAGES));
      notifyAdmins(db,'New staff profile awaiting review.', '/admin?queue=staff');
    }
    log(db,actor.id,'staff.provision',result.lastInsertRowid,{role,state});
    console.log('Provisioned account #' + result.lastInsertRowid + ' (' + state + ').');
  });
} finally {
  db.close();
}
