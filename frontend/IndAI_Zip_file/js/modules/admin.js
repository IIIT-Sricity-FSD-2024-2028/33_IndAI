// ============================================================
// IndAI Platform – Admin Dashboard Module
// Extracted from admin-dashboard.html inline <script>
// ============================================================

Auth.requireAuth(["admin", "superuser"]);
DarkMode.injectInto(".nav-right");

const activities = [
  { color: "var(--blue)", msg: "New instructor registered", sub: "Dr. Meera Patel joined • 1 hour ago" },
  { color: "var(--green)", msg: "Trading limit increased", sub: "Max limit raised to ₹2,00,000 • 3 hours ago" },
  { color: "var(--orange)", msg: "System maintenance completed", sub: "Server updates successful • 5 hours ago" },
  { color: "var(--purple)", msg: "Crypto trading enabled", sub: "New feature activated • 1 day ago" }
];

function renderStats() {
  const users = DB.getUsers();
  const learners = users.filter(u => u.role === "learner");
  const instrs = users.filter(u => u.role === "instructor");
  const active = learners.filter(u => u.status === "active");
  document.getElementById("admin-stats").innerHTML = `
    <div class="stat-card"><div class="stat-label">Total Users</div><div class="stat-value">${users.length}</div><div class="stat-sub">${active.length} active now</div></div>
    <div class="stat-card"><div class="stat-label">Instructors</div><div class="stat-value green">${instrs.length}</div><div class="stat-sub">${DB.getProviders().length} course providers</div></div>
    <div class="stat-card"><div class="stat-label">System Health</div><div class="stat-value purple">98%</div><div class="stat-sub">All systems operational</div></div>
    <div class="stat-card"><div class="stat-label">Avg Response Time</div><div class="stat-value">450ms</div><div class="stat-sub">Excellent performance</div></div>`;
}

function renderActivityList() {
  document.getElementById("activity-list").innerHTML = activities.map(a =>
    `<div class="activity-item"><div class="activity-dot" style="background:${a.color};"></div><div><div style="font-weight:600;font-size:13px;">${a.msg}</div><div style="font-size:12px;color:var(--gray-500);">${a.sub}</div></div></div>`
  ).join("");
}

function renderGrowthStats() {
  const learners = DB.getLearners();
  const instrs = DB.getInstructors();
  const active = learners.filter(l => l.status === "active");
  const trades = IndAIData.trades;
  const avgReturn = learners.length
    ? (learners.reduce((s,l) => s + ((l.portfolioValue-100000)/100000*100), 0) / learners.length).toFixed(1)
    : 0;

  document.getElementById("growth-stats").innerHTML = `
    <div style="background:var(--blue-light);border-radius:var(--radius-sm);padding:16px;text-align:center;"><div style="font-size:1.8rem;font-weight:900;color:var(--blue);">${learners.length}</div><div style="font-size:13px;color:var(--gray-600);">Total Learners</div></div>
    <div style="background:var(--green-light);border-radius:var(--radius-sm);padding:16px;text-align:center;"><div style="font-size:1.8rem;font-weight:900;color:var(--green);">${active.length}</div><div style="font-size:13px;color:var(--gray-600);">Active Today</div></div>
    <div style="background:var(--orange-light);border-radius:var(--radius-sm);padding:16px;text-align:center;"><div style="font-size:1.8rem;font-weight:900;color:var(--orange);">${instrs.length}</div><div style="font-size:13px;color:var(--gray-600);">Instructors</div></div>
    <div style="background:var(--purple-light);border-radius:var(--radius-sm);padding:16px;text-align:center;"><div style="font-size:1.8rem;font-weight:900;color:var(--purple);">${DB.getProviders().length}</div><div style="font-size:13px;color:var(--gray-600);">Course Providers</div></div>`;

  const analyticsEl = document.getElementById("platform-analytics");
  if (analyticsEl) {
    analyticsEl.innerHTML = `
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="ac-icon" style="background:var(--blue-light);">Growth</div>
          <div class="ac-value" style="color:var(--blue);">${trades.length}</div>
          <div class="ac-label">Total Simulated Trades</div>
          <div class="ac-change positive">+${trades.filter(t=>t.date===todayISO()).length} today</div>
        </div>
        <div class="analytics-card">
          <div class="ac-icon" style="background:var(--green-light);">Value</div>
          <div class="ac-value" style="color:var(--green);">+${avgReturn}%</div>
          <div class="ac-label">Platform Avg Returns</div>
          <div class="ac-change positive">Across all learners</div>
        </div>
        <div class="analytics-card">
          <div class="ac-icon" style="background:var(--orange-light);">Courses</div>
          <div class="ac-value" style="color:var(--orange);">${DB.getCourses().filter(c=>c.status==="published").length}</div>
          <div class="ac-label">Published Courses</div>
          <div class="ac-change">${DB.getCourses().filter(c=>c.status==="draft").length} in draft</div>
        </div>
      </div>
      <div style="margin-top:8px;">
        <h4 style="margin-bottom:12px;">Analytics Learner Performance Leaderboard</h4>
        ${(() => { const el = document.createElement('div'); el.id="admin-lb-tmp"; setTimeout(()=>renderLeaderboard(DB.getLearners(), "admin-lb-tmp"),0); return '<div id="admin-lb-tmp"></div>'; })()}
      </div>`;
    setTimeout(() => renderLeaderboard(DB.getLearners(), "admin-lb-tmp"), 50);
  }
}

function switchTab(tab) {
  document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("view-" + tab).classList.add("active");
  document.getElementById("tab-" + tab).classList.add("active");
  if (tab === "users") renderUsersPanel();
  if (tab === "config") renderAdminConfig();
  if (tab === "assignments") renderAdminAssignments();
}

function showSubTab(tab) {
  document.getElementById("panel-students").style.display = tab === "students" ? "block" : "none";
  document.getElementById("panel-instructors").style.display = tab === "instructors" ? "block" : "none";
  document.getElementById("sub-students").className = tab === "students" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
  document.getElementById("sub-instructors").className = tab === "instructors" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
  if (tab === "instructors") renderInstructorsTable();
}

function renderUsersPanel() {
  const learners = DB.getLearners();
  const instrs = DB.getInstructors();
  document.getElementById("students-tbody").innerHTML = learners.map(u => {
    const instr = instrs.find(i => i.id === u.instructorId);
    return `<tr>
      <td><div style="font-weight:700;">${u.firstName} ${u.lastName}</div><span class="badge ${u.status==="active"?"badge-dark":"badge-orange"}" style="font-size:11px;">${u.status}</span></td>
      <td style="font-size:13px;">${instr ? instr.firstName + " " + instr.lastName : "Unassigned"}</td>
      <td style="font-weight:700; color:var(--orange);">${u.skillPoints || 0}</td>
      <td>${UI.formatCurrency(u.tradingLimit || 0)}</td>
      <td><div style="display:flex;gap:8px;">
        <button class="btn-icon" onclick="openEditStudentModal('${u.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteStudent('${u.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
      </div></td>
    </tr>`;
  }).join("") || `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--gray-500);">No learners found</td></tr>`;
}

function renderInstructorsTable() {
  const instrs = DB.getInstructors();
  const container = document.getElementById("panel-instructors");
  container.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
      <button class="btn btn-purple btn-sm" onclick="openAddInstructorModal()">+ Add Instructor</button>
    </div>
    <div style="font-weight:700;margin-bottom:4px;">Instructor Management</div>
    <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px;">Manage teaching staff and assignments</p>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name / Status</th><th>Assigned Students</th><th>Class Avg Return</th><th>Actions</th></tr></thead>
          <tbody>${instrs.map(i => {
            const students = DB.getLearners().filter(l => (i.studentIds||[]).includes(l.id));
            const avgRet = students.length
              ? (students.reduce((s,l)=>s+((l.portfolioValue-100000)/100000*100),0)/students.length).toFixed(1)
              : null;
            return `<tr>
              <td><div style="font-weight:700;">${i.firstName} ${i.lastName}</div>${getStatusBadge(i.status)}</td>
              <td style="font-weight:700;">${(i.studentIds||[]).length}</td>
              <td>${avgRet !== null ? `<span class="positive">+${avgRet}%</span>` : '<span style="color:var(--gray-400);">N/A</span>'}</td>
              <td><div style="display:flex;gap:8px;">
                <button class="btn-icon" onclick="openEditInstructorModal('${i.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
                <button class="btn-icon danger" onclick="deleteInstructor('${i.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
              </div></td>
            </tr>`;
          }).join("")}</tbody>
        </table>
      </div>
    </div>`;
}

function openAddInstructorModal() {
  UI.showModal(`
    <div class="modal-title">Add Instructor</div>
    <div class="modal-subtitle">Register a new instructor account</div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">First Name *</label><input id="ai-first" class="form-input"></div>
      <div class="form-group"><label class="form-label">Last Name *</label><input id="ai-last" class="form-input"></div>
    </div>
    <div class="form-group"><label class="form-label">Email *</label><input id="ai-email" type="email" class="form-input"></div>
    <div class="form-group"><label class="form-label">Password *</label><input id="ai-pw" type="password" class="form-input" placeholder="Min 8 chars, upper, number, special"></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-purple" onclick="saveNewInstructor()">Add Instructor</button>
    </div>`);
}

function saveNewInstructor() {
  const valid = FormValidator.validate([
    FormValidator.name("ai-first","First name"),
    FormValidator.name("ai-last","Last name"),
    FormValidator.email("ai-email"),
    FormValidator.required("ai-pw","Password")
  ]);
  if (!valid) return;
  const email = document.getElementById("ai-email").value.trim();
  const pw = document.getElementById("ai-pw").value;
  if (!Validate.emailAvailable(email)) { UI.setFieldError("ai-email","Email already registered."); return; }
  const pwC = Validate.password(pw);
  if (!pwC.valid()) { UI.setFieldError("ai-pw","Password needs 8+ chars, uppercase, number, special char."); return; }
  const result = DB.addUser({
    firstName: document.getElementById("ai-first").value.trim(),
    lastName: document.getElementById("ai-last").value.trim(),
    email, password: pw,
    role: "instructor", status: "active", studentIds: []
  });
  if (result.error) { UI.showToast(result.error,"error"); return; }
  UI.closeModal(); UI.showToast("Instructor added successfully!"); renderInstructorsTable(); renderStats();
}

function openEditInstructorModal(id) {
  const i = DB.getUserById(id);
  if (!i) return;
  UI.showModal(`
    <div class="modal-title">Edit Instructor</div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">First Name</label><input id="ei-first" class="form-input" value="${i.firstName}"></div>
      <div class="form-group"><label class="form-label">Last Name</label><input id="ei-last" class="form-input" value="${i.lastName}"></div>
    </div>
    <div class="form-group"><label class="form-label">Status</label>
      <select id="ei-status" class="form-select"><option value="active" ${i.status==="active"?"selected":""}>Active</option><option value="pending" ${i.status==="pending"?"selected":""}>Pending</option><option value="suspended">Suspended</option></select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-purple" onclick="saveEditInstructor('${id}')">Save</button>
    </div>`);
}

function saveEditInstructor(id) {
  const first = document.getElementById("ei-first").value.trim();
  const last = document.getElementById("ei-last").value.trim();
  if (!first || !last) { UI.showToast("Name fields required.","error"); return; }
  DB.updateUser(id, { firstName:first, lastName:last, status:document.getElementById("ei-status").value });
  UI.closeModal(); UI.showToast("Instructor updated!"); renderInstructorsTable();
}

function deleteInstructor(id) {
  const i = DB.getUserById(id);
  if (!confirm(`Delete instructor "${i?.firstName} ${i?.lastName}"? Their students will become unassigned.`)) return;
  DB.getLearners().filter(l=>l.instructorId===id).forEach(l=>DB.updateUser(l.id,{instructorId:null}));
  DB.deleteUser(id); UI.showToast("Instructor deleted.","info"); renderInstructorsTable(); renderStats();
}

function openAddStudentModal() {
  const instrs = DB.getInstructors();
  UI.showModal(`
    <div class="modal-title">Add Student</div>
    <div class="modal-subtitle">Register a new learner</div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">First Name *</label><input id="as-first" class="form-input"></div>
      <div class="form-group"><label class="form-label">Last Name *</label><input id="as-last" class="form-input"></div>
    </div>
    <div class="form-group"><label class="form-label">Email *</label><input id="as-email" type="email" class="form-input"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Student ID</label><input id="as-sid" class="form-input" placeholder="STU0001"></div>
      <div class="form-group"><label class="form-label">Institution</label><input id="as-inst" class="form-input" placeholder="IIIT Sri City"></div>
    </div>
    <div class="form-group"><label class="form-label">Assign Instructor</label>
      <select id="as-instr" class="form-select"><option value="">Unassigned</option>${instrs.map(i=>`<option value="${i.id}">${i.firstName} ${i.lastName}</option>`).join("")}</select>
    </div>
    <div class="form-group"><label class="form-label">Password *</label><input id="as-pw" type="password" class="form-input" placeholder="Min 8 chars..."></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewStudent()">Add Student</button>
    </div>`);
}

function saveNewStudent() {
  const valid = FormValidator.validate([
    FormValidator.name("as-first", "First name"),
    FormValidator.name("as-last",  "Last name"),
    FormValidator.email("as-email"),
    FormValidator.required("as-pw",    "Password")
  ]);
  if (!valid) return;
  const email = document.getElementById("as-email").value.trim();
  const pw    = document.getElementById("as-pw").value;
  if (!Validate.emailAvailable(email)) { UI.setFieldError("as-email", "Email already registered."); return; }
  const pwC = Validate.password(pw);
  if (!pwC.valid()) { UI.setFieldError("as-pw", "Password needs 8+ chars, uppercase, number, special character."); return; }
  UI.clearFieldError("as-pw");
  const instVal = document.getElementById("as-inst").value.trim();
  const sidInput = document.getElementById("as-sid").value.trim();
  if (instVal && instVal.length < 3) { UI.setFieldError("as-inst", "Institution must be at least 3 characters."); return; }
  if (instVal && /^[0-9]/.test(instVal)) { UI.setFieldError("as-inst", "Institution cannot start with a number."); return; }
  if (sidInput && sidInput.length < 3) { UI.setFieldError("as-sid", "Student ID must be at least 3 characters."); return; }
  const instrId = document.getElementById("as-instr").value || null;
  const sid     = sidInput || ("STU" + genId("").slice(0,6).toUpperCase());
  const newUser = DB.addUser({
    firstName: document.getElementById("as-first").value.trim(),
    lastName:  document.getElementById("as-last").value.trim(),
    email, password: pw,
    role: "learner", status: "active",
    instructorId: instrId,
    studentId: sid,
    institution: document.getElementById("as-inst").value.trim()
  });
  if (newUser.error) { UI.showToast(newUser.error, "error"); return; }
  UI.closeModal(); UI.showToast("Student added! They can now log in immediately."); renderUsersPanel(); renderStats();
}

function openEditStudentModal(id) {
  const u = DB.getUserById(id);
  if (!u) return;
  const instrs = DB.getInstructors();
  UI.showModal(`
    <div class="modal-title">Edit Student</div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">First Name</label><input id="eu-first" class="form-input" value="${u.firstName}"></div>
      <div class="form-group"><label class="form-label">Last Name</label><input id="eu-last" class="form-input" value="${u.lastName}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Skill Points</label><input id="eu-pts" type="number" class="form-input" value="${u.skillPoints||0}"></div>
      <div class="form-group"><label class="form-label">Trading Limit (₹)</label><input id="eu-limit" type="number" class="form-input" value="${u.tradingLimit||100000}"></div>
    </div>
    <div class="form-group"><label class="form-label">Status</label>
      <select id="eu-status" class="form-select"><option value="active" ${u.status==="active"?"selected":""}>Active</option><option value="pending" ${u.status==="pending"?"selected":""}>Pending</option></select>
    </div>
    <div class="form-group"><label class="form-label">Instructor</label>
      <select id="eu-instr" class="form-select"><option value="">Unassigned</option>${instrs.map(i=>`<option value="${i.id}" ${u.instructorId===i.id?"selected":""}>${i.firstName} ${i.lastName}</option>`).join("")}</select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveEditStudent('${id}')">Save</button>
    </div>`);
}

function saveEditStudent(id) {
  const oldUser = DB.getUserById(id);
  const newInstrId = document.getElementById("eu-instr").value || null;
  const updates = {
    firstName:    document.getElementById("eu-first").value.trim(),
    lastName:     document.getElementById("eu-last").value.trim(),
    skillPoints:  parseInt(document.getElementById("eu-pts").value) || 0,
    tradingLimit: parseInt(document.getElementById("eu-limit").value) || 0,
    status:       document.getElementById("eu-status").value,
    instructorId: newInstrId
  };
  if (!updates.firstName || !updates.lastName) { UI.showToast("Name fields are required.", "error"); return; }
  if (!Validate.name(updates.firstName) || !Validate.name(updates.lastName)) { UI.showToast("Names must be at least 3 characters and contain only alphabets and spaces.", "error"); return; }

  if (oldUser.instructorId && oldUser.instructorId !== newInstrId) {
    const oldInstr = DB.getUserById(oldUser.instructorId);
    if (oldInstr) DB.updateUser(oldUser.instructorId, { studentIds: (oldInstr.studentIds||[]).filter(s => s !== id) });
  }
  DB.updateUser(id, updates);
  if (newInstrId && oldUser.instructorId !== newInstrId) {
    DB.assignLearnerToInstructor(id, newInstrId, "Admin");
  }
  UI.closeModal(); UI.showToast("Student updated! Instructor assignment synced."); renderUsersPanel(); renderStats();
}

function deleteStudent(id) {
  const u = DB.getUserById(id);
  if (!confirm(`Delete student "${u?.firstName} ${u?.lastName}"?`)) return;
  DB.deleteUser(id); UI.showToast("Deleted.", "info"); renderUsersPanel(); renderStats();
}

function openAssignInstructorModal(id) {
  const instr = DB.getUserById(id);
  const learners = DB.getLearners();
  UI.showModal(`
    <div class="modal-title">Manage Instructor Assignments</div>
    <div class="modal-subtitle">${instr.firstName} ${instr.lastName}</div>
    <p style="font-size:13px;margin-bottom:12px;">Select students to assign to this instructor:</p>
    <div style="max-height:300px;overflow-y:auto;">
      ${learners.map(l => `
        <label class="checkbox-row" style="padding:8px 0; border-bottom:1px solid var(--gray-100);">
          <input type="checkbox" value="${l.id}" ${(instr.studentIds||[]).includes(l.id)?"checked":""}> ${l.firstName} ${l.lastName} (${l.email})
        </label>`).join("")}
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveInstructorAssignment('${id}')">Save</button>
    </div>`);
}

function saveInstructorAssignment(instrId) {
  const instr = DB.getUserById(instrId);
  const previous = new Set(instr?.studentIds || []);
  const checked = [...document.querySelectorAll("#modal-overlay input[type=checkbox]:checked")].map(c => c.value);
  DB.updateUser(instrId, { studentIds: checked });
  checked.forEach(sid => DB.assignLearnerToInstructor(sid, instrId, "Admin"));
  DB.getLearners().filter(l => previous.has(l.id) && !checked.includes(l.id)).forEach(l => DB.updateUser(l.id, { instructorId: null }));
  UI.closeModal(); UI.showToast("Assignments updated!"); renderInstructorsTable();
}

function renderAdminConfig() {
  const cfg = DB.getConfig();
  document.getElementById("a-cfg-maxlimit").value = cfg.maxTradingLimit;
  document.getElementById("a-cfg-maxpts").value = cfg.maxSkillPointsPerChallenge;
  document.getElementById("a-cfg-minmargin").value = cfg.minSkillPointsMarginTrading;
  document.getElementById("a-cfg-maxtrades").value = cfg.maxDailyTrades;
  document.getElementById("a-cfg-cooldown").value = cfg.tradeCooldownMinutes;
  const featureNames = { marginTrading:"Margin Trading", cryptoTrading:"Cryptocurrency Trading", forexTrading:"Forex Trading" };
  const featureDescs = { marginTrading:"Allow advanced users to trade on margin", cryptoTrading:"Enable crypto paper trading for students", forexTrading:"Allow currency pair trading" };
  document.getElementById("admin-feature-toggles").innerHTML = Object.entries(cfg.features).map(([key, val]) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:10px;">
      <div><div style="font-weight:700;font-size:14px;">${featureNames[key]}</div><div style="font-size:12px;color:var(--gray-500);">${featureDescs[key]}</div></div>
      <label class="toggle"><input type="checkbox" ${val?"checked":""} onchange="adminToggleFeature('${key}', this.checked)"><span class="toggle-slider"></span></label>
    </div>`).join("");
  document.getElementById("admin-feature-status").innerHTML = Object.entries(cfg.features).map(([key, val]) =>
    `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">${featureNames[key]}: <span style="font-weight:700;color:${val?"var(--green)":"var(--gray-500)"};">${val?"Enabled":"Disabled"}</span></div>`).join("");
}

function adminToggleFeature(key, val) { const cfg = DB.getConfig(); cfg.features[key] = val; DB.updateConfig(cfg); renderAdminConfig(); }

function saveAdminConfig() {
  const maxLimit = parseInt(document.getElementById("a-cfg-maxlimit").value);
  const maxPts = parseInt(document.getElementById("a-cfg-maxpts").value);
  const minMargin = parseInt(document.getElementById("a-cfg-minmargin").value);
  const maxTrades = parseInt(document.getElementById("a-cfg-maxtrades").value);
  const cooldown = parseInt(document.getElementById("a-cfg-cooldown").value);
  if (!maxLimit||!maxPts||!minMargin||!maxTrades||!cooldown) { UI.showToast("All fields required.", "error"); return; }
  DB.updateConfig({ maxTradingLimit:maxLimit, maxSkillPointsPerChallenge:maxPts, minSkillPointsMarginTrading:minMargin, maxDailyTrades:maxTrades, tradeCooldownMinutes:cooldown });
  UI.showToast("Configuration saved!"); renderAdminConfig();
}

function renderAdminAssignments() {
  const assignments = DB.getAssignments();
  document.getElementById("admin-assignments-tbody").innerHTML = assignments.map(a => {
    const instr = DB.getUserById(a.instructorId);
    const diffColors = { Easy:"badge-green", Medium:"badge-orange", Hard:"badge-red" };
    return `<tr>
      <td><div style="font-weight:700;">${a.title}</div><div style="font-size:12px;color:var(--gray-500);">${a.description.substring(0,50)}...</div></td>
      <td>${instr ? instr.firstName+" "+instr.lastName : "—"}</td>
      <td><span class="badge ${diffColors[a.difficulty]||'badge-gray'}">${a.difficulty}</span></td>
      <td>${a.dueDate}</td><td>${a.studentIds.length}</td>
      <td style="color:var(--green);font-weight:700;">${a.completedIds.length}</td>
      <td><div style="display:flex;gap:8px;">
        <button class="btn-icon" onclick="openEditAdminAssignment('${a.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteAdminAssignment('${a.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
      </div></td>
    </tr>`;
  }).join("") || `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--gray-500);">No assignments</td></tr>`;
}

function openAddAssignmentAdmin() {
  const instrs = DB.getInstructors();
  UI.showModal(`
    <div class="modal-title">Add Assignment</div>
    <div class="form-group"><label class="form-label">Title *</label><input id="aa-title" class="form-input"></div>
    <div class="form-group"><label class="form-label">Description *</label><textarea id="aa-desc" class="form-textarea"></textarea></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Instructor</label><select id="aa-instr" class="form-select"><option value="">Select</option>${instrs.map(i=>`<option value="${i.id}">${i.firstName} ${i.lastName}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Difficulty</label><select id="aa-diff" class="form-select"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Due Date</label><input id="aa-due" type="date" class="form-input"></div>
      <div class="form-group"><label class="form-label">Skill Points</label><input id="aa-pts" type="number" class="form-input" value="25"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveAdminAssignment()">Add</button>
    </div>`);
}

function saveAdminAssignment() {
  const title = document.getElementById("aa-title").value.trim();
  const desc = document.getElementById("aa-desc").value.trim();
  const instrId = document.getElementById("aa-instr").value;
  const diff = document.getElementById("aa-diff").value;
  const due = document.getElementById("aa-due").value;
  const pts = parseInt(document.getElementById("aa-pts").value) || 25;
  const valid = FormValidator.validate([
    FormValidator.required("aa-title", "Title"),
    FormValidator.required("aa-desc", "Description"),
    FormValidator.select("aa-instr", "an instructor"),
    FormValidator.saneFutureDate("aa-due", "Due date", 365),
    FormValidator.positiveInt("aa-pts", "Skill points", 1, 200)
  ]);
  if (!valid) return;
  const instr = DB.getUserById(instrId);
  DB.addAssignment({ title, description: desc, instructorId: instrId, dueDate: due, difficulty: diff, skillPoints: pts, status: "active", studentIds: instr?.studentIds || [] });
  UI.closeModal(); UI.showToast("Assignment added!"); renderAdminAssignments();
}

function openEditAdminAssignment(id) {
  const a = DB.getAssignments().find(x => x.id === id);
  if (!a) return;
  UI.showModal(`
    <div class="modal-title">Edit Assignment</div>
    <div class="form-group"><label class="form-label">Title</label><input id="ea-title" class="form-input" value="${a.title}"></div>
    <div class="form-group"><label class="form-label">Description</label><textarea id="ea-desc" class="form-textarea">${a.description}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Due Date</label><input id="ea-due" type="date" class="form-input" value="${a.dueDate}"></div>
      <div class="form-group"><label class="form-label">Skill Points</label><input id="ea-pts" type="number" class="form-input" value="${a.skillPoints}"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveEditAdminAssignment('${a.id}')">Save</button>
    </div>`);
}

function saveEditAdminAssignment(id) {
  const updates = { title: document.getElementById("ea-title").value.trim(), description: document.getElementById("ea-desc").value.trim(), dueDate: document.getElementById("ea-due").value, skillPoints: parseInt(document.getElementById("ea-pts").value)||25 };
  if (!updates.title) { UI.showToast("Title required.", "error"); return; }
  DB.updateAssignment(id, updates); UI.closeModal(); UI.showToast("Updated!"); renderAdminAssignments();
}

function deleteAdminAssignment(id) {
  const a = DB.getAssignments().find(x=>x.id===id);
  if (!confirm(`Delete "${a?.title}"?`)) return;
  DB.deleteAssignment(id); UI.showToast("Deleted.", "info"); renderAdminAssignments();
}

function toggleNotifs() { openNotificationsModal(); }

function openNotificationsModal() {
  const admin = Auth.getCurrentUser();
  const notifs = admin ? DB.getNotifications(admin.id) : [];
  const icons = { assignment:"Tasks", session:"Date️", achievement:"Points", feedback:"Note", student:"Users", info:"ℹ️" };
  UI.showModal(`
    <div class="modal-title">Alert Notifications</div>
    <div style="max-height:400px;overflow-y:auto;">
      ${notifs.length ? notifs.map(n=>`
        <div style="padding:12px;border-bottom:1px solid var(--gray-100);display:flex;gap:10px;align-items:flex-start;opacity:${n.read?'0.6':'1'};">
          <span style="font-size:18px;flex-shrink:0;">${icons[n.type]||'Alert'}</span>
          <div><div style="font-size:13px;font-weight:${n.read?'400':'700'};">${n.message}</div><div style="font-size:11px;color:var(--gray-400);">${n.createdAt}</div></div>
        </div>`).join('') : emptyState('Alert','No notifications')}
    </div>
    <div class="modal-footer"><button class="btn btn-primary" onclick="UI.closeModal()">Close</button></div>`);
  if (admin) { DB.markAllRead(admin.id); updateNotifBadge(); }
}

function openProfileModal() {
  const user = Auth.getCurrentUser();
  if (!user) return;
  const learners  = DB.getLearners().length;
  const instrs    = DB.getInstructors().length;
  const providers = DB.getProviders().length;
  UI.showModal(`
    <div class="modal-title">My Profile</div>
    <div style="text-align:center;margin-bottom:20px;">
      <div style="width:64px;height:64px;background:var(--purple-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px;">Admin️</div>
      <div style="font-weight:800;font-size:1.1rem;">${user.firstName} ${user.lastName}</div>
      <div style="font-size:13px;color:var(--gray-500);">${user.email}</div>
      <span class="badge badge-purple" style="margin-top:8px;display:inline-block;">Admin</span>
    </div>
    <div class="report-card">
      <div class="report-metric"><span>Total Learners</span><span style="font-weight:700;">${learners}</span></div>
      <div class="report-metric"><span>Instructors</span><span style="font-weight:700;">${instrs}</span></div>
      <div class="report-metric"><span>Course Providers</span><span style="font-weight:700;">${providers}</span></div>
      <div class="report-metric"><span>Member Since</span><span style="font-weight:700;">${user.createdAt||'N/A'}</span></div>
      <div class="report-metric"><span>Role</span><span style="font-weight:700;">${user.role}</span></div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="UI.closeModal()">Close</button></div>`);
}

function updateNotifBadge() {
  const user = Auth.getCurrentUser();
  const count = user ? DB.getUnreadCount(user.id) : 0;
  const el = document.getElementById("notif-count");
  if (el) el.textContent = count || 0;
}

// Init
(function() {
  const user = Auth.getCurrentUser();
  if (user) {
    const nameEl = document.getElementById("nav-admin-name");
    if (nameEl) nameEl.textContent = user.firstName + " " + user.lastName;
    updateNotifBadge();
  }
})();
renderStats(); renderActivityList(); renderGrowthStats();
