import { config } from './config.js';
import { openDatabase,log,notify } from './db.js';
import { createApp } from './app.js';
import { bootstrap, installInstruments } from './seed.js';
import { reconcileGuidance } from './services/access.js';
import { processOrders } from './services/trading.js';
import { sendSubscriptionReminders } from './services/subscription-reminders.js';

const db = openDatabase();
bootstrap(db);
installInstruments(db);
let lastRun = 0, running;
const app = createApp(db,{ serve:process.argv.includes('--serve'),ready:()=>Date.now()-lastRun<30000 });
function tick() {
  if (running) return;
  running = (async () => {
    sendSubscriptionReminders(db);
    await processOrders(db);
    db.tx(() => {
      const now = Date.now();
      reconcileGuidance(db,now);
      for(const term of db.all("SELECT id,student,plan,ends FROM subscriptions WHERE state IN ('active','canceled') AND ends<=?",now)) {
        db.run("UPDATE subscriptions SET state='expired' WHERE id=?",term.id);
        log(db,null,'subscription.expired',term.id,{student:term.student,plan:term.plan,ends:term.ends});
        notify(db,term.student,'Your paid term has expired. Your Free workspace and history are retained.','/plans');
      }
      db.run('DELETE FROM sessions WHERE expires<=?',now);
      db.run('DELETE FROM challenges WHERE expires<=?',now);
    });
    lastRun = Date.now();
  })().catch(() => console.error(JSON.stringify({level:'error',code:'WORKER_FAILED'}))).finally(() => { running = null; });
}
tick();
const timer = setInterval(tick,5000);
const server = app.listen(config.port,()=>console.log('IndAI API listening on http://localhost:'+config.port));
function stop() {
  clearInterval(timer);
  server.close(async () => { await running; db.close(); });
}
process.once('SIGTERM',stop);
process.once('SIGINT',stop);
