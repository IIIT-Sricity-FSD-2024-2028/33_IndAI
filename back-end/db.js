import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.js';

const migrations = new URL('./migrations/', import.meta.url);
export function openDatabase(path) {
  if (!path) {
    mkdirSync(config.directory, { recursive: true, mode: 0o700 });
    path = join(config.directory, 'indai.sqlite');
  }
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL');
  const statements = new Map();
  const get = sql => {
    if (!statements.has(sql)) statements.set(sql, db.prepare(sql));
    return statements.get(sql);
  };
  const store = {
    get: (sql, ...params) => get(sql).get(...params),
    all: (sql, ...params) => get(sql).all(...params),
    run: (sql, ...params) => get(sql).run(...params),
    tx(fn) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const result = fn();
        if (result?.then) throw Error('Transaction callback must be synchronous');
        db.exec('COMMIT');
        return result;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    close: () => db.close()
  };
  store.tx(() => {
    db.exec('CREATE TABLE IF NOT EXISTS migrations(version TEXT PRIMARY KEY)');
    for (const file of readdirSync(migrations).sort()) {
      if (store.get('SELECT 1 FROM migrations WHERE version=?', file)) continue;
      db.exec(readFileSync(new URL(file, migrations), 'utf8'));
      store.run('INSERT INTO migrations VALUES (?)', file);
    }
  });
  return store;
}
export const DAY = 86400000;
export function fail(status, code, message, fields) {
  throw Object.assign(new Error(message), { status, code, fields });
}
export function ensure(condition, status, code, message) {
  if (!condition) fail(status, code, message);
}
export function log(db, actor, action, target, detail = {}) {
  db.run('INSERT INTO audit(actor,action,target,detail,created) VALUES (?,?,?,?,?)', actor, action, String(target), JSON.stringify(detail), Date.now());
}
export function notify(db, user, message, path, {title='IndAI notification',source='IndAI',now=Date.now()}={}) {
  return db.run('INSERT INTO notifications(user_id,message,path,created,title,source) VALUES (?,?,?,?,?,?)',
    user,message,path,now,title,source).lastInsertRowid;
}
export function notifyAdmins(db, message, path) {
  for (const { id } of db.all("SELECT id FROM users WHERE status='approved' AND role IN ('admin','superadmin')")) {
    notify(db, id, message, path);
  }
}
