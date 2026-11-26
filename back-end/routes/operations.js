import { ensure, log, notify, notifyAdmins } from '../db.js';
import { admin, approved, isAdmin, reconcileGuidance } from '../services/access.js';
import { canReadCourse, canReadQuiz } from '../services/learning-access.js';
import { form, id, page, read, words, z } from '../validation.js';

const audienceSchema = z.enum(['instructors','providers','both']);
const eligibleSpecialists = "FROM users WHERE status='approved' AND role IN (?,?)";
const audienceRoles = {
  instructors:['instructor','instructor'],
  providers:['provider','provider'],
  both:['instructor','provider']
};

function canReadTicket(db, user, id) {
  const ticket = db.get('SELECT * FROM tickets WHERE id=?', id);
  ensure(ticket,404,'TICKET_NOT_FOUND','Ticket not found.');
  if (ticket.user_id !== user.id) admin(user);
  return ticket;
}

function notificationDestination(db, user, path) {
  if (path==='/' || path==='/overview') return '/overview';
  try {
    const resource = /^\/(courses|quizzes|support)\/([1-9]\d*)$/.exec(path);
    if (resource) {
      const target = read(id,resource[2]);
      if (resource[1]==='courses') canReadCourse(db,user,target,false);
      if (resource[1]==='quizzes') canReadQuiz(db,user,target);
      if (resource[1]==='support') canReadTicket(db,user,target);
      return path;
    }
    approved(user);
    switch (path) {
      case '/trading': case '/portfolio':
        return ['student','instructor'].includes(user.role)?path:null;
      case '/guidance': case '/tasks':
        return ['student','instructor','provider'].includes(user.role)?path:null;
      case '/plans': return user.role==='student'?path:null;
      case '/provider': return user.role==='provider'?path:null;
      case '/admin?queue=courses': return user.role==='superadmin'?path:null;
      case '/commerce': case '/admin': case '/admin?queue=staff':
        return isAdmin(user)?path:null;
      default: return null;
    }
  } catch (error) {
    if ([403,404,422].includes(error.status)) return null;
    throw error;
  }
}

export function operationsRoutes(app, db, auth) {
  app.get('/api/admin', auth, (req, res) => {
    admin(req.user);
    const queue = read(z.enum(['users','staff','payments','courses','support','audit']),req.query.queue ?? 'users');
    if (queue==='audit'||queue==='courses') approved(req.user,'superadmin');
    const offset = page(req.query.page) * 25;
    const search = '%' + read(z.string().max(90), req.query.search || '') + '%';
    const queries = {
      users: `SELECT a.*,u.email,u.name,u.status FROM applications a JOIN users u ON u.id=a.student WHERE (u.name LIKE ? OR u.email LIKE ?)
        ORDER BY a.state='pending' DESC,a.id DESC LIMIT 25 OFFSET ?`,
      staff: `SELECT u.id,u.name,u.email,u.role,u.status,s.expertise,s.capacity FROM users u LEFT JOIN staff s ON u.id=s.user_id
        WHERE (u.name LIKE ? OR u.email LIKE ?) AND
        ((u.role IN ('instructor','provider') AND s.user_id IS NOT NULL)${req.user.role==='superadmin'?" OR u.role='admin'":''})
        ORDER BY u.status='pending' DESC,u.role='admin' DESC,u.id DESC LIMIT 25 OFFSET ?`,
      payments: 'SELECT p.*,u.name,u.email FROM payments p JOIN users u ON u.id=p.student WHERE (u.name LIKE ? OR u.email LIKE ?) ORDER BY p.id DESC LIMIT 25 OFFSET ?',
      courses: "SELECT c.id,c.title,c.state,c.policy,u.name FROM courses c JOIN users u ON u.id=c.owner WHERE (c.title LIKE ? OR u.name LIKE ?) ORDER BY c.state='review' DESC,c.id DESC LIMIT 25 OFFSET ?",
      support: "SELECT t.*,u.name,u.email FROM tickets t JOIN users u ON u.id=t.user_id WHERE (t.subject LIKE ? OR u.email LIKE ?) ORDER BY t.state='open' DESC,t.id DESC LIMIT 25 OFFSET ?",
      audit: "SELECT a.*,u.name actor_name,u.email actor_email FROM audit a LEFT JOIN users u ON u.id=a.actor WHERE (a.action LIKE ? OR (a.target||' '||coalesce(u.name,'')||' '||coalesce(u.email,'')) LIKE ?) ORDER BY a.id DESC LIMIT 25 OFFSET ?" 
    };
    res.json(db.all(queries[queue], search, search, offset));
  });
  app.post('/api/admin/applications/:id', auth, (req, res) => {
    admin(req.user);
    const application = read(id, req.params.id);
    const { decision, reason } = read(form({ decision:z.enum(['approved','rejected']), reason:words(400).optional() }), req.body);
    ensure(decision !== 'rejected' || reason, 422, 'REASON_REQUIRED', 'Enter a rejection reason.');
    db.tx(() => {
      const row = db.get('SELECT * FROM applications WHERE id=?', application);
      ensure(row?.state === 'pending' && db.get('SELECT status FROM users WHERE id=?', row.student)?.status === 'pending', 409, 'STATE_CHANGED', 'This application is no longer pending.');
      db.run('UPDATE applications SET state=?,note=?,decided=? WHERE id=?', decision, reason || null, Date.now(), application);
      db.run('UPDATE users SET status=? WHERE id=?', decision, row.student);
      notify(db, row.student, `Your application was ${decision}.`, '/');
      log(db, req.user.id, 'application.' + decision, application, { reason });
    });
    res.json({ ok:true });
  });
  app.post('/api/admin/staff/:id/decision', auth, (req, res) => {
    admin(req.user);
    const userId = read(id, req.params.id);
    const { decision, reason } = read(form({ decision:z.enum(['approved','rejected']), reason:words(400).optional() }), req.body);
    ensure(decision !== 'rejected' || reason, 422, 'REASON_REQUIRED', 'Enter a rejection reason.');
    db.tx(() => {
      const row = db.get(`SELECT u.status,s.capacity FROM staff s JOIN users u ON u.id=s.user_id WHERE u.id=?`,userId);
      ensure(row?.status === 'pending',409,'STATE_CHANGED','This staff account is no longer pending.');
      db.run('UPDATE users SET status=? WHERE id=?',decision,userId);
      notify(db,userId,'Your staff profile was '+decision+'. '+(reason||''),'/');
      log(db,req.user.id,'staff.'+decision,userId,{reason});
    });
    res.json({ok:true});
  });
  app.post('/api/admin/users/:id/suspend', auth, (req, res) => {
    admin(req.user);
    const userId = read(id, req.params.id);
    const { reason } = read(form({ reason:words(400, 5) }), req.body);
    db.tx(() => {
      const row = db.get('SELECT id,role,status FROM users WHERE id=?', userId);
      if (row?.role==='admin') approved(req.user,'superadmin');
      ensure(row?.status === 'approved' && ['student','instructor','provider','admin'].includes(row.role),409,'STATUS_UNCHANGED','Only an approved learner, specialist, or regular Admin can be suspended here.');
      db.run("UPDATE users SET status='suspended' WHERE id=?", userId);
      db.run('DELETE FROM sessions WHERE user_id=?', userId);
      db.run("UPDATE orders SET state='canceled',hold=0,reason='Account suspended' WHERE user_id=? AND state IN ('pending','open')", userId);
      reconcileGuidance(db);
      notify(db, userId, 'Your account has been suspended.', '/');
      log(db, req.user.id, 'user.suspend', userId, { reason, from:row.status, to:'suspended' });
    });
    res.json({ ok:true });
  });
  app.get('/api/admin/notifications/preview', auth, (req,res) => {
    admin(req.user);
    const audience = read(audienceSchema,req.query.audience);
    const { count } = db.get('SELECT count(*) count '+eligibleSpecialists,...audienceRoles[audience]);
    res.json({count});
  });
  app.post('/api/admin/notifications', auth, (req,res) => {
    admin(req.user);
    const { audience,title,message,confirmedCount } = read(form({
      audience:audienceSchema,title:words(120),message:words(4000),confirmedCount:z.number().int().positive()
    }),req.body);
    const count = db.tx(() => {
      const now = Date.now();
      const args = audienceRoles[audience];
      const { count } = db.get('SELECT count(*) count '+eligibleSpecialists,...args);
      ensure(count===confirmedCount,409,'AUDIENCE_CHANGED','The recipient count changed. Review it and confirm again.');
      db.run(`INSERT INTO notifications(user_id,message,path,created,title,source)
        SELECT id,?,'',?,?,? ${eligibleSpecialists}`,message,now,title,req.user.name,...args);
      log(db,req.user.id,'notification.broadcast',audience,{audience,recipientCount:count});
      return count;
    });
    res.locals.requestAudited = true;
    res.status(201).json({count});
  });
  app.get('/api/notifications', auth, (req,res) => {
    const rows = db.all('SELECT id,title,source,message,created,read FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 26 OFFSET ?',
      req.user.id,page(req.query.page)*25);
    res.json({items:rows.slice(0,25),more:rows.length>25});
  });
  app.get('/api/notifications/unread', auth, (req,res) => {
    res.json(db.get('SELECT count(*) count FROM notifications WHERE user_id=? AND read=0',req.user.id));
  });
  app.post('/api/notifications/read-all', auth, (req,res) => {
    db.run('UPDATE notifications SET read=1 WHERE user_id=? AND read=0',req.user.id);
    res.json({ok:true});
  });
  app.post('/api/notifications/:id/read', auth, (req, res) => {
    ensure(db.run('UPDATE notifications SET read=1 WHERE id=? AND user_id=?',read(id,req.params.id),req.user.id).changes,
      404,'NOTIFICATION_NOT_FOUND','Notification not found.');
    res.json({ ok:true });
  });
  app.post('/api/notifications/:id/open', auth, (req,res) => {
    const destination = db.tx(() => {
      const notification = db.get('SELECT id,path FROM notifications WHERE id=? AND user_id=?',read(id,req.params.id),req.user.id);
      ensure(notification,404,'NOTIFICATION_NOT_FOUND','Notification not found.');
      db.run('UPDATE notifications SET read=1 WHERE id=? AND user_id=?',notification.id,req.user.id);
      return notificationDestination(db,req.user,notification.path);
    });
    res.json({destination});
  });
  app.get('/api/support', auth, (req, res) => res.json(db.all('SELECT * FROM tickets WHERE user_id=? ORDER BY id DESC LIMIT 25 OFFSET ?', req.user.id, page(req.query.page) * 25)));
  app.post('/api/support', auth, (req, res) => {
    ensure(!isAdmin(req.user),403,'SUPPORT_OPERATIONS','Use the support operations queue for administration.');
    const { subject, body } = read(form({ subject:words(120, 4), body:words(4000, 10) }), req.body);
    const ticket = db.tx(() => {
      const result = db.run('INSERT INTO tickets(user_id,subject,created) VALUES (?,?,?)', req.user.id, subject, Date.now());
      db.run('INSERT INTO replies(ticket,author,body,created) VALUES (?,?,?,?)', result.lastInsertRowid, req.user.id, body, Date.now());
      notifyAdmins(db, 'New support ticket #' + result.lastInsertRowid + '.', '/support/' + result.lastInsertRowid);
      return result.lastInsertRowid;
    });
    res.status(201).json({ id:ticket });
  });
  const ticketFor = req => canReadTicket(db,req.user,read(id,req.params.id));
  app.get('/api/support/:id', auth, (req, res) => {
    const ticket = ticketFor(req);
    res.json({ ...ticket, replies:db.all('SELECT r.*,u.name FROM replies r JOIN users u ON u.id=r.author WHERE r.ticket=? ORDER BY r.id DESC LIMIT 50 OFFSET ?', ticket.id, page(req.query.page) * 50).reverse() });
  });
  app.post('/api/support/:id/reply', auth, (req, res) => {
    const { body } = read(form({ body:words(4000, 2) }), req.body);
    db.tx(() => {
      const ticket = ticketFor(req);
      ensure(ticket.state === 'open', 409, 'TICKET_CLOSED', 'This ticket is closed.');
      db.run('INSERT INTO replies(ticket,author,body,created) VALUES (?,?,?,?)', ticket.id, req.user.id, body, Date.now());
      const path = '/support/' + ticket.id;
      if (ticket.user_id !== req.user.id) notify(db, ticket.user_id, 'Support replied to ticket #' + ticket.id + '.', path);
      else notifyAdmins(db, 'New reply on ticket #' + ticket.id + '.', path);
    });
    res.json({ ok:true });
  });
  app.post('/api/support/:id/close', auth, (req, res) => {
    const ticket = ticketFor(req);
    db.tx(() => {
      ensure(db.run("UPDATE tickets SET state='closed' WHERE id=? AND state='open'", ticket.id).changes, 409, 'TICKET_CLOSED', 'This ticket is already closed.');
      if (ticket.user_id !== req.user.id) {
        log(db, req.user.id, 'ticket.close', ticket.id);
        notify(db, ticket.user_id, 'Support closed ticket #' + ticket.id + '.', '/support/' + ticket.id);
      }
    });
    res.json({ ok:true });
  });
}
