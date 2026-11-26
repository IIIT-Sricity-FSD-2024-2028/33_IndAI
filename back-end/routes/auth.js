import { rateLimit } from 'express-rate-limit';
import { config } from '../config.js';
import { ensure, log } from '../db.js';
import { form, read, words, email, password, z } from '../validation.js';
import { consume, cookie, hash, issue, matchPassword, passwordHash, session, signout, submitApplication, totp } from '../services/auth.js';
import { isAdmin, plan, userView } from '../services/access.js';

const credentials = form({ email, password, confirmation: password });
const verification = z.string().regex(/^\d{6}$/, 'Enter the six-digit code.');
const confirmed = data => ensure(data.password === data.confirmation, 422, 'PASSWORD_MISMATCH', 'The passwords must match.');
export function authRoutes(app, db, signedIn) {
  const limit = rateLimit({ windowMs: 15 * 60000, limit: 35, handler: () => ensure(false, 429, 'RATE_LIMITED', 'Too many attempts. Try again in 15 minutes.') });
  const lookup = address => db.get('SELECT * FROM users WHERE email=?', address);
  app.use('/api/auth', limit);
  app.post('/api/auth/register', async (req, res) => {
    const data = read(credentials.extend({ name: words(90, 2).regex(/^[\p{L}\p{M} .’'-]+$/u, 'Use letters, spaces, apostrophes or hyphens.') }), req.body);
    confirmed(data);
    ensure(!lookup(data.email), 409, 'EMAIL_IN_USE', 'Use sign in or password recovery for this address.');
    const result = db.run('INSERT INTO users(email,name,password) VALUES (?,?,?)', data.email, data.name, passwordHash(data.password));
    res.status(201).json(await issue(db, { id: result.lastInsertRowid, email: data.email }, 'verify'));
  });
  app.post('/api/auth/resend', async (req, res) => {
    const data = read(form({ email, password }), req.body);
    const user = lookup(data.email);
    ensure(matchPassword(data.password, user?.password) && user?.status === 'unverified', 403, 'RESEND_UNAVAILABLE', 'Supply the original registration email and password.');
    res.json(await issue(db, user, 'verify'));
  });
  app.post('/api/auth/verify', (req, res) => {
    const data = read(form({ email, code: verification }), req.body);
    const user = lookup(data.email);
    ensure(user?.status === 'unverified', 422, 'VERIFICATION_UNAVAILABLE', 'This email has no pending verification.');
    consume(db, user, 'verify', data.code, () => submitApplication(db, user));
    session(db, res, user);
    res.json({ ok: true });
  });
  app.post('/api/auth/login', (req, res) => {
    const data = read(form({ email, password, mfa: verification.optional() }), req.body);
    const user = lookup(data.email);
    ensure(matchPassword(data.password, user?.password) && user, 401, 'BAD_LOGIN', 'Email or password is incorrect.');
    ensure(user.status !== 'unverified', 403, 'VERIFY_EMAIL', 'Verify your email to continue.');
    ensure(!isAdmin(user) || user.status!=='suspended',403,'ACCOUNT_SUSPENDED','This administrator account is suspended.');
    if (config.production && user.role !== 'student') {
      ensure(totp(user.mfa || (user.role === 'superadmin' && user.email === config.admin.email?.trim().toLowerCase() ? config.admin.mfa : ''), data.mfa),
        401, 'MFA_REQUIRED', 'A valid staff authenticator code is required.');
    }
    signout(db, req, res);
    session(db, res, user);
    res.json(userView(user));
  });
  app.post('/api/auth/recovery', async (req, res) => {
    const { email: address } = read(form({ email }), req.body);
    const user = lookup(address);
    res.json(user && user.status !== 'unverified' ? await issue(db, user, 'reset') : {});
  });
  app.post('/api/auth/reset', (req, res) => {
    const data = read(credentials.extend({ code: verification }), req.body);
    confirmed(data);
    const user = lookup(data.email);
    consume(db, user, 'reset', data.code, () => {
      db.run('UPDATE users SET password=? WHERE id=?', passwordHash(data.password), user.id);
      db.run('DELETE FROM sessions WHERE user_id=?', user.id);
    });
    res.json({ ok: true });
  });
  app.post('/api/auth/logout', (req, res) => {
    signout(db, req, res);
    res.json({ ok: true });
  });
  app.post('/api/auth/change-password',signedIn,(req,res)=>{
    const data=read(form({currentPassword:z.string().min(1).max(128),password,confirmation:password}),req.body);
    confirmed(data);
    db.tx(()=>{
      const user=db.get('SELECT role,password FROM users WHERE id=?',req.user.id);
      ensure(['student','instructor','provider'].includes(user.role),403,'PASSWORD_CHANGE_FORBIDDEN','This account cannot change its password here.');
      ensure(matchPassword(data.currentPassword,user.password),422,'INCORRECT_PASSWORD','Enter your correct current password.');
      ensure(data.password!==data.currentPassword,422,'PASSWORD_UNCHANGED','Choose a password different from your current password.');
      db.run('UPDATE users SET password=? WHERE id=?',passwordHash(data.password),req.user.id);
      db.run('DELETE FROM sessions WHERE user_id=? AND token<>?',req.user.id,hash(cookie(req)));
      db.run("DELETE FROM challenges WHERE user_id=? AND purpose='reset'",req.user.id);
      log(db,req.user.id,'account.password_change',req.user.id);
    });
    res.locals.requestAudited=true;
    res.json({ok:true});
  });
  app.get('/api/me', signedIn, (req, res) => {
    const user = req.user;
    res.json({ ...userView(user), demo: config.demo, plan: user.role === 'student' && user.status === 'approved' ? plan(db, user.id)?.plan || 'basic' : null,
      application: db.get('SELECT * FROM applications WHERE student=? ORDER BY id DESC LIMIT 1', user.id) || null });
  });
  app.post('/api/applications', signedIn, (req, res) => {
    ensure(req.user.role === 'student' && req.user.status === 'rejected', 409, 'REAPPLY_UNAVAILABLE', 'Only rejected applications can be resubmitted.');
    db.tx(() => submitApplication(db, req.user));
    res.status(201).json({ ok: true });
  });
}
