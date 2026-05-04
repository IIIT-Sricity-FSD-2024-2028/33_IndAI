// ============================================================
// IndAI Review-4 Backend API Client
// Central fetch wrapper for the NestJS backend.
// - Preserves Review-3 frontend role names
// - Sends backend-compatible x-role headers
// - Supports generic REST helpers for dashboard CRUD integration
// - Gracefully returns offline responses when backend is unavailable
// ============================================================
(function(){
  const ROLE_TO_BACKEND = {
    superuser: 'SUPER_USER',
    admin: 'ADMIN',
    instructor: 'INSTRUCTOR',
    provider: 'COURSE_PROVIDER',
    learner: 'LEARNER',
    SUPER_USER: 'SUPER_USER',
    ADMIN: 'ADMIN',
    INSTRUCTOR: 'INSTRUCTOR',
    COURSE_PROVIDER: 'COURSE_PROVIDER',
    LEARNER: 'LEARNER'
  };

  const ROLE_TO_FRONTEND = {
    SUPER_USER: 'superuser',
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    COURSE_PROVIDER: 'provider',
    LEARNER: 'learner',
    superuser: 'superuser',
    admin: 'admin',
    instructor: 'instructor',
    provider: 'provider',
    learner: 'learner'
  };

  function getSession(){
    try {
      return window.Auth?.getSession?.() || JSON.parse(localStorage.getItem('indai_session') || 'null') || {};
    } catch {
      return {};
    }
  }

  function backendRole(role){
    return ROLE_TO_BACKEND[role] || ROLE_TO_BACKEND[String(role || '').toLowerCase()] || 'LEARNER';
  }

  function frontendRole(role){
    return ROLE_TO_FRONTEND[role] || ROLE_TO_FRONTEND[String(role || '').toUpperCase()] || String(role || '').toLowerCase();
  }

  function unwrap(res){
    return res && Object.prototype.hasOwnProperty.call(res, 'data') ? res.data : res;
  }

  function activeUserId(){
    const session = getSession();
    return session.userId || session.id || session.user?.id || '';
  }

  window.API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

  const ApiClient = {
    backendRole,
    frontendRole,
    unwrap,
    getSession,
    activeUserId,

    async request(path, options = {}) {
      const session = getSession();
      const hasBody = Object.prototype.hasOwnProperty.call(options, 'body') && options.body !== undefined && options.body !== null;
      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
      const headers = {
        ...(hasBody && !isFormData ? {'Content-Type': 'application/json'} : {}),
        'x-role': backendRole(options.role || session.role || 'learner'),
        ...(activeUserId() ? {'x-user-id': activeUserId()} : {}),
        ...(options.headers || {})
      };

      try {
        const res = await fetch(`${window.API_BASE_URL}${path}`, { ...options, headers });
        const text = await res.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; }
        catch { data = { raw: text }; }
        console.log(`[API] ${options.method || 'GET'} ${path} -> ${res.status}`, data);
        if (!res.ok) {
          return {
            success: false,
            status: res.status,
            message: Array.isArray(data.message) ? data.message.join(', ') : (data.message || data.error || 'Backend request failed'),
            data
          };
        }
        return data;
      } catch (err) {
        console.warn(`[API:FALLBACK] ${options.method || 'GET'} ${path}`, err.message);
        return { success:false, offline:true, message:'Backend unavailable. Using local fallback.' };
      }
    },

    get(path, options = {}) { return this.request(path, { ...options, method: 'GET' }); },
    post(path, payload, options = {}) { return this.request(path, { ...options, method: 'POST', body: JSON.stringify(payload || {}) }); },
    postForm(path, formData, options = {}) { return this.request(path, { ...options, method: 'POST', body: formData }); },
    patch(path, payload, options = {}) { return this.request(path, { ...options, method: 'PATCH', body: JSON.stringify(payload || {}) }); },
    put(path, payload, options = {}) { return this.request(path, { ...options, method: 'PUT', body: JSON.stringify(payload || {}) }); },
    delete(path, options = {}) { return this.request(path, { ...options, method: 'DELETE' }); },

    // ---- Auth ----
    login(payload) { return this.post('/auth/login', payload, { headers:{'x-role': backendRole(payload?.role || 'learner')} }); },
    async register(payload) {
      // Auth register is the preferred Review-4 public endpoint. Keep /users/register as compatibility fallback.
      const first = await this.post('/auth/register', payload, { headers:{'x-role': backendRole(payload?.role || 'learner')} });
      if (first?.success || first?.offline || first?.status !== 404) return first;
      return this.post('/users/register', payload, { headers:{'x-role': backendRole(payload?.role || 'learner')} });
    },
    me(userId) { return this.get(`/auth/me/${encodeURIComponent(userId)}`); },

    // ---- Users ----
    users() { return this.get('/users', { headers:{'x-role':'SUPER_USER'} }); },
    user(userId) { return this.get(`/users/${encodeURIComponent(userId)}`); },
    usersByRole(role) { return this.get(`/users/role/${encodeURIComponent(role)}`); },
    createUser(payload) { return this.post('/users', payload, { headers:{'x-role':'SUPER_USER'} }); },
    updateUser(userId, payload) { return this.patch(`/users/${encodeURIComponent(userId)}`, payload, { headers:{'x-role':'SUPER_USER'} }); },
    deleteUser(userId) { return this.delete(`/users/${encodeURIComponent(userId)}`, { headers:{'x-role':'SUPER_USER'} }); },

    // ---- Market / Stocks ----
    stocks(q, sector, cap) {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (sector) params.set('sector', sector);
      if (cap) params.set('cap', cap);
      const qs = params.toString();
      return this.get(`/market/instruments${qs ? '?' + qs : ''}`);
    },
    marketTick(symbols = '') { return this.get(`/market/prices${symbols ? `?symbols=${encodeURIComponent(symbols)}` : ''}`); },
    quote(symbol) { return this.get(`/market/instruments/${encodeURIComponent(symbol)}`); },
    candles(symbol, limit = 240) { return this.get(`/stocks/${encodeURIComponent(symbol)}/candles?limit=${limit}`); },

    // ---- Courses and modules ----
    courses() { return this.get('/courses'); },
    publishedCourses() { return this.get('/courses/published'); },
    course(courseId) { return this.get(`/courses/${encodeURIComponent(courseId)}`); },
    providerCourses(providerId) { return this.get(`/courses/provider/${encodeURIComponent(providerId)}`); },
    createCourse(payload) { return this.post('/courses', payload); },
    updateCourse(courseId, payload) { return this.patch(`/courses/${encodeURIComponent(courseId)}`, payload); },
    deleteCourse(courseId) { return this.delete(`/courses/${encodeURIComponent(courseId)}`); },
    courseModules(courseId) { return this.get(`/courses/${encodeURIComponent(courseId)}/modules`); },
    createCourseModule(courseId, payload) { return this.post(`/courses/${encodeURIComponent(courseId)}/modules`, payload); },
    updateCourseModule(moduleId, payload) { return this.patch(`/course-modules/${encodeURIComponent(moduleId)}`, payload); },
    deleteCourseModule(moduleId) { return this.delete(`/course-modules/${encodeURIComponent(moduleId)}`); },
    uploadCourseVideo(formData) { return this.postForm('/course-modules/upload-video', formData, { role: 'provider' }); },

    // ---- Enrollments ----
    enrollments() { return this.get('/enrollments'); },
    learnerEnrollments(learnerId) { return this.get(`/enrollments/learner/${encodeURIComponent(learnerId)}`); },
    createEnrollment(payload) { return this.post('/enrollments', payload); },
    updateEnrollment(enrollmentId, payload) { return this.patch(`/enrollments/${encodeURIComponent(enrollmentId)}/progress`, payload); },
    deleteEnrollment(enrollmentId) { return this.delete(`/enrollments/${encodeURIComponent(enrollmentId)}`); },

    // ---- Diagnostic ----
    submitDiagnostic(payload) { return this.post('/diagnostic/submit', payload); },
    learnerDiagnostic(learnerId) { return this.get(`/diagnostic/learner/${encodeURIComponent(learnerId)}`); },

    // ---- Trading and Portfolio ----
    portfolio(userId) { return this.get(`/portfolio/${encodeURIComponent(userId)}`); },
    trades(userId) { return this.get(`/trading/trades/learner/${encodeURIComponent(userId)}`); },
    allTrades() { return this.get('/trading/trades'); },
    executeTrade(payload) {
      const order = {
        learnerId: payload.learnerId,
        symbol: payload.symbol,
        orderType: payload.type || payload.orderType,
        orderCategory: payload.orderCategory || 'MARKET',
        quantity: payload.qty || payload.quantity,
        price: payload.price
      };
      return this.post('/trading/orders', order);
    },

    // ---- Watchlists ----
    watchlists(userId) { return this.get(`/watchlists/${encodeURIComponent(userId)}`); },
    createWatchlist(userId, payload) { return this.post(`/watchlists/${encodeURIComponent(userId)}`, payload); },
    updateWatchlist(watchlistId, payload) { return this.patch(`/watchlists/${encodeURIComponent(watchlistId)}`, payload); },
    addWatchSymbol(watchlistId, symbol) { return this.post(`/watchlists/${encodeURIComponent(watchlistId)}/symbols/${encodeURIComponent(symbol)}`, {}); },
    removeWatchSymbol(watchlistId, symbol) { return this.delete(`/watchlists/${encodeURIComponent(watchlistId)}/symbols/${encodeURIComponent(symbol)}`); },
    addWatchItem(userId, symbol) { return this.post(`/watchlists/${encodeURIComponent(userId)}/items`, { symbol }); },
    removeWatchItem(userId, symbol) { return this.delete(`/watchlists/${encodeURIComponent(userId)}/items/${encodeURIComponent(symbol)}`); },
    deleteWatchlist(watchlistId) { return this.delete(`/watchlists/${encodeURIComponent(watchlistId)}`); },

    // ---- Assignments ----
    assignments() { return this.get('/assignments'); },
    learnerAssignments(learnerId) { return this.get(`/assignments/learner/${encodeURIComponent(learnerId)}`); },
    assignment(id) { return this.get(`/assignments/${encodeURIComponent(id)}`); },
    createAssignment(payload) { return this.post('/assignments', payload); },
    updateAssignment(id, payload) { return this.patch(`/assignments/${encodeURIComponent(id)}`, payload); },
    deleteAssignment(id) { return this.delete(`/assignments/${encodeURIComponent(id)}`); },
    submitAssignment(id, payload) { return this.post(`/assignments/${encodeURIComponent(id)}/submit`, payload); },
    approveAssignment(id, learnerId) { return this.post(`/assignments/${encodeURIComponent(id)}/approve/${encodeURIComponent(learnerId)}`, {}); },

    // ---- Sessions ----
    sessions() { return this.get('/sessions'); },
    learnerSessions(learnerId) { return this.get(`/sessions/learner/${encodeURIComponent(learnerId)}`); },
    session(id) { return this.get(`/sessions/${encodeURIComponent(id)}`); },
    createSession(payload) { return this.post('/sessions', payload); },
    updateSession(id, payload) { return this.patch(`/sessions/${encodeURIComponent(id)}`, payload); },
    deleteSession(id) { return this.delete(`/sessions/${encodeURIComponent(id)}`); },

    // ---- Quizzes ----
    quizzes() { return this.get('/quizzes'); },
    quiz(id) { return this.get(`/quizzes/${encodeURIComponent(id)}`); },
    createQuiz(payload) { return this.post('/quizzes', payload); },
    updateQuiz(id, payload) { return this.patch(`/quizzes/${encodeURIComponent(id)}`, payload); },
    deleteQuiz(id) { return this.delete(`/quizzes/${encodeURIComponent(id)}`); },
    submitQuiz(id, payload) { return this.post(`/quizzes/${encodeURIComponent(id)}/submit`, payload); },

    // ---- Feedback / Notifications / Reports / Admin ----
    feedback() { return this.get('/feedback'); },
    learnerFeedback(learnerId) { return this.get(`/feedback/learner/${encodeURIComponent(learnerId)}`); },
    createFeedback(payload) { return this.post('/feedback', payload); },
    updateFeedback(id, payload) { return this.patch(`/feedback/${encodeURIComponent(id)}`, payload); },
    deleteFeedback(id) { return this.delete(`/feedback/${encodeURIComponent(id)}`); },
    notifications(userId) { return this.get(`/notifications/${encodeURIComponent(userId)}`); },
    allNotifications() { return this.get('/notifications'); },
    createNotification(payload) { return this.post('/notifications', payload); },
    markNotificationRead(id) { return this.patch(`/notifications/${encodeURIComponent(id)}/read`, {}); },
    deleteNotification(id) { return this.delete(`/notifications/${encodeURIComponent(id)}`); },
    platformReport() { return this.get('/reports/platform'); },
    learnerReport(learnerId) { return this.get(`/reports/learner/${encodeURIComponent(learnerId)}`); },
    courseReport(courseId) { return this.get(`/reports/course/${encodeURIComponent(courseId)}`); },
    adminConfig() { return this.get('/admin/config'); },
    updateConfig(payload) { return this.patch('/admin/config', payload); },
    assignInstructor(payload) { return this.post('/admin/assign-instructor', payload); },
    superuserOverview() { return this.get('/superuser/overview'); },
    superuserAllData() { return this.get('/superuser/all-data'); },
    resetDemoData() { return this.post('/superuser/reset-demo-data', {}); }
  };

  window.ApiClient = ApiClient;

  // Compatibility alias for older bridge/integration utilities.
  window.Api = {
    ...ApiClient,
    toBackendRole: backendRole,
    toFrontendRole: frontendRole,
    getCurrentUserId: activeUserId,
    unwrap,
    request: ApiClient.request.bind(ApiClient),
    get: ApiClient.get.bind(ApiClient),
    post: ApiClient.post.bind(ApiClient),
    patch: ApiClient.patch.bind(ApiClient),
    put: ApiClient.put.bind(ApiClient),
    delete: ApiClient.delete.bind(ApiClient)
  };
})();
