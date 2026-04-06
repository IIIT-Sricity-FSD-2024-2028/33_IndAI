// ============================================================
// IndAI Platform – Auth, DB Layer, Validation & UI Helpers
// Depends on: mockData.js (loads first)
// ============================================================

// ---- Auth ----
const Auth = {
  login(email, password, role) {
    const user = IndAIData.users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password &&
      u.role === role
    );
    if (!user) return { success: false, message: "Invalid credentials or role mismatch." };
    if (user.status === "suspended")
      return { success: false, message: "Account suspended. Contact an administrator." };
    if (user.status === "pending")
      return { success: false, message: "Your account is pending Super Admin approval. You will be notified once approved." };
    const session = { userId: user.id, role: user.role, name: `${user.firstName} ${user.lastName}` };
    (window.LocalStore ? LocalStore.write("indai_session", session) : localStorage.setItem("indai_session", JSON.stringify(session)));
    return { success: true, user, session };
  },

  logout() {
    window.LocalStore ? LocalStore.remove("indai_session") : localStorage.removeItem("indai_session");
    const inPages = window.location.pathname.includes("/pages/");
    window.location.href = inPages ? "login.html" : "pages/login.html";
  },

  getSession() {
    return window.LocalStore ? LocalStore.read("indai_session", null) : (function(){ try { return JSON.parse(localStorage.getItem("indai_session")); } catch { return null; } })();
  },

  getCurrentUser() {
    const s = this.getSession();
    return s ? (IndAIData.users.find(u => u.id === s.userId) || null) : null;
  },

  requireAuth(allowedRoles) {
    const s = this.getSession();
    const inPages = window.location.pathname.includes("/pages/");
    const redirect = inPages ? "login.html" : "pages/login.html";
    if (!s) { window.location.href = redirect; return null; }
    if (allowedRoles && !allowedRoles.includes(s.role)) { window.location.href = redirect; return null; }
    return s;
  }
};

// ---- Generic CRUD Factory ----
function makeCRUD(collection, prefix, defaults = {}) {
  return {
    getAll()    { return IndAIData[collection]; },
    getById(id) { return IndAIData[collection].find(item => item.id === id); },
    add(data) {
      const record = { id: genId(prefix), ...defaults, ...data, createdAt: todayISO() };
      IndAIData[collection].push(record);
      persistData();
      return record;
    },
    update(id, updates) {
      const idx = IndAIData[collection].findIndex(item => item.id === id);
      if (idx === -1) return false;
      IndAIData[collection][idx] = { ...IndAIData[collection][idx], ...updates };
      persistData();
      return IndAIData[collection][idx];
    },
    delete(id) {
      const idx = IndAIData[collection].findIndex(item => item.id === id);
      if (idx === -1) return false;
      IndAIData[collection].splice(idx, 1);
      persistData();
      return true;
    }
  };
}

// ---- DB Layer ----
const DB = {
  // Users
  getUsers()           { return IndAIData.users; },
  getUserById(id)      { return IndAIData.users.find(u => u.id === id); },
  getUsersByRole(role) { return IndAIData.users.filter(u => u.role === role); },
  getLearners()        { return this.getUsersByRole("learner"); },
  getInstructors()     { return this.getUsersByRole("instructor"); },
  getProviders()       { return this.getUsersByRole("provider"); },

  addUser(data) {
    if ((data.firstName && !Validate.name(data.firstName)) || (data.lastName && !Validate.name(data.lastName)))
      return { error: "Names must be at least 3 characters and contain only alphabets and spaces." };
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (!Number.isFinite(dob.getTime()) || age < 10) return { error: "Learner must be at least 10 years old." };
    }
    if (IndAIData.users.find(u => u.email.toLowerCase() === (data.email || "").toLowerCase()))
      return { error: "Email already registered." };
    if (data.role === "learner") {
      const institution = String(data.institution || "").trim().toLowerCase();
      const studentId = String(data.studentId || "").trim().toLowerCase();
      const grade = String(data.grade || "").trim();
            if (institution && institution.length < 3) return { error: "Institution name must be at least 3 characters." };
      if (studentId && studentId.length < 3) return { error: "Student ID must be at least 3 characters." };
      if (grade && grade.length < 3) return { error: "Grade / Level must be at least 3 characters." };
      if (data.major && String(data.major).trim().length < 3) return { error: "Course / Major must be at least 3 characters when provided." };
      if (institution && /^[0-9]/.test(institution)) return { error: "Institution name cannot start with a number." };
      if (institution && studentId && IndAIData.users.some(u => u.role === "learner" && String(u.institution || "").trim().toLowerCase() === institution && String(u.studentId || "").trim().toLowerCase() === studentId)) {
        return { error: "Student ID already exists for this institution." };
      }
    }
    if (data.role === "instructor") {
      if (!String(data.yearsExp || '').trim()) return { error: "Years of experience is required for instructors." };
      if (!String(data.institution || '').trim()) return { error: "Institution / Organization is required for instructors." };
      if (!String(data.expertise || '').trim()) return { error: "Expertise / Specialization is required for instructors." };
      if (String(data.institution || '').trim().length < 3) return { error: "Institution / Organization must be at least 3 characters." };
      if (String(data.expertise || '').trim().length < 3) return { error: "Expertise / Specialization must be at least 3 characters." };
    }
    if (data.role === "provider" && !String(data.organization || '').trim()) {
      return { error: "Organization name is required for course providers." };
    }
    if (data.role === "admin") {
      if (!String(data.institution || '').trim()) return { error: "Institution is required for admins." };
      if (!String(data.accessLevel || '').trim()) return { error: "Admin access level is required." };
    }
    if ((data.role === "instructor" || data.role === "admin") && data.institution) {
      const institutionName = String(data.institution).trim();
      if (institutionName.length < 3) return { error: "Institution name must be at least 3 characters." };
      if (/^[0-9]/.test(institutionName)) return { error: "Institution name cannot start with a number." };
    }
    if (data.role === "provider" && data.organization) {
      const orgName = String(data.organization).trim();
      if (orgName.length < 3) return { error: "Organization name must be at least 3 characters." };
      if (/^[0-9]/.test(orgName)) return { error: "Organization cannot start with a number." };
    }
    if (data.role === "provider" && data.website && !Validate.url(data.website))
      return { error: "Website / LinkedIn must be a valid URL starting with http:// or https://." };
    const defaults = { skillPoints: 0, portfolioValue: 100000, tradingLimit: 100000, virtualBalance: 100000, status: "active" };
    const user = { id: genId("u"), ...defaults, ...data, createdAt: todayISO() };
    IndAIData.users.push(user);

    if (user.role === "learner") {
      this.seedNewLearnerExperience(user.id, user.instructorId || null);
      this.notifyRoleUsers(["admin", "superuser"], `New learner account created: ${user.firstName} ${user.lastName} (${user.email})`, "student");
      this.addNotification(user.id, "Welcome to IndAI! Introductory courses and starter assignments are ready on your dashboard.", "info");
      if (user.instructorId) {
        const actorMap = { superuser: "Super Admin", admin: "Admin", instructor: "Instructor" };
        const actorName = actorMap[Auth.getCurrentUser()?.role] || "System";
        this.assignLearnerToInstructor(user.id, user.instructorId, actorName);
      }
    }

    persistData();
    return user;
  },

  updateUser(id, updates) {
    const idx = IndAIData.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    IndAIData.users[idx] = { ...IndAIData.users[idx], ...updates };
    persistData();
    return IndAIData.users[idx];
  },

  deleteUser(id) {
    const idx = IndAIData.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    IndAIData.users.splice(idx, 1);
    persistData();
    return true;
  },

  // Courses
  _courses: makeCRUD("courses", "c", { enrolledCount: 0, completedCount: 0, rating: 0 }),
  getCourses()            { return IndAIData.courses; },
  getCourseById(id)       { return IndAIData.courses.find(c => c.id === id); },
  getProviderCourses(pid) { return IndAIData.courses.filter(c => c.providerId === pid); },
  addCourse(data)         { return this._courses.add(data); },
  updateCourse(id, u)     { return this._courses.update(id, u); },
  deleteCourse(id)        { return this._courses.delete(id); },

  getCourseModules(courseId) {
    return (IndAIData.courseModules || []).filter(m => m.courseId === courseId).sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  getLearnerCourseProgress(learnerId, courseId) {
    let record = (IndAIData.courseProgress || []).find(cp => cp.learnerId === learnerId && cp.courseId === courseId);
    if (!record) {
      record = { learnerId, courseId, completedModuleIds: [] };
      IndAIData.courseProgress = IndAIData.courseProgress || [];
      IndAIData.courseProgress.push(record);
      persistData();
    }
    return record;
  },
  isCourseModuleComplete(learnerId, courseId, moduleId) {
    return this.getLearnerCourseProgress(learnerId, courseId).completedModuleIds.includes(moduleId);
  },
  markCourseModuleComplete(learnerId, courseId, moduleId) {
    const record = this.getLearnerCourseProgress(learnerId, courseId);
    if (!record.completedModuleIds.includes(moduleId)) {
      record.completedModuleIds.push(moduleId);
    }
    const modules = this.getCourseModules(courseId);
    const total = modules.length || 1;
    const completed = record.completedModuleIds.filter(id => modules.some(m => m.id === id)).length;
    const progress = Math.round((completed / total) * 100);
    const status = completed >= total ? 'completed' : 'in_progress';
    this.updateEnrollment(learnerId, courseId, { progress, status });
    persistData();
    return { progress, status, completed, total };
  },
  getNextIncompleteCourseModule(learnerId, courseId) {
    const record = this.getLearnerCourseProgress(learnerId, courseId);
    return this.getCourseModules(courseId).find(m => !record.completedModuleIds.includes(m.id)) || null;
  },

  // Assignments
  _assignments: makeCRUD("assignments", "a", { completedIds: [], status: "active" }),
  getAssignments()              { return IndAIData.assignments; },
  getAssignmentById(id)         { return IndAIData.assignments.find(a => a.id === id); },
  getInstructorAssignments(iid) { return IndAIData.assignments.filter(a => a.instructorId === iid); },
  getLearnerAssignments(lid)    { return IndAIData.assignments.filter(a => (a.studentIds||[]).includes(lid)); },
  addAssignment(data)           { return this._assignments.add(data); },
  updateAssignment(id, u)       { return this._assignments.update(id, u); },
  deleteAssignment(id)          { return this._assignments.delete(id); },

  // Sessions
  _sessions: makeCRUD("sessions", "s", { status: "scheduled" }),
  getSessions()              { return IndAIData.sessions; },
  getInstructorSessions(iid) { return IndAIData.sessions.filter(s => s.instructorId === iid); },
  getLearnerSessions(lid)    { return IndAIData.sessions.filter(s => (s.studentIds||[]).includes(lid)); },
  addSession(data)           { return this._sessions.add(data); },
  updateSession(id, u)       { return this._sessions.update(id, u); },
  deleteSession(id)          { return this._sessions.delete(id); },

  // Trades
  getTrades()           { return IndAIData.trades; },
  getLearnerTrades(lid) { return IndAIData.trades.filter(t => t.learnerId === lid); },

  executeTrade(learnerId, symbol, type, qty, price) {
    const user = this.getUserById(learnerId);
    if (!user) return { success: false, message: "User not found." };
    const cfg   = this.getConfig();
    qty = Number(qty);
    price = Number(price);
    const snapshotBefore = this.refreshTradingState(learnerId);
    const total = qty * price;
    if (!['BUY','SELL'].includes(type)) return { success: false, message: 'Invalid trade type.' };
    if (!Number.isInteger(qty) || qty <= 0) return { success: false, message: 'Quantity must be a positive whole number.' };
    if (!(price > 0)) return { success: false, message: 'Invalid stock price.' };

    if (!user.virtualBalance || user.virtualBalance <= 0) {
      this.updateUser(learnerId, { virtualBalance: 100000, portfolioValue: 100000, tradingLimit: 150000 });
      user.virtualBalance = 100000;
    }

    if (type === "BUY" && (snapshotBefore?.balance ?? user.virtualBalance) < total)
      return { success: false, message: `Insufficient balance. Available: ${fmtINR(user.virtualBalance)}.` };
    if (type === "BUY" && total > (user.tradingLimit || 100000))
      return { success: false, message: `Exceeds trading limit of ${fmtINR(user.tradingLimit || 100000)}.` };

    const todayCount = IndAIData.trades.filter(t => t.learnerId === learnerId && t.date === todayISO()).length;
    if (todayCount >= cfg.maxDailyTrades)
      return { success: false, message: `Daily limit of ${cfg.maxDailyTrades} trades reached.` };

    if (type === "SELL") {
      const held = (this.getHoldings(learnerId)[symbol] || {}).qty || 0;
      if (held < qty) return { success: false, message: `You only hold ${held} shares of ${symbol}.` };
    }

    const trade = {
      id: genId("t"), learnerId, symbol, type,
      qty: Number(qty), price: Number(price),
      total: Number(total.toFixed(2)),
      date: todayISO(), status: "executed"
    };
    IndAIData.trades.push(trade);
    const snapshot = this.refreshTradingState(learnerId);
    return { success: true, trade, portfolioValue: snapshot?.portfolioValue || 0, balance: snapshot?.balance || 0 };
  },

  refreshTradingState(learnerId) {
    const user = this.getUserById(learnerId);
    if (!user) return null;
    const openingBalance = Number(user.startingBalance || 100000);
    const trades = this.getLearnerTrades(learnerId);
    const buyTotal = trades.filter(t => t.type === "BUY").reduce((s,t)=>s+Number(t.total||0),0);
    const sellTotal = trades.filter(t => t.type === "SELL").reduce((s,t)=>s+Number(t.total||0),0);
    const holdings = this.getHoldings(learnerId);
    let marketVal = 0;
    Object.entries(holdings).forEach(([sym,h]) => {
      if (h.qty > 0) {
        const stock = this.getStockBySymbol(sym);
        marketVal += (stock ? stock.price : 0) * h.qty;
      }
    });
    user.virtualBalance = Math.max(0, Number((openingBalance - buyTotal + sellTotal).toFixed(2)));
    user.portfolioValue = Math.round(user.virtualBalance + marketVal);
    persistData();
    return { balance: user.virtualBalance, portfolioValue: user.portfolioValue, holdings };
  },

  getHoldings(learnerId) {
    const holdings = {};
    this.getLearnerTrades(learnerId).forEach(t => {
      if (!holdings[t.symbol]) holdings[t.symbol] = { qty: 0, spent: 0 };
      const row = holdings[t.symbol];
      if (t.type === 'BUY') {
        row.qty += t.qty;
        row.spent += t.total;
      } else if (t.type === 'SELL' && row.qty > 0) {
        const avgCost = row.spent / row.qty;
        row.qty = Math.max(0, row.qty - t.qty);
        row.spent = Math.max(0, row.spent - (avgCost * t.qty));
      }
    });
    return holdings;
  },

  _calcPortfolioValue(learnerId) {
    const user = this.getUserById(learnerId);
    const holdings = this.getHoldings(learnerId);
    let marketVal = 0;
    Object.entries(holdings).forEach(([sym, h]) => {
      if (h.qty > 0) {
        const stock = this.getStockBySymbol(sym);
        marketVal += (stock ? stock.price : 0) * h.qty;
      }
    });
    return Math.round((user.virtualBalance || 0) + marketVal);
  },

  // Quizzes
  _quizzes: makeCRUD("quizzes", "q", { attempts: 0, avgScore: 0 }),
  getQuizzes()            { return IndAIData.quizzes; },
  getProviderQuizzes(pid) { return IndAIData.quizzes.filter(q => q.providerId === pid); },
  addQuiz(data)           { return this._quizzes.add(data); },
  updateQuiz(id, u)       { return this._quizzes.update(id, u); },
  deleteQuiz(id)          { return this._quizzes.delete(id); },
  recordQuizAttempt(quizId, score) {
    const q = IndAIData.quizzes.find(x => x.id === quizId);
    if (!q) return;
    const newAttempts = q.attempts + 1;
    this.updateQuiz(quizId, {
      attempts: newAttempts,
      avgScore: Math.round(((q.avgScore * q.attempts) + score) / newAttempts)
    });
  },

  // Notifications
  getNotifications(uid)   { return IndAIData.notifications.filter(n => n.userId === uid); },
  getUnreadCount(uid)     { return IndAIData.notifications.filter(n => n.userId === uid && !n.read).length; },
  addNotification(uid, message, type = "info") {
    const n = { id: genId("n"), userId: uid, message, type, read: false, createdAt: todayISO() };
    IndAIData.notifications.push(n);
    persistData();
    return n;
  },
  markRead(id) {
    const n = IndAIData.notifications.find(x => x.id === id);
    if (n) { n.read = true; persistData(); }
  },
  markAllRead(uid) {
    IndAIData.notifications.filter(n => n.userId === uid && !n.read).forEach(n => { n.read = true; });
    persistData();
  },
  notifyRoleUsers(roles, message, type = "info") {
    const roleList = Array.isArray(roles) ? roles : [roles];
    IndAIData.users.filter(u => roleList.includes(u.role)).forEach(u => this.addNotification(u.id, message, type));
  },

  getCompletionApprovalsForInstructor(instructorId) {
    return (IndAIData.completionApprovals || []).filter(a => a.instructorId === instructorId && a.status === 'pending');
  },
  hasPendingCompletionApproval(instructorId, learnerId, type, refId) {
    return (IndAIData.completionApprovals || []).some(a => a.instructorId === instructorId && a.learnerId === learnerId && a.type === type && a.refId === refId && a.status === 'pending');
  },
  requestCompletionApproval({ type, learnerId, instructorId, refId }) {
    if (!instructorId || !learnerId || !refId) return null;
    IndAIData.completionApprovals = IndAIData.completionApprovals || [];
    const existing = (IndAIData.completionApprovals || []).find(a => a.instructorId === instructorId && a.learnerId === learnerId && a.type === type && a.refId === refId && a.status === 'pending');
    if (existing) return existing;
    const learner = this.getUserById(learnerId);
    const label = type === 'course' ? this.getCourseById(refId)?.title : this.getAssignmentById(refId)?.title;
    const approval = { id: genId('apr'), type, learnerId, instructorId, refId, status: 'pending', createdAt: todayISO() };
    IndAIData.completionApprovals.push(approval);
    this.addNotification(instructorId, `${learner?.firstName || 'A learner'} ${learner?.lastName || ''} submitted ${type === 'course' ? 'course' : 'challenge'} "${label || 'Untitled'}" for approval.`, type === 'course' ? 'course' : 'assignment');
    persistData();
    return approval;
  },
  approveCompletionApproval(approvalId, actorName = 'Instructor') {
    const approval = (IndAIData.completionApprovals || []).find(a => a.id === approvalId && a.status === 'pending');
    if (!approval) return { success: false, message: 'Approval request not found.' };
    const learner = this.getUserById(approval.learnerId);
    if (!learner) return { success: false, message: 'Learner not found.' };
    approval.status = 'approved';
    approval.reviewedAt = todayISO();
    approval.reviewedBy = actorName;
    if (approval.type === 'course') {
      const course = this.getCourseById(approval.refId);
      const enrollment = (IndAIData.enrollments || []).find(e => e.learnerId === approval.learnerId && e.courseId === approval.refId);
      if (!course || !enrollment) return { success: false, message: 'Course enrollment not found.' };
      enrollment.status = 'completed';
      enrollment.progress = 100;
      if (!enrollment.rewardGrantedAt) {
        learner.skillPoints = (learner.skillPoints || 0) + (course.skillPoints || 0);
        enrollment.rewardGrantedAt = todayISO();
        course.completedCount = (course.completedCount || 0) + 1;
      }
      this.addNotification(learner.id, `${actorName} approved your completion of "${course.title}". +${course.skillPoints || 0} skill points awarded.`, 'achievement');
      persistData();
      return { success: true, message: 'Course completion approved.', learnerId: learner.id };
    }
    const assignment = this.getAssignmentById(approval.refId);
    if (!assignment) return { success: false, message: 'Assignment not found.' };
    assignment.pendingCompletedIds = (assignment.pendingCompletedIds || []).filter(id => id !== learner.id);
    assignment.completedIds = [...new Set([...(assignment.completedIds || []), learner.id])];
    if (!approval.rewardGrantedAt) {
      learner.skillPoints = (learner.skillPoints || 0) + (assignment.skillPoints || 0);
      approval.rewardGrantedAt = todayISO();
    }
    this.addNotification(learner.id, `${actorName} approved your completion of challenge "${assignment.title}". +${assignment.skillPoints || 0} skill points awarded.`, 'achievement');
    persistData();
    return { success: true, message: 'Challenge completion approved.', learnerId: learner.id };
  },
  addVideoMaterial({ providerId, courseId, afterModuleId = '', title, description, duration, sizeMB, sourceName }) {
    const course = this.getCourseById(courseId);
    if (!course) return { success: false, message: 'Course not found.' };
    IndAIData.videoLibrary = IndAIData.videoLibrary || [];
    IndAIData.courseModules = IndAIData.courseModules || [];
    const sameCourseModules = (IndAIData.courseModules || []).filter(m => m.courseId === courseId).sort((a, b) => (a.order || 0) - (b.order || 0));
    let insertOrder = sameCourseModules.length + 1;
    if (afterModuleId) {
      const anchorModule = sameCourseModules.find(m => m.id === afterModuleId);
      if (anchorModule) insertOrder = (anchorModule.order || 0) + 1;
    }
    sameCourseModules.filter(m => (m.order || 0) >= insertOrder).forEach(m => { m.order = (m.order || 0) + 1; });
    const videoId = genId('v');
    const moduleId = genId('m');
    const moduleTitle = title || 'New Video Lesson';
    const moduleDescription = description || 'New learning material uploaded by the course provider.';
    IndAIData.videoLibrary.unshift({
      id: videoId,
      providerId,
      courseId,
      moduleId,
      title: moduleTitle,
      description: moduleDescription,
      status: 'draft',
      views: 0,
      sizeMB: Number(sizeMB || 0),
      duration,
      uploadedAt: todayISO(),
      sourceName
    });
    IndAIData.courseModules.push({
      id: moduleId,
      courseId,
      type: 'video',
      title: moduleTitle,
      duration,
      description: moduleDescription,
      order: insertOrder,
      sourceName,
      videoId,
      uploadedAt: todayISO()
    });
    (IndAIData.enrollments || []).filter(e => e.courseId === courseId && !['completed', 'pending_approval'].includes(e.status)).forEach(e => {
      const cp = this.getLearnerCourseProgress(e.learnerId, courseId);
      const total = this.getCourseModules(courseId).length || 1;
      const completed = (cp.completedModuleIds || []).filter(id => this.getCourseModules(courseId).some(m => m.id === id)).length;
      e.progress = Math.round((completed / total) * 100);
      e.status = completed >= total ? 'completed' : 'in_progress';
    });
    (IndAIData.enrollments || []).filter(e => e.courseId === courseId).forEach(e => {
      this.addNotification(e.learnerId, `New course material uploaded in ${course.title}: ${moduleTitle}`, 'course');
    });
    this.notifyRoleUsers('superuser', `New video material uploaded to ${course.title}: ${moduleTitle}`, 'info');
    persistData();
    return { success: true, videoId, moduleId };
  },
  ensureEnrollment(learnerId, courseId, status = "in_progress") {
    let enrollment = IndAIData.enrollments.find(e => e.learnerId === learnerId && e.courseId === courseId);
    if (!enrollment) {
      enrollment = { id: genId("e"), learnerId, courseId, progress: 0, status, enrolledAt: todayISO() };
      IndAIData.enrollments.push(enrollment);
      const course = this.getCourseById(courseId);
      if (course) course.enrolledCount = (course.enrolledCount || 0) + 1;
    }
    this.getLearnerCourseProgress(learnerId, courseId);
    return enrollment;
  },
  enrollLearnerInCourse(learnerId, courseId, actorName = "Instructor") {
    const learner = this.getUserById(learnerId);
    const course = this.getCourseById(courseId);
    if (!learner || !course) return { success: false, message: "Learner or course not found." };
    const existed = IndAIData.enrollments.some(e => e.learnerId === learnerId && e.courseId === courseId);
    const enrollment = this.ensureEnrollment(learnerId, courseId);
    if (!existed) {
      this.addNotification(learnerId, `${actorName} enrolled you in course: ${course.title}`, "course");
      persistData();
      return { success: true, enrollment, added: true };
    }
    return { success: true, enrollment, added: false };
  },
  ensureIntroAssignmentForLearner(learnerId, instructorId = null) {
    const existing = IndAIData.assignments.find(a => a.isSystemIntro && (a.studentIds || []).includes(learnerId));
    if (existing) return existing;
    const assignment = {
      id: genId("a"),
      title: "IndAI Orientation Challenge",
      description: "Complete your introductory learning path, explore the paper trading dashboard, and review one sample trade.",
      instructorId: instructorId || "",
      dueDate: todayISO(),
      difficulty: "Easy",
      skillPoints: 20,
      status: "active",
      studentIds: [learnerId],
      completedIds: [],
      isSystemIntro: true,
      createdAt: todayISO()
    };
    IndAIData.assignments.push(assignment);
    return assignment;
  },
  seedNewLearnerExperience(learnerId, instructorId = null) {
    ["c1", "c3"].forEach(courseId => {
      if (this.getCourseById(courseId)) this.ensureEnrollment(learnerId, courseId);
    });
    const assignment = this.ensureIntroAssignmentForLearner(learnerId, instructorId);
    persistData();
    return assignment;
  },
  assignLearnerToInstructor(learnerId, instructorId, actorName = "Admin") {
    const learner = this.getUserById(learnerId);
    const instructor = this.getUserById(instructorId);
    if (!learner || !instructor) return false;
    const prevInstructorId = learner.instructorId || null;
    if (prevInstructorId && prevInstructorId !== instructorId) {
      const prevInstructor = this.getUserById(prevInstructorId);
      if (prevInstructor) {
        prevInstructor.studentIds = (prevInstructor.studentIds || []).filter(id => id !== learnerId);
      }
    }
    instructor.studentIds = [...new Set([...(instructor.studentIds || []), learnerId])];
    learner.instructorId = instructorId;
    IndAIData.assignments.filter(a => a.isSystemIntro && (a.studentIds || []).includes(learnerId)).forEach(a => { a.instructorId = instructorId; });
    this.addNotification(instructorId, `${actorName} assigned learner ${learner.firstName} ${learner.lastName} to you.`, "student");
    this.addNotification(learnerId, `${actorName} assigned instructor ${instructor.firstName} ${instructor.lastName} to you.`, "student");
    persistData();
    return true;
  },

  // Config
  getConfig()     { return IndAIData.config; },
  updateConfig(u) { Object.assign(IndAIData.config, u); persistData(); return IndAIData.config; },

  // Enrollments
  getEnrollments()           { return IndAIData.enrollments; },
  getLearnerEnrollments(lid) { return IndAIData.enrollments.filter(e => e.learnerId === lid); },
  updateEnrollment(learnerId, courseId, updates) {
    const e = IndAIData.enrollments.find(e => e.learnerId === learnerId && e.courseId === courseId);
    if (e) { Object.assign(e, updates); persistData(); }
  },

  // Stocks
  getStocks()            { return IndAIData.stocks; },
  getStockBySymbol(sym)  { return IndAIData.stocks.find(s => s.symbol === sym); },
  searchStocks(q) {
    const lq = q.toLowerCase();
    return IndAIData.stocks.filter(s =>
      s.symbol.toLowerCase().includes(lq) || s.name.toLowerCase().includes(lq)
    );
  },

  // Watchlists
  getWatchlists(lid) {
    let lists = IndAIData.watchlists.filter(w => (w.userId || w.learnerId) === lid);
    if (!lists.length) {
      const wl = { id: genId("wl"), userId: lid, learnerId: lid, name: "My Watchlist", active: true, symbols: [] };
      IndAIData.watchlists.push(wl);
      persistData();
      lists = [wl];
    }
    lists.forEach((w, idx) => {
      w.userId = w.userId || w.learnerId || lid;
      w.learnerId = w.learnerId || w.userId || lid;
      w.name = w.name || (idx === 0 ? 'My Watchlist' : `Watchlist ${idx+1}`);
      if (typeof w.active !== 'boolean') w.active = idx === 0;
      w.symbols = [...new Set(w.symbols || [])];
    });
    if (!lists.some(w => w.active) && lists[0]) lists[0].active = true;
    persistData();
    return lists;
  },
  getActiveWatchlist(lid) {
    const lists = this.getWatchlists(lid);
    return lists.find(w => w.active) || lists[0];
  },
  setActiveWatchlist(lid, watchlistId) {
    const lists = this.getWatchlists(lid);
    lists.forEach(w => { w.active = w.id === watchlistId; });
    persistData();
    return this.getActiveWatchlist(lid);
  },
  createWatchlist(lid, name) {
    const lists = this.getWatchlists(lid);
    const wl = { id: genId('wl'), userId: lid, learnerId: lid, name: (name || `Watchlist ${lists.length + 1}`).trim(), active: true, symbols: [] };
    lists.forEach(w => { w.active = false; });
    IndAIData.watchlists.push(wl);
    persistData();
    return wl;
  },
  deleteWatchlist(lid, watchlistId) {
    let lists = this.getWatchlists(lid);
    if (lists.length <= 1) {
      lists[0].symbols = [];
      lists[0].name = 'My Watchlist';
      lists[0].active = true;
      persistData();
      return lists[0];
    }
    const idx = IndAIData.watchlists.findIndex(w => (w.userId || w.learnerId) === lid && w.id === watchlistId);
    if (idx === -1) return null;
    const wasActive = IndAIData.watchlists[idx].active;
    IndAIData.watchlists.splice(idx,1);
    lists = this.getWatchlists(lid);
    if (wasActive && lists[0]) lists.forEach((w,i)=>w.active = i===0);
    persistData();
    return this.getActiveWatchlist(lid);
  },
  renameWatchlist(lid, watchlistId, name) {
    const wl = this.getWatchlists(lid).find(w => w.id === watchlistId);
    if (!wl) return null;
    wl.name = String(name || '').trim() || wl.name;
    persistData();
    return wl;
  },
  getWatchlist(lid) {
    const wl = this.getActiveWatchlist(lid);
    return wl ? wl.symbols : [];
  },
  addToWatchlist(lid, symbol, watchlistId = null) {
    const wl = watchlistId ? this.getWatchlists(lid).find(w => w.id === watchlistId) : this.getActiveWatchlist(lid);
    if (!wl) return false;
    if (wl.symbols.includes(symbol)) return false;
    wl.symbols.push(symbol); persistData(); return true;
  },
  removeFromWatchlist(lid, symbol, watchlistId = null) {
    const wl = watchlistId ? this.getWatchlists(lid).find(w => w.id === watchlistId) : this.getActiveWatchlist(lid);
    if (wl) { wl.symbols = wl.symbols.filter(s => s !== symbol); persistData(); }
  },

  // Pending Approvals (instructor/provider/admin require super-admin approval)
  getPendingApprovals()    { return IndAIData.pendingApprovals || []; },
  addPendingApproval(data) {
    if (!IndAIData.pendingApprovals) IndAIData.pendingApprovals = [];
    const req = { id: genId("pa"), ...data, requestedAt: todayISO(), status: "pending" };
    IndAIData.pendingApprovals.push(req);
    // Notify all superusers
    IndAIData.users.filter(u => u.role === "superuser").forEach(su => {
      this.addNotification(su.id,
        `🔔 New ${data.role} account request: ${data.firstName} ${data.lastName} (${data.email})`,
        "approval"
      );
    });
    persistData();
    return req;
  },
  approveAccount(approvalId) {
    if (!IndAIData.pendingApprovals) return false;
    const req = IndAIData.pendingApprovals.find(r => r.id === approvalId);
    if (!req) return false;
    req.status = "approved";
    // Activate the user account
    const user = IndAIData.users.find(u => u.email.toLowerCase() === req.email.toLowerCase());
    if (user) { user.status = "active"; }
    persistData();
    return req;
  },
  rejectAccount(approvalId) {
    if (!IndAIData.pendingApprovals) return false;
    const req = IndAIData.pendingApprovals.find(r => r.id === approvalId);
    if (!req) return false;
    req.status = "rejected";
    // Remove from users list
    const idx = IndAIData.users.findIndex(u => u.email.toLowerCase() === req.email.toLowerCase());
    if (idx !== -1) IndAIData.users.splice(idx, 1);
    persistData();
    return req;
  },

  // Performance Report
  generateReport(learnerId) {
    const user = this.getUserById(learnerId);
    if (!user) return null;
    const trades      = this.getLearnerTrades(learnerId);
    const assignments = this.getLearnerAssignments(learnerId);
    const ret         = ((user.portfolioValue - 100000) / 100000 * 100).toFixed(2);
    const topTrade    = [...trades].sort((a, b) => b.total - a.total)[0];
    return {
      studentName:           `${user.firstName} ${user.lastName}`,
      portfolioValue:         user.portfolioValue,
      virtualBalance:         user.virtualBalance,
      totalReturn:            ret,
      totalTrades:            trades.length,
      buyOrders:              trades.filter(t => t.type === "BUY").length,
      sellOrders:             trades.filter(t => t.type === "SELL").length,
      skillPoints:            user.skillPoints || 0,
      topTrade:               topTrade ? `${topTrade.type} ${topTrade.symbol} – ${fmtINR(topTrade.total)}` : "None",
      totalAssignments:       assignments.length,
      completedAssignments:   assignments.filter(a => a.completedIds.includes(learnerId)).length
    };
  }
};

// ---- Validation ----
const Validate = {
  email(v)               { return window.Validation ? Validation.isValidEmail(v) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
  phone(v)               { return window.Validation ? Validation.isValidPhone(v) : /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')); },
  name(v)                { const s = String(v || '').trim(); return window.Validation ? Validation.isValidName(s) : (s.length >= 3 && /^[A-Za-z ]+$/.test(s)); },
  required(v)            { return v !== null && v !== undefined && String(v).trim() !== ""; },
  positiveInt(v, min=1, max=Infinity) { const n=Number(v); return !isNaN(n)&&Number.isInteger(n)&&n>=min&&n<=max; },
  positiveNum(v)         { return !isNaN(v) && Number(v) > 0; },
  minLength(v, n)        { return String(v).trim().length >= n; },
  url(v)                 { return window.Validation ? Validation.isValidUrl(v) : /^https?:\/\//i.test(String(v || '').trim()); },
  futureDate(v)          { return v && new Date(v) > new Date(); },
  emailAvailable(email)  { return !IndAIData.users.find(u => u.email.toLowerCase() === email.toLowerCase()); },
  password(v) {
    return {
      length:  v.length >= 8,
      upper:   /[A-Z]/.test(v),
      lower:   /[a-z]/.test(v),
      number:  /\d/.test(v),
      special: /[!@#$%^&*]/.test(v),
      valid()  { return this.length && this.upper && this.lower && this.number && this.special; }
    };
  }
};

// ---- UI Helpers ----
const UI = {
  _toastTimer: null,

  showToast(msg, type = "success") {
    let el = document.getElementById("__toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "__toast";
      document.body.appendChild(el);
    }
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.style.display = "none"; }, 3400);
  },

  showModal(html) {
    let overlay = document.getElementById("modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "modal-overlay";
      overlay.className = "modal-overlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="modal-box">${html}</div>`;
    overlay.style.display = "flex";
    overlay.addEventListener("click", e => { if (e.target === overlay) UI.closeModal(); }, { once: true });
  },

  closeModal() {
    const el = document.getElementById("modal-overlay");
    if (el) el.style.display = "none";
  },

  setFieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("input-error");
    let errEl = el.parentElement.querySelector(".field-error");
    if (!errEl) { errEl = document.createElement("span"); errEl.className = "field-error"; el.parentElement.appendChild(errEl); }
    errEl.textContent = msg;
  },

  clearFieldError(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("input-error");
    const errEl = el.parentElement.querySelector(".field-error");
    if (errEl) errEl.textContent = "";
  },

  clearAllErrors(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    container.querySelectorAll(".field-error").forEach(el => { el.textContent = ""; });
  },

  formatCurrency: fmtINR,
  formatDate(d)  { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); },
  formatChange:  fmtPct,
  colorClass:    gainLossClass,

  setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    if (!btn._origText) btn._origText = btn.textContent;
    btn.textContent = loading ? "Processing..." : btn._origText;
  }
};
