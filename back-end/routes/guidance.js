import { DAY, ensure, log, notify } from '../db.js';
import { config } from '../config.js';
import { approved, admin, ownerPlan, reconcileGuidance, student } from '../services/access.js';
import { form, id, page, read, words, z } from '../validation.js';

const kind = z.enum(['instructor', 'provider']);
const select = `SELECT g.*, s.name student_name, u.name staff_name
  FROM guidance g JOIN users s ON s.id=g.student JOIN users u ON u.id=g.staff`;
export function guidanceRoutes(app, db, auth) {
  app.get('/api/guidance/active',auth,(req,res)=>{
    approved(req.user);
    ensure(['instructor','provider'].includes(req.user.role),403,'FORBIDDEN','An instructor or provider account is required.');
    db.tx(()=>reconcileGuidance(db));
    res.json(db.all(select+" WHERE g.staff=? AND g.state='active' ORDER BY s.name LIMIT 50",req.user.id));
  });
  app.get('/api/staff', auth, (req, res) => {
    const role = read(kind, req.query.kind);
    student(db, req.user, ownerPlan[role]);
    const search = read(z.string().trim().max(120),req.query.search ?? '').toLowerCase();
    const offset = page(req.query.page)*30;
    db.tx(() => reconcileGuidance(db));
    const directory = `SELECT u.id,u.name,s.expertise,s.languages,s.capacity,
      (SELECT count(*) FROM guidance WHERE staff=u.id AND state='active') used
      FROM staff s JOIN users u ON u.id=s.user_id WHERE u.status='approved' AND u.role=? ORDER BY u.name,u.id`;
    if (!search) return res.json(db.all(directory+' LIMIT 30 OFFSET ?',role,offset));
    const matches=db.all(directory,role).filter(person=>
      [person.name,person.expertise,person.languages].some(field=>field.toLowerCase().includes(search)));
    res.json(matches.slice(offset,offset+30));
  });
  app.get('/api/guidance', auth, (req, res) => {
    approved(req.user);
    db.tx(() => reconcileGuidance(db));
    res.json(db.all(select + ' WHERE g.student=? OR g.staff=? ORDER BY g.id DESC LIMIT 30 OFFSET ?', req.user.id, req.user.id, page(req.query.page) * 30));
  });
  app.post('/api/guidance', auth, (req, res) => {
    const data = read(form({ kind, staff: id, goal: words(1000, 5) }), req.body);
    const request = db.tx(() => {
      reconcileGuidance(db);
      student(db, req.user, ownerPlan[data.kind]);
      const target = db.get("SELECT s.* FROM staff s JOIN users u ON u.id=s.user_id WHERE u.id=? AND u.role=? AND u.status='approved'", data.staff, data.kind);
      ensure(target, 404, 'STAFF_UNAVAILABLE', 'This specialist is unavailable.');
      ensure(!db.get("SELECT 1 FROM guidance WHERE student=? AND kind=? AND state IN ('pending','active')", req.user.id, data.kind),
        409, 'REQUEST_EXISTS', 'End or cancel your current request before starting another.');
      const active = db.get("SELECT count(*) n FROM guidance WHERE staff=? AND state='active'", data.staff).n;
      ensure(active < target.capacity, 409, 'CAPACITY_FULL', 'This specialist has no remaining slots.');
      const now = Date.now();
      const result = db.run("INSERT INTO guidance(student,staff,kind,state,goal,created,expires) VALUES (?,?,?,'pending',?,?,?)",
        req.user.id, data.staff, data.kind, data.goal, now, now + config.requestDays * DAY);
      notify(db, data.staff, `New ${data.kind} request from ${req.user.name}.`, '/guidance');
      return result.lastInsertRowid;
    });
    res.status(201).json({ id: request });
  });
  app.post('/api/guidance/:id/decision', auth, (req, res) => {
    approved(req.user);
    const requestId = read(id, req.params.id);
    const { action, reason } = read(form({ action: z.enum(['accept','decline','cancel','end','intervene']), reason: words(400).optional() }), req.body);
    db.tx(() => reconcileGuidance(db));
    db.tx(() => {
      const row = db.get('SELECT * FROM guidance WHERE id=?', requestId);
      const actor = req.user.id;
      if (action === 'intervene') {
        admin(req.user);
        ensure(reason, 422, 'REASON_REQUIRED', 'Enter an intervention reason.');
      } else {
        const decision = ['accept','decline'].includes(action);
        ensure(row && (decision ? actor === row.staff : actor === row.student || (action === 'end' && actor === row.staff)),
          404, 'REQUEST_NOT_FOUND', 'Guidance request not found.');
      }
      const states = action === 'end' ? ['active'] : action === 'intervene' ? ['pending','active'] : ['pending'];
      ensure(row && states.includes(row.state), 409, 'STATE_CHANGED', 'This request has already changed status.');
      if (action === 'accept') {
        student(db, db.get('SELECT * FROM users WHERE id=?', row.student), ownerPlan[row.kind]);
        const capacity = db.get('SELECT capacity FROM staff WHERE user_id=?', actor)?.capacity ?? 0;
        ensure(db.get("SELECT count(*) n FROM guidance WHERE staff=? AND state='active'", actor).n < capacity,
          409, 'CAPACITY_FULL', 'You have reached your active learner capacity.');
      }
      const state = { accept:'active', decline:'declined', cancel:'canceled', end:'ended', intervene:'ended' }[action];
      db.run('UPDATE guidance SET state=?,reason=? WHERE id=?', state, reason ?? null, requestId);
      notify(db, row.student, `Your ${row.kind} request is ${state}.`, '/guidance');
      notify(db, row.staff, `A ${row.kind} request is ${state}.`, '/guidance');
      if (action === 'intervene') log(db, actor, 'guidance.intervene', requestId, { from: row.state, to: state, reason });
    });
    res.json({ ok: true });
  });
}
