import { createHash, createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { DAY, ensure, notifyAdmins } from '../db.js';

export const hash = value => createHash('sha256').update(value).digest('hex');
export function equal(a, b) {
  const left = Buffer.from(a || ''), right = Buffer.from(b || '');
  return left.length === right.length && timingSafeEqual(left, right);
}
export function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  return salt + ':' + scryptSync(password, salt, 64).toString('hex');
}
const fallback = passwordHash('unused credential');
export const matchPassword = (password, stored = fallback) => equal(stored, passwordHash(password, stored.split(':')[0]));
export const cookie = request => /(?:^|;\s*)indai_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.cookie || '')?.[1];
const cookieOptions = { httpOnly: true, secure: config.production, sameSite: 'strict', path: '/' };
export function session(db, res, user) {
  const token = randomBytes(32).toString('hex');
  db.run('INSERT INTO sessions VALUES (?,?,?)', hash(token), user.id, Date.now() + 7 * DAY);
  res.cookie('indai_session', token, { ...cookieOptions, maxAge: 7 * DAY });
}
export function signout(db, req, res) {
  if (cookie(req)) db.run('DELETE FROM sessions WHERE token=?', hash(cookie(req)));
  res.clearCookie('indai_session', cookieOptions);
}
const mail = config.mail.host && nodemailer.createTransport({
  host: config.mail.host, port: config.mail.port, secure: config.mail.port === 465,
  requireTLS: config.mail.port !== 465, connectionTimeout: 8000,
  auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined
});
export async function issue(db, user, purpose) {
  const now = Date.now();
  const code = String(randomInt(100000, 1000000));
  const digest = passwordHash(code);
  db.tx(() => {
    const old = db.get('SELECT sent FROM challenges WHERE user_id=? AND purpose=?', user.id, purpose);
    ensure(!old || now - old.sent > 60000, 429, 'RESEND_DELAY', 'Wait one minute before requesting another code.');
    db.run('INSERT OR REPLACE INTO challenges VALUES (?,?,?,?,?,0)', user.id, purpose, digest, now + 600000, now);
  });
  if (config.demo) return { demoCode: code };
  try {
    if (!mail) throw Error('SMTP unavailable');
    await mail.sendMail({ from: config.mail.from, to: user.email, subject: 'Your IndAI verification code', text: `Your code is ${code}. It expires in 10 minutes.` });
  } catch {
    db.run('DELETE FROM challenges WHERE user_id=? AND purpose=? AND code=?', user.id, purpose, digest);
    ensure(false, 503, 'EMAIL_UNAVAILABLE', 'Email delivery is temporarily unavailable. Try again.');
  }
  return {};
}
export function consume(db, user, purpose, code, apply) {
  const valid = db.tx(() => {
    const row = user && db.get('SELECT * FROM challenges WHERE user_id=? AND purpose=?', user.id, purpose);
    if (!row || row.expires <= Date.now() || row.attempts >= 5) return false;
    if (!matchPassword(code, row.code)) {
      db.run('UPDATE challenges SET attempts=attempts+1 WHERE user_id=? AND purpose=?', user.id, purpose);
      return false;
    }
    apply();
    db.run('DELETE FROM challenges WHERE user_id=? AND purpose=?', user.id, purpose);
    return true;
  });
  ensure(valid, 422, 'CODE_INVALID', 'The code is incorrect or has expired. Request a new code if needed.');
}
export function submitApplication(db, user) {
  const now = Date.now();
  db.run("UPDATE users SET status='pending' WHERE id=?", user.id);
  db.run("INSERT INTO applications(student,state,created) VALUES (?,'pending',?)", user.id, now);
  notifyAdmins(db, `New student application from ${user.name}.`, '/admin');
}
export function totp(secret, code, now = Date.now()) {
  if (!secret || !code || !/^[A-Z2-7]{16,128}$/i.test(secret)) return false;
  const bits = [...secret.toUpperCase()].map(char => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(char).toString(2).padStart(5, '0')).join('');
  const key = Buffer.from((bits.match(/.{8}/g) || []).map(byte => parseInt(byte, 2)));
  return [-1, 0, 1].some(offset => {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(Math.floor(now / 30000) + offset));
    const bytes = createHmac('sha1', key).update(counter).digest();
    const index = bytes.at(-1) & 15;
    return equal(code, String((bytes.readUInt32BE(index) & 0x7fffffff) % 1000000).padStart(6, '0'));
  });
}
