// ============================================================
// IndAI Platform – Super User Dashboard Module
// Extracted from superuser-dashboard.html inline <script>
// ============================================================

const session = Auth.requireAuth(["superuser"]);
DarkMode.injectInto(".super-nav-right");
const user = Auth.getCurrentUser();
if (user) document.getElementById("nav-name").textContent = user.firstName + " " + user.lastName;

function showView(v, btn) {
  document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".tab-nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("view-" + v).classList.add("active");
  if (btn) btn.classList.add("active");
  if (v === "users") renderUsers();
  if (v === "courses") renderCourses();
  if (v === "assignments") renderAssignments();
  if (v === "sessions") renderSessions();
  if (v === "config") renderConfig();
  if (v === "approvals") renderApprovals();
}

// ---- STATS ----
function renderStats() {
  const users = DB.getUsers();
  const learners = users.filter(u => u.role === "learner").length;
  const instrs = users.filter(u => u.role === "instructor").length;
  const courses = DB.getCourses().length;
  const assignments = DB.getAssignments().length;
  document.getElementById("super-stats").innerHTML = `
    <div class="stat-card"><div class="stat-label">Total Users</div><div class="stat-value">${users.length}</div><div class="stat-sub">${learners} learners, ${instrs} instructors</div></div>
    <div class="stat-card"><div class="stat-label">Total Courses</div><div class="stat-value blue">${courses}</div><div class="stat-sub">${DB.getCourses().filter(c=>c.status==="published").length} published</div></div>
    <div class="stat-card"><div class="stat-label">Active Assignments</div><div class="stat-value green">${assignments}</div><div class="stat-sub">Across all instructors</div></div>
    <div class="stat-card"><div class="stat-label">Total Trades</div><div class="stat-value orange">${IndAIData.trades.length}</div><div class="stat-sub">All simulated trades</div></div>
  `;
}

// ---- USERS ----
// Note: getRoleChip is already a global from mockData.js,
// but the superuser dashboard had a local override. We keep the local version
// here to avoid any risk of behavioral difference.
function getRoleChip(role) {
  const map = { superuser:"chip-superuser", admin:"chip-admin", instructor:"chip-instructor", provider:"chip-provider", learner:"chip-learner" };
  return `<span class="role-chip ${map[role]||'badge-gray'}">${role}</span>`;
}

function renderUsers() {
  const search = (document.getElementById("user-search")?.value || "").toLowerCase();
  const roleF = document.getElementById("role-filter")?.value || "";
  const statusF = document.getElementById("status-filter")?.value || "";
  let users = DB.getUsers().filter(u => {
    const name = (u.firstName + " " + u.lastName).toLowerCase();
    const matchSearch = !search || name.includes(search) || u.email.toLowerCase().includes(search);
    const matchRole = !roleF || u.role === roleF;
    const matchStatus = !statusF || u.status === statusF;
    return matchSearch && matchRole && matchStatus;
  });
  const tbody = document.getElementById("users-tbody");
  if (!users.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--gray-500);">No users found</td></tr>`; return; }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td><div style="font-weight:700;">${u.firstName} ${u.lastName}</div><div style="font-size:12px;color:var(--gray-500);">${u.studentId || ""}</div></td>
      <td style="font-size:13px;">${u.email}</td>
      <td>${getRoleChip(u.role)}</td>
      <td><span class="badge ${u.status==='active'?'badge-green':'badge-orange'}">${u.status}</span></td>
      <td style="font-weight:700; color:var(--orange);">${u.skillPoints || 0}</td>
      <td style="font-size:12px; color:var(--gray-500);">${u.createdAt || ""}</td>
      <td>
        <div style="display:flex; gap:8px;">
          <button class="btn-icon" onclick="openEditUserModal('${u.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
          <button class="btn-icon danger" onclick="deleteUser('${u.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
        </div>
      </td>
    </tr>`).join("");
}

function openAddUserModal() {
  const instructors = DB.getInstructors();
  UI.showModal(`
    <div class="modal-title">Add New User</div>
    <div class="modal-subtitle">Create a new platform user</div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">First Name *</label><input type="text" id="mu-first" class="form-input" placeholder="First name"></div>
      <div class="form-group"><label class="form-label">Last Name *</label><input type="text" id="mu-last" class="form-input" placeholder="Last name"></div>
    </div>
    <div class="form-group"><label class="form-label">Email *</label><input type="email" id="mu-email" class="form-input" placeholder="email@example.com"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Role *</label>
        <select id="mu-role" class="form-select" onchange="toggleInstructorField();renderAddUserRoleFields()">
          <option value="">Select role</option>
          <option value="admin">Admin</option><option value="instructor">Instructor</option>
          <option value="provider">Course Provider</option><option value="learner">Learner</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Status</label>
        <select id="mu-status" class="form-select"><option value="active">Active</option><option value="pending">Pending</option></select>
      </div>
    </div>
    <div id="mu-role-fields"></div>
    <div id="mu-instructor-row" style="display:none;" class="form-group">
      <label class="form-label">Assign Instructor</label>
      <select id="mu-instructor" class="form-select">
        <option value="">Unassigned</option>
        ${instructors.map(i => `<option value="${i.id}">${i.firstName} ${i.lastName}</option>`).join("")}
      </select>
    </div>
    <div class="form-group"><label class="form-label">Password *</label><input type="password" id="mu-pw" class="form-input" placeholder="Min 8 chars, 1 upper, 1 number, 1 special"></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewUser()">Add User</button>
    </div>`);
}

function renderAddUserRoleFields() {
  const role = document.getElementById("mu-role")?.value || "";
  const target = document.getElementById("mu-role-fields");
  if (!target) return;
  const baseField = (id, label, placeholder='', required=false) => `
    <div class="form-group"><label class="form-label">${label}${required ? ' *' : ''}</label><input type="text" id="${id}" class="form-input" placeholder="${placeholder}"></div>`;
  if (role === 'learner') {
    target.innerHTML = `
      ${baseField('mu-inst','Institution / School Name','Optional institution')}
      <div class="form-row">
        ${baseField('mu-sid','Student ID','Student ID')}
        ${baseField('mu-grade','Grade / Level','e.g. 2nd Year')}
      </div>
      ${baseField('mu-major','Course / Major','Optional major')}`;
  } else if (role === 'instructor') {
    target.innerHTML = `
      ${baseField('mu-inst-org','Institution / Organization','Organization',true)}
      ${baseField('mu-expertise','Expertise / Specialization','Specialization',true)}
      <div class="form-group"><label class="form-label">Years of Experience *</label>
        <select id="mu-years" class="form-select">
          <option value="">Select experience</option>
          <option>Less than 1 year</option><option>1-3 years</option><option>3-5 years</option><option>5-10 years</option><option>10+ years</option>
        </select>
      </div>`;
  } else if (role === 'provider') {
    target.innerHTML = `
      ${baseField('mu-org','Organization Name','TradingPro Academy',true)}
      ${baseField('mu-website','Website / LinkedIn','https://...')}
      <div class="form-group"><label class="form-label">Content Type</label>
        <select id="mu-content-type" class="form-select"><option value="">Select type</option><option>Video Courses</option><option>Text Modules</option><option>Mixed</option></select>
      </div>`;
  } else if (role === 'admin') {
    target.innerHTML = `
      ${baseField('mu-admin-inst','Institution','IIIT Sri City',true)}
      <div class="form-group"><label class="form-label">Admin Type</label>
        <input type="text" class="form-input" value="Admin" disabled>
        <input type="hidden" id="mu-access" value="Admin">
      </div>
      ${baseField('mu-auth-code','Authorization Code','ADMIN2024',true)}
      <div class="form-hint">Demo code: ADMIN2024</div>`;
  } else {
    target.innerHTML = '';
  }
}

function toggleInstructorField() {
  const role = document.getElementById("mu-role")?.value;
  const row = document.getElementById("mu-instructor-row");
  if (row) row.style.display = role === "learner" ? "block" : "none";
}

function saveNewUser() {
  const valid = FormValidator.validate([
    FormValidator.name("mu-first", "First name"),
    FormValidator.name("mu-last", "Last name"),
    FormValidator.email("mu-email"),
    FormValidator.select("mu-role", "a role")
  ]);
  if (!valid) return;

  const email = document.getElementById("mu-email").value.trim();
  const pw = document.getElementById("mu-pw").value;
  if (!Validate.emailAvailable(email)) { UI.setFieldError("mu-email", "Email already registered."); return; }
  const pwCheck = Validate.password(pw);
  if (!pw) { UI.setFieldError("mu-pw", "Password is required."); return; }
  if (!pwCheck.valid()) { UI.setFieldError("mu-pw", "Password doesn't meet requirements (8+ chars, upper, lower, number, special)."); return; }

  const first = document.getElementById("mu-first").value.trim();
  const last = document.getElementById("mu-last").value.trim();
  const role = document.getElementById("mu-role").value;
  const status = document.getElementById("mu-status").value;
  const instrId = document.getElementById("mu-instructor")?.value || null;
  const payload = { firstName: first, lastName: last, email, role, status, password: pw, instructorId: instrId };

  if (role === 'learner') {
    const institution = document.getElementById('mu-inst')?.value.trim() || '';
    const studentId = document.getElementById('mu-sid')?.value.trim() || '';
    const grade = document.getElementById('mu-grade')?.value.trim() || '';
    const major = document.getElementById('mu-major')?.value.trim() || '';
    if (institution && institution.length < 3) { UI.setFieldError('mu-inst','Institution must be at least 3 characters.'); return; }
    if (institution && /^[0-9]/.test(institution)) { UI.setFieldError('mu-inst','Institution cannot start with a number.'); return; }
    if (studentId && studentId.length < 3) { UI.setFieldError('mu-sid','Student ID must be at least 3 characters.'); return; }
    if (grade && grade.length < 3) { UI.setFieldError('mu-grade','Grade / Level must be at least 3 characters.'); return; }
    if (major && major.length < 3) { UI.setFieldError('mu-major','Course / Major must be at least 3 characters.'); return; }
    payload.institution = institution; payload.studentId = studentId; payload.grade = grade; payload.major = major; payload.enforceRoleDetails = false;
  } else if (role === 'instructor') {
    const institution = document.getElementById('mu-inst-org')?.value.trim() || '';
    const expertise = document.getElementById('mu-expertise')?.value.trim() || '';
    const yearsExp = document.getElementById('mu-years')?.value || '';
    if (!institution) { UI.setFieldError('mu-inst-org','Institution / Organization is required.'); return; }
    if (!expertise) { UI.setFieldError('mu-expertise','Expertise / Specialization is required.'); return; }
    if (!yearsExp) { UI.setFieldError('mu-years','Years of experience is required.'); return; }
    if (institution.length < 3) { UI.setFieldError('mu-inst-org','Institution / Organization must be at least 3 characters.'); return; }
    if (/^[0-9]/.test(institution)) { UI.setFieldError('mu-inst-org','Institution / Organization cannot start with a number.'); return; }
    if (expertise.length < 3) { UI.setFieldError('mu-expertise','Expertise / Specialization must be at least 3 characters.'); return; }
    payload.institution = institution; payload.expertise = expertise; payload.yearsExp = yearsExp; payload.studentIds = []; payload.enforceInstructorRoleDetails = true;
  } else if (role === 'provider') {
    const org = document.getElementById('mu-org')?.value.trim() || '';
    const website = document.getElementById('mu-website')?.value.trim() || '';
    const contentType = document.getElementById('mu-content-type')?.value || '';
    if (!org) { UI.setFieldError('mu-org','Organization name is required.'); return; }
    if (org.length < 3) { UI.setFieldError('mu-org','Organization name must be at least 3 characters.'); return; }
    if (/^[0-9]/.test(org)) { UI.setFieldError('mu-org','Organization cannot start with a number.'); return; }
    if (website && !Validate.url(website)) { UI.setFieldError('mu-website','Enter a valid link starting with http:// or https://'); return; }
    payload.organization = org; payload.website = website; payload.contentType = contentType;
  } else if (role === 'admin') {
    const institution = document.getElementById('mu-admin-inst')?.value.trim() || '';
    const accessLevel = 'Admin';
    const authCode = document.getElementById('mu-auth-code')?.value.trim() || '';
    if (!institution) { UI.setFieldError('mu-admin-inst','Institution is required.'); return; }
    if (institution.length < 3) { UI.setFieldError('mu-admin-inst','Institution must be at least 3 characters.'); return; }
    if (/^[0-9]/.test(institution)) { UI.setFieldError('mu-admin-inst','Institution cannot start with a number.'); return; }
    if (!authCode) { UI.setFieldError('mu-auth-code','Authorization code is required.'); return; }
    if (authCode !== 'ADMIN2024') { UI.setFieldError('mu-auth-code','Invalid code. Demo code is: ADMIN2024'); return; }
    payload.institution = institution; payload.accessLevel = accessLevel;
  }

  const result = DB.addUser(payload);
  if (result.error) { UI.showToast(result.error, "error"); return; }
  UI.closeModal(); UI.showToast("User added successfully!"); renderUsers(); renderStats();
}

function openEditUserModal(id) {
  const u = DB.getUserById(id);
  if (!u) return;
  UI.showModal(`
    <div class="modal-title">Edit User</div>
    <div class="modal-subtitle">Update user information</div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">First Name</label><input id="eu-first" class="form-input" value="${u.firstName}"></div>
      <div class="form-group"><label class="form-label">Last Name</label><input id="eu-last" class="form-input" value="${u.lastName}"></div>
    </div>
    <div class="form-group"><label class="form-label">Email</label><input id="eu-email" class="form-input" value="${u.email}"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Status</label>
        <select id="eu-status" class="form-select"><option value="active" ${u.status==="active"?"selected":""}>Active</option><option value="pending" ${u.status==="pending"?"selected":""}>Pending</option><option value="suspended">Suspended</option></select>
      </div>
      <div class="form-group"><label class="form-label">Skill Points</label><input id="eu-pts" type="number" class="form-input" value="${u.skillPoints||0}"></div>
    </div>
    ${u.role==="learner" ? `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Trading Limit (₹)</label><input id="eu-tlimit" type="number" class="form-input" value="${u.tradingLimit||100000}"></div>
      <div class="form-group"><label class="form-label">Virtual Balance (₹)</label><input id="eu-bal" type="number" class="form-input" value="${u.virtualBalance||0}"></div>
    </div>` : ""}
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveEditUser('${id}')">Save Changes</button>
    </div>`);
}

function saveEditUser(id) {
  const u = DB.getUserById(id);
  const updates = {
    firstName: document.getElementById("eu-first").value.trim(),
    lastName: document.getElementById("eu-last").value.trim(),
    email: document.getElementById("eu-email").value.trim(),
    status: document.getElementById("eu-status").value,
    skillPoints: parseInt(document.getElementById("eu-pts").value) || 0
  };
  if (u.role === "learner") {
    updates.tradingLimit = parseInt(document.getElementById("eu-tlimit").value) || 0;
    updates.virtualBalance = parseInt(document.getElementById("eu-bal").value) || 0;
  }
  if (!updates.firstName || !updates.lastName || !updates.email) { UI.showToast("Fields cannot be empty.", "error"); return; }
  if (!Validate.name(updates.firstName) || !Validate.name(updates.lastName)) { UI.showToast("Names must be at least 3 characters and contain only alphabets and spaces.", "error"); return; }
  if (!Validate.email(updates.email)) { UI.showToast("Invalid email.", "error"); return; }
  DB.updateUser(id, updates);
  UI.closeModal(); UI.showToast("User updated!"); renderUsers(); renderStats();
}

function deleteUser(id) {
  const u = DB.getUserById(id);
  if (!u) return;
  if (u.role === "superuser") { UI.showToast("Cannot delete super user account.", "error"); return; }
  if (!confirm(`Delete user "${u.firstName} ${u.lastName}"? This cannot be undone.`)) return;
  DB.deleteUser(id);
  UI.showToast("User deleted.", "info"); renderUsers(); renderStats();
}

// ---- COURSES ----
function renderCourses() {
  const courses = DB.getCourses();
  document.getElementById("courses-tbody").innerHTML = courses.map(c => {
    const provider = DB.getUserById(c.providerId);
    const pct = c.enrolledCount ? Math.round((c.completedCount / c.enrolledCount) * 100) : 0;
    return `<tr>
      <td><div style="font-weight:700;">${c.title}</div><div style="font-size:12px;color:var(--gray-500);">${c.category}</div></td>
      <td style="font-size:13px;">${provider ? provider.firstName + " " + provider.lastName : "—"}</td>
      <td>${c.lessons}</td>
      <td style="font-weight:700; color:var(--orange);">${c.skillPoints}</td>
      <td>${c.enrolledCount}</td>
      <td><div class="progress-bar" style="width:80px;"><div class="progress-fill" style="width:${pct}%;"></div></div><span style="font-size:11px;">${pct}%</span></td>
      <td><span class="badge ${c.status==='published'?'badge-green':'badge-gray'}">${c.status}</span></td>
      <td><div style="display:flex;gap:8px;">
        <button class="btn-icon" onclick="openEditCourseModal('${c.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteCourse('${c.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
      </div></td>
    </tr>`;
  }).join("") || `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--gray-500);">No courses found</td></tr>`;
}

function openAddCourseModal() {
  const providers = DB.getProviders();
  UI.showModal(`
    <div class="modal-title">Add New Course</div>
    <div class="form-group"><label class="form-label">Course Title *</label><input id="ac-title" class="form-input" placeholder="e.g. Introduction to Stock Markets"></div>
    <div class="form-group"><label class="form-label">Description *</label><textarea id="ac-desc" class="form-textarea" placeholder="Course description"></textarea></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Provider *</label>
        <select id="ac-provider" class="form-select"><option value="">Select provider</option>${providers.map(p=>`<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join("")}</select>
      </div>
      <div class="form-group"><label class="form-label">Category *</label>
        <select id="ac-cat" class="form-select"><option value="">Select category</option><option>Fundamentals</option><option>Technical Analysis</option><option>Risk Management</option><option>Derivatives</option><option>FMCG</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Number of Lessons *</label><input id="ac-lessons" type="number" class="form-input" placeholder="8"></div>
      <div class="form-group"><label class="form-label">Skill Points Reward *</label><input id="ac-pts" type="number" class="form-input" placeholder="25"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Duration</label><input id="ac-dur" class="form-input" placeholder="2 hours"></div>
      <div class="form-group"><label class="form-label">Status</label><select id="ac-status" class="form-select"><option value="draft">Draft</option><option value="published">Published</option></select></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewCourse()">Add Course</button>
    </div>`);
}

function saveNewCourse() {
  const valid = FormValidator.validate([
    FormValidator.required("ac-title", "Course title"),
    FormValidator.required("ac-desc", "Description"),
    FormValidator.select("ac-provider", "a provider"),
    FormValidator.select("ac-cat", "a category"),
    FormValidator.positiveInt("ac-lessons", "Number of lessons", 1, 200),
    FormValidator.positiveInt("ac-pts", "Skill points", 1, 200)
  ]);
  if (!valid) return;
  DB.addCourse({
    title: document.getElementById("ac-title").value.trim(),
    description: document.getElementById("ac-desc").value.trim(),
    providerId: document.getElementById("ac-provider").value,
    category: document.getElementById("ac-cat").value,
    lessons: parseInt(document.getElementById("ac-lessons").value),
    skillPoints: parseInt(document.getElementById("ac-pts").value),
    duration: document.getElementById("ac-dur").value.trim() || "1 hour",
    status: document.getElementById("ac-status").value
  });
  UI.closeModal(); UI.showToast("Course added!"); renderCourses(); renderStats();
}

function openEditCourseModal(id) {
  const c = DB.getCourseById(id);
  if (!c) return;
  UI.showModal(`
    <div class="modal-title">Edit Course</div>
    <div class="form-group"><label class="form-label">Title</label><input id="ec-title" class="form-input" value="${c.title}"></div>
    <div class="form-group"><label class="form-label">Description</label><textarea id="ec-desc" class="form-textarea">${c.description}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Lessons</label><input id="ec-lessons" type="number" class="form-input" value="${c.lessons}"></div>
      <div class="form-group"><label class="form-label">Skill Points</label><input id="ec-pts" type="number" class="form-input" value="${c.skillPoints}"></div>
    </div>
    <div class="form-group"><label class="form-label">Status</label>
      <select id="ec-status" class="form-select"><option value="draft" ${c.status==="draft"?"selected":""}>Draft</option><option value="published" ${c.status==="published"?"selected":""}>Published</option></select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveEditCourse('${id}')">Save</button>
    </div>`);
}

function saveEditCourse(id) {
  const updates = {
    title: document.getElementById("ec-title").value.trim(),
    description: document.getElementById("ec-desc").value.trim(),
    lessons: parseInt(document.getElementById("ec-lessons").value) || 0,
    skillPoints: parseInt(document.getElementById("ec-pts").value) || 0,
    status: document.getElementById("ec-status").value
  };
  if (!updates.title) { UI.showToast("Title required.", "error"); return; }
  DB.updateCourse(id, updates);
  UI.closeModal(); UI.showToast("Course updated!"); renderCourses();
}

function deleteCourse(id) {
  const c = DB.getCourseById(id);
  if (!confirm(`Delete course "${c?.title}"?`)) return;
  DB.deleteCourse(id); UI.showToast("Course deleted.", "info"); renderCourses(); renderStats();
}

// ---- ASSIGNMENTS ----
function renderAssignments() {
  const assignments = DB.getAssignments();
  document.getElementById("assignments-tbody").innerHTML = assignments.map(a => {
    const instr = DB.getUserById(a.instructorId);
    const diffColors = { Easy:"badge-green", Medium:"badge-orange", Hard:"badge-red" };
    return `<tr>
      <td><div style="font-weight:700;">${a.title}</div><div style="font-size:12px;color:var(--gray-500);">${a.description.substring(0,50)}...</div></td>
      <td style="font-size:13px;">${instr ? instr.firstName + " " + instr.lastName : "—"}</td>
      <td><span class="badge ${diffColors[a.difficulty]||'badge-gray'}">${a.difficulty}</span></td>
      <td style="font-size:13px;">${a.dueDate}</td>
      <td>${a.studentIds.length}</td>
      <td style="font-weight:700; color:var(--green);">${a.completedIds.length}</td>
      <td><span class="badge ${a.status==='active'?'badge-green':'badge-gray'}">${a.status}</span></td>
      <td><div style="display:flex;gap:8px;">
        <button class="btn-icon" onclick="openEditAssignmentModal('${a.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteAssignment('${a.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
      </div></td>
    </tr>`;
  }).join("") || `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--gray-500);">No assignments</td></tr>`;
}

function openAddAssignmentModal() {
  const instrs = DB.getInstructors();
  const learners = DB.getLearners();
  UI.showModal(`
    <div class="modal-title">Add Assignment</div>
    <div class="form-group"><label class="form-label">Title *</label><input id="aa-title" class="form-input" placeholder="Assignment title"></div>
    <div class="form-group"><label class="form-label">Description *</label><textarea id="aa-desc" class="form-textarea" placeholder="Assignment description"></textarea></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Instructor *</label>
        <select id="aa-instr" class="form-select"><option value="">Select instructor</option>${instrs.map(i=>`<option value="${i.id}">${i.firstName} ${i.lastName}</option>`).join("")}</select>
      </div>
      <div class="form-group"><label class="form-label">Difficulty *</label>
        <select id="aa-diff" class="form-select"><option value="">Select</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Due Date *</label><input id="aa-due" type="date" class="form-input"></div>
      <div class="form-group"><label class="form-label">Skill Points Reward</label><input id="aa-pts" type="number" class="form-input" value="25"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewAssignment()">Add Assignment</button>
    </div>`);
}

function saveNewAssignment() {
  const valid = FormValidator.validate([
    FormValidator.required("aa-title", "Assignment title"),
    FormValidator.required("aa-desc", "Description"),
    FormValidator.select("aa-instr", "an instructor"),
    FormValidator.select("aa-diff", "difficulty"),
    FormValidator.saneFutureDate("aa-due", "Due date", 365),
    FormValidator.positiveInt("aa-pts", "Skill points", 1, 100)
  ]);
  if (!valid) return;
  const instrId = document.getElementById("aa-instr").value;
  const instr = DB.getUserById(instrId);
  DB.addAssignment({
    title: document.getElementById("aa-title").value.trim(),
    description: document.getElementById("aa-desc").value.trim(),
    instructorId: instrId,
    dueDate: document.getElementById("aa-due").value,
    difficulty: document.getElementById("aa-diff").value,
    skillPoints: parseInt(document.getElementById("aa-pts").value),
    studentIds: instr?.studentIds || []
  });
  UI.closeModal(); UI.showToast("Assignment added!"); renderAssignments();
}

function openEditAssignmentModal(id) {
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
    <div class="form-row">
      <div class="form-group"><label class="form-label">Difficulty</label>
        <select id="ea-diff" class="form-select"><option value="Easy" ${a.difficulty==="Easy"?"selected":""}>Easy</option><option value="Medium" ${a.difficulty==="Medium"?"selected":""}>Medium</option><option value="Hard" ${a.difficulty==="Hard"?"selected":""}>Hard</option></select>
      </div>
      <div class="form-group"><label class="form-label">Status</label>
        <select id="ea-status" class="form-select"><option value="active" ${a.status==="active"?"selected":""}>Active</option><option value="completed" ${a.status==="completed"?"selected":""}>Completed</option></select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveEditAssignment('${id}')">Save</button>
    </div>`);
}

function saveEditAssignment(id) {
  const updates = {
    title: document.getElementById("ea-title").value.trim(),
    description: document.getElementById("ea-desc").value.trim(),
    dueDate: document.getElementById("ea-due").value,
    skillPoints: parseInt(document.getElementById("ea-pts").value) || 0,
    difficulty: document.getElementById("ea-diff").value,
    status: document.getElementById("ea-status").value
  };
  if (!updates.title) { UI.showToast("Title required.", "error"); return; }
  DB.updateAssignment(id, updates);
  UI.closeModal(); UI.showToast("Assignment updated!"); renderAssignments();
}

function deleteAssignment(id) {
  const a = DB.getAssignments().find(x => x.id === id);
  if (!confirm(`Delete assignment "${a?.title}"?`)) return;
  DB.deleteAssignment(id); UI.showToast("Deleted.", "info"); renderAssignments();
}

// ---- SESSIONS ----
function renderSessions() {
  const sessions = DB.getSessions();
  document.getElementById("sessions-tbody").innerHTML = sessions.map(s => {
    const instr = DB.getUserById(s.instructorId);
    return `<tr>
      <td style="font-weight:700;">${s.title}</td>
      <td style="font-size:13px;">${instr ? instr.firstName + " " + instr.lastName : "—"}</td>
      <td>${s.date}</td><td>${s.time}</td>
      <td>${s.duration} min</td>
      <td><span class="badge badge-blue">${s.type}</span></td>
      <td><span class="badge badge-green">${s.status}</span></td>
      <td><div style="display:flex;gap:8px;">
        <button class="btn-icon" onclick="openEditSessionModal('${s.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
        <button class="btn-icon danger" onclick="deleteSession('${s.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
      </div></td>
    </tr>`;
  }).join("") || `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--gray-500);">No sessions</td></tr>`;
}

function openAddSessionModal() {
  const instrs = DB.getInstructors();
  UI.showModal(`
    <div class="modal-title">Add Session</div>
    <div class="form-group"><label class="form-label">Title *</label><input id="as-title" class="form-input" placeholder="Session title"></div>
    <div class="form-group"><label class="form-label">Instructor *</label>
      <select id="as-instr" class="form-select"><option value="">Select instructor</option>${instrs.map(i=>`<option value="${i.id}">${i.firstName} ${i.lastName}</option>`).join("")}</select>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Date *</label><input id="as-date" type="date" class="form-input"></div>
      <div class="form-group"><label class="form-label">Time *</label><input id="as-time" type="time" class="form-input"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Duration (minutes) *</label><input id="as-dur" type="number" class="form-input" placeholder="60"></div>
      <div class="form-group"><label class="form-label">Type</label>
        <select id="as-type" class="form-select"><option>Trading Session</option><option>Review Session</option><option>Lecture</option><option>Workshop</option></select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewSession()">Add Session</button>
    </div>`);
}

function saveNewSession() {
  const valid = FormValidator.validate([
    FormValidator.required("as-title", "Session title"),
    FormValidator.select("as-instr", "an instructor"),
    FormValidator.saneFutureDate("as-date", "Session date", 365),
    FormValidator.positiveInt("as-dur", "Duration", 15, 480)
  ]);
  if (!valid) return;
  if (!document.getElementById("as-time").value) { UI.setFieldError("as-time", "Time is required."); return; }
  const instrId = document.getElementById("as-instr").value;
  const instr = DB.getUserById(instrId);
  DB.addSession({
    title: document.getElementById("as-title").value.trim(),
    instructorId: instrId,
    date: document.getElementById("as-date").value,
    time: document.getElementById("as-time").value,
    duration: parseInt(document.getElementById("as-dur").value),
    type: document.getElementById("as-type").value,
    studentIds: instr?.studentIds || []
  });
  UI.closeModal(); UI.showToast("Session scheduled!"); renderSessions();
}

function openEditSessionModal(id) {
  const s = DB.getSessions().find(x => x.id === id);
  if (!s) return;
  UI.showModal(`
    <div class="modal-title">Edit Session</div>
    <div class="form-group"><label class="form-label">Title</label><input id="es-title" class="form-input" value="${s.title}"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Date</label><input id="es-date" type="date" class="form-input" value="${s.date}"></div>
      <div class="form-group"><label class="form-label">Time</label><input id="es-time" type="time" class="form-input" value="${s.time}"></div>
    </div>
    <div class="form-group"><label class="form-label">Duration (minutes)</label><input id="es-dur" type="number" class="form-input" value="${s.duration}"></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveEditSession('${id}')">Save</button>
    </div>`);
}

function saveEditSession(id) {
  const updates = { title: document.getElementById("es-title").value.trim(), date: document.getElementById("es-date").value, time: document.getElementById("es-time").value, duration: parseInt(document.getElementById("es-dur").value) || 60 };
  if (!updates.title) { UI.showToast("Title required.", "error"); return; }
  DB.updateSession(id, updates); UI.closeModal(); UI.showToast("Session updated!"); renderSessions();
}

function deleteSession(id) {
  const s = DB.getSessions().find(x => x.id === id);
  if (!confirm(`Delete session "${s?.title}"?`)) return;
  DB.deleteSession(id); UI.showToast("Deleted.", "info"); renderSessions();
}

// ---- APPROVALS ----
function renderApprovals() {
  const pending = DB.getPendingApprovals().filter(r => r.status === "pending");
  const el = document.getElementById("approvals-list");
  if (!el) return;
  if (!pending.length) {
    el.innerHTML = emptyState("Done", "No pending approvals", "All account requests have been processed.");
    return;
  }
  const roleColors = { instructor:"badge-green", provider:"badge-orange", admin:"badge-purple" };
  el.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Requested</th><th>Info</th><th>Actions</th></tr></thead>
    <tbody>${pending.map(r => `<tr>
      <td style="font-weight:700;">${r.firstName} ${r.lastName}</td>
      <td style="font-size:13px;">${r.email}</td>
      <td><span class="badge ${roleColors[r.role]||'badge-gray'}">${r.role}</span></td>
      <td style="font-size:12px;color:var(--gray-400);">${r.requestedAt}</td>
      <td style="font-size:12px;color:var(--gray-500);">${r.institution||r.organization||''}</td>
      <td><div style="display:flex;gap:8px;">
        <button class="btn btn-green btn-sm" onclick="approveAccount('${r.id}')">Done Approve</button>
        <button class="btn btn-danger btn-sm" onclick="rejectAccount('${r.id}')">No Reject</button>
      </div></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function approveAccount(id) {
  const req = DB.approveAccount(id);
  if (!req) return;
  UI.showToast(`Done ${req.firstName} ${req.lastName}'s account approved! They can now log in.`);
  updateApprovalBadge();
  renderApprovals();
  renderStats();
}

function rejectAccount(id) {
  const req = DB.getPendingApprovals().find(r => r.id === id);
  if (!req) return;
  if (!confirm(`Reject account for ${req.firstName} ${req.lastName} (${req.email})?`)) return;
  DB.rejectAccount(id);
  UI.showToast(`Account rejected and removed.`, "info");
  updateApprovalBadge();
  renderApprovals();
}

function updateApprovalBadge() {
  const count = DB.getPendingApprovals().filter(r => r.status === "pending").length;
  const badge = document.getElementById("approval-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline" : "none";
  }
  updateSuperNotifBadge();
}

function updateSuperNotifBadge() {
  const user = Auth.getCurrentUser();
  if (!user) return;
  const count = DB.getUnreadCount(user.id);
  const el = document.getElementById("notif-count");
  if (el) el.textContent = count || 0;
}

// ---- CONFIG ----
function renderConfig() {
  const cfg = DB.getConfig();
  document.getElementById("cfg-maxlimit").value = cfg.maxTradingLimit;
  document.getElementById("cfg-maxpts").value = cfg.maxSkillPointsPerChallenge;
  document.getElementById("cfg-minmargin").value = cfg.minSkillPointsMarginTrading;
  document.getElementById("cfg-maxtrades").value = cfg.maxDailyTrades;
  document.getElementById("cfg-cooldown").value = cfg.tradeCooldownMinutes;

  const featureNames = { marginTrading: "Margin Trading", cryptoTrading: "Cryptocurrency Trading", forexTrading: "Forex Trading" };
  const featureDescs = { marginTrading: "Allow advanced users to trade on margin", cryptoTrading: "Enable crypto paper trading for students", forexTrading: "Allow currency pair trading" };
  document.getElementById("feature-toggles").innerHTML = Object.entries(cfg.features).map(([key, val]) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:10px;">
      <div><div style="font-weight:700;font-size:14px;">${featureNames[key]}</div><div style="font-size:12px;color:var(--gray-500);">${featureDescs[key]}</div></div>
      <label class="toggle"><input type="checkbox" ${val?"checked":""} onchange="toggleFeature('${key}', this.checked)"><span class="toggle-slider"></span></label>
    </div>`).join("");
  document.getElementById("feature-status").innerHTML = Object.entries(cfg.features).map(([key, val]) =>
    `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">${featureNames[key]}: <span style="font-weight:700;color:${val?"var(--green)":"var(--gray-500)"};">${val?"Enabled":"Disabled"}</span></div>`
  ).join("");
}

function toggleFeature(key, val) {
  const cfg = DB.getConfig();
  cfg.features[key] = val;
  DB.updateConfig(cfg);
  renderConfig();
}

function saveConfig() {
  const maxLimit = parseInt(document.getElementById("cfg-maxlimit").value);
  const maxPts = parseInt(document.getElementById("cfg-maxpts").value);
  const minMargin = parseInt(document.getElementById("cfg-minmargin").value);
  const maxTrades = parseInt(document.getElementById("cfg-maxtrades").value);
  const cooldown = parseInt(document.getElementById("cfg-cooldown").value);
  if (!maxLimit || !maxPts || !minMargin || !maxTrades || !cooldown) { UI.showToast("All fields are required.", "error"); return; }
  if (maxLimit < 1000) { UI.showToast("Max trading limit must be at least ₹1000.", "error"); return; }
  DB.updateConfig({ maxTradingLimit: maxLimit, maxSkillPointsPerChallenge: maxPts, minSkillPointsMarginTrading: minMargin, maxDailyTrades: maxTrades, tradeCooldownMinutes: cooldown });
  UI.showToast("Configuration saved!"); renderConfig();
}

// ---- NOTIFICATIONS ----
function openSuperNotifModal() {
  const user = Auth.getCurrentUser();
  if (!user) return;
  const notifs = DB.getNotifications(user.id);
  const icons = { approval:"Alert", assignment:"Tasks", session:"Date️", info:"ℹ️" };
  UI.showModal(`
    <div class="modal-title">Alert Super Admin Notifications</div>
    <div style="max-height:420px;overflow-y:auto;">
      ${notifs.length ? notifs.map(n => `
        <div style="padding:12px;border-bottom:1px solid var(--gray-100);display:flex;gap:10px;align-items:flex-start;background:${n.read?'':'var(--blue-light)'};">
          <span style="font-size:18px;flex-shrink:0;">${icons[n.type]||'Alert'}</span>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:${n.read?'400':'700'};">${n.message}</div>
            <div style="font-size:11px;color:var(--gray-400);margin-top:3px;">${n.createdAt}</div>
          </div>
          ${n.type==='approval'?`<button class="btn btn-primary btn-sm" onclick="UI.closeModal();showView('approvals',document.querySelector('[onclick*=approvals]'))">Review</button>`:''}
        </div>`).join('') : emptyState('Alert','No notifications')}
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="DB.markAllRead('${user.id}');updateSuperNotifBadge();UI.closeModal()">Mark All Read</button>
      <button class="btn btn-primary" onclick="UI.closeModal()">Close</button>
    </div>`);
  DB.markAllRead(user.id);
  updateSuperNotifBadge();
}

// ---- PROFILE ----
function openSuperProfileModal() {
  const user = Auth.getCurrentUser();
  if (!user) return;
  UI.showModal(`
    <div class="modal-title">My Profile</div>
    <div style="text-align:center;margin-bottom:20px;">
      <div style="width:64px;height:64px;background:var(--blue-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px;">Key</div>
      <div style="font-weight:800;font-size:1.1rem;">${user.firstName} ${user.lastName}</div>
      <div style="font-size:13px;color:var(--gray-500);">${user.email}</div>
      <span class="badge" style="background:var(--dark);color:#fff;margin-top:8px;display:inline-block;">Super User</span>
    </div>
    <div class="report-card">
      <div class="report-metric"><span>Total Users</span><span style="font-weight:700;">${DB.getUsers().length}</span></div>
      <div class="report-metric"><span>Total Courses</span><span style="font-weight:700;">${DB.getCourses().length}</span></div>
      <div class="report-metric"><span>Total Assignments</span><span style="font-weight:700;">${DB.getAssignments().length}</span></div>
      <div class="report-metric"><span>Total Trades</span><span style="font-weight:700;">${IndAIData.trades.length}</span></div>
      <div class="report-metric"><span>Member Since</span><span style="font-weight:700;">${user.createdAt||'N/A'}</span></div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="UI.closeModal()">Close</button></div>`);
}

// ---- Init ----
renderStats(); renderUsers(); updateApprovalBadge(); updateSuperNotifBadge();
