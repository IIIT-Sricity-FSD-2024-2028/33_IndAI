// ============================================================
// IndAI Platform – Review-4 Backend Bridge
// ------------------------------------------------------------
// Existing Review-3 dashboards use a synchronous DB object.
// This bridge mirrors important CRUD/workflow actions to the
// NestJS backend without redesigning dashboard UI.
// ============================================================
(function(){
  if (!window.DB || !window.ApiClient) return;
  if (window.BackendBridge) return;

  const BackendBridge = {
    enabled: localStorage.getItem('indai_backend_enabled') !== 'false',
    failures: [],

    setEnabled(value) {
      this.enabled = Boolean(value);
      localStorage.setItem('indai_backend_enabled', String(this.enabled));
    },

    currentUserId() {
      return window.ApiClient.activeUserId?.() || '';
    },

    async send(label, apiCall) {
      if (!this.enabled) return null;
      try {
        const response = await apiCall();
        if (response?.success === false && !response.offline) {
          console.warn(`[BackendBridge] ${label} backend rejected request:`, response.message || response);
          this.failures.push({ label, message: response.message || 'Backend rejected request', time: new Date().toISOString() });
        }
        return window.ApiClient.unwrap ? window.ApiClient.unwrap(response) : (response?.data || response);
      } catch (error) {
        console.warn(`[BackendBridge] ${label} failed. Review-3 local fallback stayed active.`, error.message);
        this.failures.push({ label, message: error.message, time: new Date().toISOString() });
        return null;
      }
    },

    frontendToBackendUser(user) {
      if (!user) return user;
      return { ...user, role: window.ApiClient.backendRole(user.role) };
    },

    coursePayload(course) {
      const sessionUserId = this.currentUserId();
      return {
        ...course,
        providerId: course?.providerId || sessionUserId || 'u5',
        lessons: Number(course?.lessons || 1),
        skillPoints: Number(course?.skillPoints || 0),
        status: course?.status || 'published'
      };
    },

    orderPayload(args) {
      const [learnerId, symbol, type, qty, price] = args;
      return {
        learnerId,
        symbol,
        orderType: String(type || '').toUpperCase(),
        orderCategory: 'MARKET',
        quantity: Number(qty),
        ...(price ? { price: Number(price) } : {})
      };
    },

    enrollmentPayload(args) {
      const [learnerId, courseId, assignedBy] = args;
      return { learnerId, courseId, assignedBy };
    }
  };

  function hasLocalError(result) {
    return result && typeof result === 'object' && (result.error || result.success === false);
  }

  function mirror(methodName, apiAction) {
    const original = DB[methodName];
    if (typeof original !== 'function') return;
    DB[methodName] = function(...args) {
      const result = original.apply(DB, args);
      if (!hasLocalError(result)) {
        BackendBridge.send(methodName, () => apiAction(args, result));
      }
      return result;
    };
  }

  // Users CRUD
  mirror('addUser', (args, result) => ApiClient.createUser(BackendBridge.frontendToBackendUser(args[0] || result)));
  mirror('updateUser', (args) => ApiClient.updateUser(args[0], BackendBridge.frontendToBackendUser(args[1] || {})));
  mirror('deleteUser', (args) => ApiClient.deleteUser(args[0]));

  // Courses CRUD
  mirror('addCourse', (args, result) => ApiClient.createCourse(BackendBridge.coursePayload(args[0] || result)));
  mirror('updateCourse', (args) => ApiClient.updateCourse(args[0], BackendBridge.coursePayload(args[1] || {})));
  mirror('deleteCourse', (args) => ApiClient.deleteCourse(args[0]));

  // Assignments CRUD
  mirror('addAssignment', (args, result) => ApiClient.createAssignment(args[0] || result));
  mirror('updateAssignment', (args) => ApiClient.updateAssignment(args[0], args[1] || {}));
  mirror('deleteAssignment', (args) => ApiClient.deleteAssignment(args[0]));

  // Sessions CRUD
  mirror('addSession', (args, result) => ApiClient.createSession(args[0] || result));
  mirror('updateSession', (args) => ApiClient.updateSession(args[0], args[1] || {}));
  mirror('deleteSession', (args) => ApiClient.deleteSession(args[0]));

  // Enrollments and progress
  mirror('enrollLearnerInCourse', (args) => ApiClient.createEnrollment(BackendBridge.enrollmentPayload(args)));
  mirror('updateEnrollment', (args) => ApiClient.updateEnrollment(args[0], args[1] || {}));

  // Trading and portfolio workflows
  mirror('executeTrade', (args) => ApiClient.post('/trading/orders', BackendBridge.orderPayload(args)));

  // Quizzes
  mirror('addQuiz', (args, result) => ApiClient.createQuiz(args[0] || result));
  mirror('updateQuiz', (args) => ApiClient.updateQuiz(args[0], args[1] || {}));
  mirror('deleteQuiz', (args) => ApiClient.deleteQuiz(args[0]));

  // Notifications
  mirror('addNotification', (args, result) => ApiClient.createNotification({
    userId: args[0],
    message: args[1],
    type: args[2] || 'info',
    ...(result && typeof result === 'object' ? result : {})
  }));
  mirror('markRead', (args) => ApiClient.markNotificationRead(args[0]));

  // Watchlists
  mirror('addToWatchlist', (args) => ApiClient.addWatchItem(args[0], args[1]));
  mirror('removeFromWatchlist', (args) => ApiClient.removeWatchItem(args[0], args[1]));

  // Config
  mirror('updateConfig', (args) => ApiClient.updateConfig(args[0] || {}));

  window.BackendBridge = BackendBridge;
})();
