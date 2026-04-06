    const session = Auth.requireAuth(["provider", "superuser"]);
    DarkMode.injectInto(".nav-right");
    const user = Auth.getCurrentUser();
    const providerId = user?.id || "u5";
    let pendingVideoFile = null;

    function getProviderVideos() {
      IndAIData.videoLibrary = IndAIData.videoLibrary || [];
      return IndAIData.videoLibrary.filter(v => v.providerId === providerId);
    }

    function getProviderAssignments() {
      return DB.getAssignments().filter(a => a.providerId === providerId);
    }

    function formatVideoDuration(seconds) {
      const total = Math.max(0, Math.round(Number(seconds || 0)));
      const mins = String(Math.floor(total / 60)).padStart(2, '0');
      const secs = String(total % 60).padStart(2, '0');
      return `${mins}:${secs}`;
    }

    function renderStats() {
      const courses = DB.getProviderCourses(providerId);
      const published = courses.filter(c => c.status === "published");
      const totalEnrolled = courses.reduce((s, c) => s + c.enrolledCount, 0);
      const avgCompletion = published.length ? Math.round(published.reduce((s, c) => s + (c.enrolledCount ? c.completedCount / c.enrolledCount * 100 : 0), 0) / published.length) : 0;
      const quizzes = DB.getProviderQuizzes(providerId);
      document.getElementById("provider-stats").innerHTML = `
        <div class="stat-card"><div class="stat-label">Total Courses</div><div class="stat-value">${courses.length}</div><div class="stat-sub">${published.length} published</div></div>
        <div class="stat-card"><div class="stat-label">Total Enrollments</div><div class="stat-value orange">${totalEnrolled}</div><div class="stat-sub">Across all courses</div></div>
        <div class="stat-card"><div class="stat-label">Avg Completion Rate</div><div class="stat-value green">${avgCompletion}%</div><div class="stat-sub">Great engagement</div></div>
        <div class="stat-card"><div class="stat-label">Active Quizzes</div><div class="stat-value">${quizzes.filter(q=>q.status==="active").length}</div><div class="stat-sub">${quizzes.reduce((s,q)=>s+q.attempts,0)} total attempts</div></div>`;
      document.getElementById("total-students").textContent = totalEnrolled;
    }

    function switchTab(tab) {
      document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.getElementById("view-" + tab).classList.add("active");
      document.getElementById("tab-" + tab).classList.add("active");
      if (tab === "courses") renderCourses();
      if (tab === "videos") renderVideos();
      if (tab === "quizzes") renderQuizzes();
      if (tab === "schedule") renderSchedule();
      if (tab === "analytics") renderAnalytics();
    }

    function renderCourses() {
      const courses = DB.getProviderCourses(providerId);
      document.getElementById("courses-list").innerHTML = courses.length ? courses.map(c => {
        const pct = c.enrolledCount ? Math.round(c.completedCount / c.enrolledCount * 100) : 0;
        return `<div class="course-card">
          <div class="course-card-header">
            <div>
              <span style="font-weight:800;font-size:16px;">${c.title}</span>
              <span class="badge ${c.status==='published'?'badge-dark':'badge-gray'}" style="margin-left:10px;">${c.status}</span>
              ${c.rating > 0 ? `<span class="rating-star" style="margin-left:8px;">⭐ ${c.rating}</span>` : ''}
            </div>
            <div style="display:flex;gap:10px;">
              <button class="btn-icon" onclick="openEditCourseModal('${c.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
              <button class="btn btn-secondary btn-sm" onclick="viewCourseDetails('${c.id}')">View Details</button>
              <button class="btn-icon danger" onclick="deleteCourse('${c.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
            </div>
          </div>
          <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px;">${c.description}</p>
          <div style="font-size:12px;color:var(--gray-500);margin-bottom:16px;">${c.lessons} lessons • ${c.duration} • Rewards ${c.skillPoints} skill points • ${c.category}</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
            <div style="background:var(--blue-light);padding:12px;border-radius:8px;text-align:center;"><div style="font-weight:800;font-size:1.3rem;color:var(--blue);">${c.enrolledCount}</div><div style="font-size:12px;">Enrolled Students</div></div>
            <div style="background:var(--green-light);padding:12px;border-radius:8px;text-align:center;"><div style="font-weight:800;font-size:1.3rem;color:var(--green);">${c.completedCount}</div><div style="font-size:12px;">Completed</div></div>
            <div style="background:var(--orange-light);padding:12px;border-radius:8px;text-align:center;"><div style="font-weight:800;font-size:1.3rem;color:var(--orange);">${pct}%</div><div style="font-size:12px;">Completion Rate</div></div>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;"></div></div>
        </div>`;
      }).join("") : `<div class="empty-state"><div class="icon">Courses</div><p>No courses yet. Create your first course!</p></div>`;
      renderProviderAssignments();
    }

    function renderProviderAssignments() {
      const assignments = getProviderAssignments();
      const container = document.getElementById("provider-assignments-list");
      if (!container) return;
      container.innerHTML = assignments.length ? assignments.map(a => {
        const course = DB.getCourseById(a.courseId);
        return `<div style="display:flex;justify-content:space-between;gap:16px;padding:16px 0;border-bottom:1px solid var(--gray-100);align-items:flex-start;">
          <div>
            <div style="font-weight:800;font-size:14px;">${a.title}</div>
            <div style="font-size:12px;color:var(--gray-500);margin-top:4px;">${course?.title || 'Standalone Assignment'} • Due ${a.dueDate}</div>
            <div style="font-size:13px;color:var(--gray-500);margin-top:6px;">${a.description}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
            <span class="badge ${a.status === 'published' ? 'badge-green' : 'badge-gray'}">${a.status || 'draft'}</span>
            <button class="btn-icon danger" onclick="deleteProviderAssignment('${a.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
          </div>
        </div>`;
      }).join("") : `<div class="empty-state"><div class="icon">Tasks</div><p>No provider assignments yet.</p></div>`;
    }

    function openNewCourseModal() {
      UI.showModal(`
        <div class="modal-title">Create New Course</div>
        <div class="modal-subtitle">Build a structured financial education course</div>
        <div class="form-group"><label class="form-label">Course Title *</label><input id="nc-title" class="form-input" placeholder="e.g. Advanced Options Trading"></div>
        <div class="form-group"><label class="form-label">Description *</label><textarea id="nc-desc" class="form-textarea" placeholder="Describe what students will learn..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Category *</label>
            <select id="nc-cat" class="form-select">
              <option value="">Select category</option>
              <option>Fundamentals</option><option>Technical Analysis</option><option>Risk Management</option>
              <option>Derivatives</option><option>Portfolio Management</option><option>Crypto</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Status</label>
            <select id="nc-status" class="form-select"><option value="draft">Draft</option><option value="published">Published</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Number of Lessons *</label><input id="nc-lessons" type="number" class="form-input" placeholder="e.g. 10" min="1"></div>
          <div class="form-group"><label class="form-label">Duration</label><input id="nc-dur" class="form-input" placeholder="e.g. 3 hours"></div>
        </div>
        <div class="form-group"><label class="form-label">Skill Points Reward *</label><input id="nc-pts" type="number" class="form-input" placeholder="e.g. 30" min="1" max="100"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-orange" onclick="saveNewCourse()">Create Course</button>
        </div>`);
    }

    function saveNewCourse() {
      const valid = FormValidator.validate([
        FormValidator.minLength("nc-title", "Course title", 3),
        FormValidator.minLength("nc-desc", "Description", 3),
        FormValidator.select("nc-cat", "a category"),
        FormValidator.positiveInt("nc-lessons", "Number of lessons", 1, 200),
        FormValidator.positiveInt("nc-pts", "Skill points", 1, 200)
      ]);
      if (!valid) return;
      const createdCourse = DB.addCourse({
        title: document.getElementById("nc-title").value.trim(),
        description: document.getElementById("nc-desc").value.trim(),
        videoLink: document.getElementById("nc-video")?.value.trim() || "",
        moduleSummary: document.getElementById("nc-modules")?.value.trim() || "",
        category: document.getElementById("nc-cat").value,
        lessons: parseInt(document.getElementById("nc-lessons").value),
        skillPoints: parseInt(document.getElementById("nc-pts").value),
        duration: document.getElementById("nc-dur").value.trim() || "1 hour",
        status: document.getElementById("nc-status").value,
        providerId
      });
      DB.notifyRoleUsers("superuser", `New course created by Course Provider: ${createdCourse.title}`, "info");
      UI.closeModal(); UI.showToast("Course created!"); renderCourses(); renderStats();
    }

    function openEditCourseModal(id) {
      const c = DB.getCourseById(id);
      if (!c) return;
      UI.showModal(`
        <div class="modal-title">Edit Course</div>
        <div class="form-group"><label class="form-label">Title *</label><input id="ec-title" class="form-input" value="${c.title}"></div>
        <div class="form-group"><label class="form-label">Description *</label><textarea id="ec-desc" class="form-textarea">${c.description}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Lessons</label><input id="ec-lessons" type="number" class="form-input" value="${c.lessons}"></div>
          <div class="form-group"><label class="form-label">Duration</label><input id="ec-dur" class="form-input" value="${c.duration}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Skill Points</label><input id="ec-pts" type="number" class="form-input" value="${c.skillPoints}"></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select id="ec-status" class="form-select"><option value="draft" ${c.status==="draft"?"selected":""}>Draft</option><option value="published" ${c.status==="published"?"selected":""}>Published</option></select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="saveEditCourse('${id}')">Save Changes</button>
        </div>`);
    }

    function saveEditCourse(id) {
      const title = document.getElementById("ec-title").value.trim();
      const desc = document.getElementById("ec-desc").value.trim();
      if (!title) { UI.showToast("Title required.", "error"); return; }
      if (!desc) { UI.showToast("Description required.", "error"); return; }
      DB.updateCourse(id, { title, description: desc, lessons: parseInt(document.getElementById("ec-lessons").value) || 1, duration: document.getElementById("ec-dur").value.trim(), skillPoints: parseInt(document.getElementById("ec-pts").value) || 10, status: document.getElementById("ec-status").value });
      UI.closeModal(); UI.showToast("Course updated!"); renderCourses(); renderStats();
    }

    function deleteCourse(id) {
      const c = DB.getCourseById(id);
      if (c.enrolledCount > 0) { UI.showToast(`Cannot delete: ${c.enrolledCount} students enrolled.`, "error"); return; }
      if (!confirm(`Delete "${c.title}"?`)) return;
      DB.deleteCourse(id); UI.showToast("Course deleted.", "info"); renderCourses(); renderStats();
    }

    function viewCourseDetails(id) {
      const c = DB.getCourseById(id);
      const quizzes = DB.getProviderQuizzes(providerId).filter(q => q.courseId === id);
      const pct = c.enrolledCount ? Math.round(c.completedCount / c.enrolledCount * 100) : 0;
      UI.showModal(`
        <div class="modal-title">${c.title}</div>
        <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px;">${c.description}</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
          <div style="background:var(--blue-light);padding:12px;border-radius:8px;text-align:center;"><div style="font-weight:800;font-size:1.2rem;color:var(--blue);">${c.enrolledCount}</div><div style="font-size:12px;">Enrolled</div></div>
          <div style="background:var(--green-light);padding:12px;border-radius:8px;text-align:center;"><div style="font-weight:800;font-size:1.2rem;color:var(--green);">${c.completedCount}</div><div style="font-size:12px;">Completed</div></div>
          <div style="background:var(--orange-light);padding:12px;border-radius:8px;text-align:center;"><div style="font-weight:800;font-size:1.2rem;color:var(--orange);">${pct}%</div><div style="font-size:12px;">Completion</div></div>
        </div>
        <div style="margin-bottom:16px;"><div style="font-size:13px;font-weight:700;margin-bottom:6px;">Associated Quizzes (${quizzes.length})</div>
          ${quizzes.length ? quizzes.map(q => `<div style="padding:8px;background:var(--gray-50);border-radius:6px;font-size:13px;margin-bottom:6px;">${q.title} – ${q.questions} questions, ${q.attempts} attempts</div>`).join("") : '<p style="font-size:13px;color:var(--gray-400);">No quizzes yet</p>'}
        </div>
        <div class="modal-footer"><button class="btn btn-primary" onclick="UI.closeModal()">Close</button></div>`);
    }

    // QUIZZES
    function renderQuizzes() {
      const quizzes = DB.getProviderQuizzes(providerId);
      document.getElementById("quizzes-tbody").innerHTML = quizzes.length ? quizzes.map(q => {
        const course = DB.getCourseById(q.courseId);
        return `<tr>
          <td><div style="font-weight:700;">${q.title}</div><div style="font-size:11px;color:var(--gray-500);">${q.questions} questions • ${q.timeLimit||20} min</div></td>
          <td style="font-size:13px;">${course?.title || "—"}</td>
          <td>${q.questions}</td>
          <td>${q.attempts}</td>
          <td style="font-weight:700;color:var(--green);">${q.avgScore}%</td>
          <td style="font-weight:700;color:var(--orange);">${q.passRate||85}%</td>
          <td>${getStatusBadge(q.status)}</td>
          <td><div style="display:flex;gap:6px;">
            <button class="btn-icon" onclick="openEditQuizModal('${q.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
            <button class="btn btn-secondary btn-sm" onclick="openQuizResultsModal('${q.id}')">View Results</button>
            <button class="btn-icon danger" onclick="deleteQuiz('${q.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
          </div></td>
        </tr>`;
      }).join("") : `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--gray-500);">No quizzes yet</td></tr>`;
    }

    function openNewQuizModal() {
      const courses = DB.getProviderCourses(providerId);
      UI.showModal(`
        <div class="modal-title">Create Quiz</div>
        <div class="form-group"><label class="form-label">Quiz Title *</label><input id="nq-title" class="form-input" placeholder="e.g. Module 1 Assessment"></div>
        <div class="form-group"><label class="form-label">Associated Course *</label>
          <select id="nq-course" class="form-select"><option value="">Select course</option>${courses.map(c=>`<option value="${c.id}">${c.title}</option>`).join("")}</select>
        </div>
        <div class="form-group"><label class="form-label">Number of Questions *</label><input id="nq-qcount" type="number" class="form-input" placeholder="10" min="1" max="50"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-orange" onclick="saveNewQuiz()">Create Quiz</button>
        </div>`);
    }

    function saveNewQuiz() {
      const valid = FormValidator.validate([
        FormValidator.minLength("nq-title", "Quiz title", 3),
        FormValidator.select("nq-course", "a course"),
        FormValidator.positiveInt("nq-qcount", "Question count", 1, 50)
      ]);
      if (!valid) return;
      const createdQuiz = DB.addQuiz({
        title: document.getElementById("nq-title").value.trim(),
        courseId: document.getElementById("nq-course").value,
        providerId,
        questions: parseInt(document.getElementById("nq-qcount").value),
        status: "active"
      });
      DB.notifyRoleUsers("superuser", `New quiz created by Course Provider: ${createdQuiz.title}`, "info");
      UI.closeModal(); UI.showToast("Quiz created!"); renderQuizzes(); renderStats();
    }

    function openEditQuizModal(id) {
      const q = DB.getQuizzes().find(x => x.id === id);
      if (!q) return;
      const courses = DB.getProviderCourses(providerId);
      UI.showModal(`
        <div class="modal-title">Edit Quiz: ${q.title}</div>
        <div class="modal-subtitle">Update quiz details and content</div>
        <div class="form-group"><label class="form-label">Quiz Title *</label><input id="eq-title" class="form-input" value="${q.title}"></div>
        <div class="form-group"><label class="form-label">Associated Course</label>
          <select id="eq-course" class="form-select">
            ${courses.map(c=>`<option value="${c.id}" ${q.courseId===c.id?"selected":""}>${c.title}</option>`).join("")}
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group"><label class="form-label">Number of Questions *</label><input id="eq-q" type="number" class="form-input" value="${q.questions}" min="1" max="50"></div>
          <div class="form-group"><label class="form-label">Time Limit (minutes) *</label><input id="eq-time" type="number" class="form-input" value="${q.timeLimit||20}" min="5" max="120"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group"><label class="form-label">Passing Score (%) *</label><input id="eq-pass" type="number" class="form-input" value="${q.passingScore||70}" min="1" max="100"></div>
          <div class="form-group"><label class="form-label">Skill Points on Pass</label><input id="eq-pts" type="number" class="form-input" value="${q.skillPointsOnPass||10}" min="0" max="100"></div>
        </div>
        <div class="form-group"><label class="form-label">Quiz Instructions</label>
          <textarea id="eq-instructions" class="form-textarea" placeholder="Provide instructions for students...">${q.instructions||''}</textarea>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select id="eq-status" class="form-select">
            <option value="active" ${q.status==="active"?"selected":""}>Active</option>
            <option value="inactive" ${q.status==="inactive"?"selected":""}>Inactive</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-orange" onclick="saveEditQuiz('${id}')">Save Changes</button>
        </div>`);
    }

    function saveEditQuiz(id) {
      const valid = FormValidator.validate([
        FormValidator.required("eq-title","Quiz title"),
        FormValidator.positiveInt("eq-q","Number of questions",1,50),
        FormValidator.positiveInt("eq-time","Time limit",5,120),
        FormValidator.positiveInt("eq-pass","Passing score",1,100)
      ]);
      if (!valid) return;
      DB.updateQuiz(id, {
        title: document.getElementById("eq-title").value.trim(),
        courseId: document.getElementById("eq-course").value,
        questions: parseInt(document.getElementById("eq-q").value),
        timeLimit: parseInt(document.getElementById("eq-time").value),
        passingScore: parseInt(document.getElementById("eq-pass").value),
        skillPointsOnPass: parseInt(document.getElementById("eq-pts").value)||10,
        instructions: document.getElementById("eq-instructions").value.trim(),
        status: document.getElementById("eq-status").value
      });
      UI.closeModal(); UI.showToast("Quiz updated!"); renderQuizzes();
    }

    function deleteQuiz(id) {
      const q = DB.getQuizzes().find(x => x.id === id);
      if (!confirm(`Delete quiz "${q?.title}"?`)) return;
      DB.deleteQuiz(id); UI.showToast("Deleted.", "info"); renderQuizzes();
    }

    // Quiz Results Modal (Design 13)
    function openQuizResultsModal(id) {
      const q = DB.getQuizzes().find(x => x.id === id);
      if (!q) return;
      const submissions = [
        { name:"Rahul Sharma", score:92, time:"2 hours ago", status:"Passed" },
        { name:"Priya Patel",  score:85, time:"5 hours ago", status:"Passed" },
        { name:"Amit Kumar",   score:68, time:"1 day ago",   status:"Retry" },
        { name:"Sneha Reddy",  score:55, time:"1 day ago",   status:"Failed" }
      ];
      const statusColors = { Passed:"badge-green", Retry:"badge-orange", Failed:"badge-red" };
      UI.showModal(`
        <div class="modal-title">Quiz Results: ${q.title}</div>
        <div class="modal-subtitle">Detailed analytics and student performance</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
          <div style="background:var(--blue-light);padding:14px;border-radius:8px;text-align:center;"><div style="font-weight:900;font-size:1.5rem;color:var(--blue);">${q.attempts}</div><div style="font-size:12px;">Total Attempts</div></div>
          <div style="background:var(--green-light);padding:14px;border-radius:8px;text-align:center;"><div style="font-weight:900;font-size:1.5rem;color:var(--green);">${q.avgScore}%</div><div style="font-size:12px;">Avg Score</div></div>
          <div style="background:var(--orange-light);padding:14px;border-radius:8px;text-align:center;"><div style="font-weight:900;font-size:1.5rem;color:var(--orange);">${q.passRate||85}%</div><div style="font-size:12px;">Pass Rate</div></div>
        </div>
        <div style="font-weight:700;margin-bottom:10px;">Recent Submissions</div>
        ${submissions.map(s=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:8px;background:${s.status==="Passed"?"var(--green-light)":s.status==="Failed"?"var(--red-light)":"var(--orange-light)"};">
            <div><div style="font-weight:700;">${s.name}</div><div style="font-size:12px;color:var(--gray-500);">Submitted ${s.time}</div></div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-weight:900;font-size:15px;color:${s.status==="Passed"?"var(--green)":s.status==="Failed"?"var(--red)":"var(--orange)"};">${s.score}%</span>
              <span class="badge ${statusColors[s.status]}">${s.status}</span>
            </div>
          </div>`).join("")}
        <div style="font-weight:700;margin:16px 0 10px;">Question Performance</div>
        ${[["Q1: Market Fundamentals",88],["Q2: Trading Strategies",76],["Q3: Risk Assessment",92],["Q4: Portfolio Management",65]].map(([label,pct])=>`
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>${label}</span><span style="font-weight:700;">${pct}%</span></div>
            <div class="progress-bar"><div class="progress-fill blue" style="width:${pct}%;"></div></div>
          </div>`).join("")}
        <div class="modal-footer">
          <button class="btn btn-orange" onclick="UI.showToast('Results exported!');UI.closeModal()">Export Results</button>
          <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
        </div>`);
    }

    // SCHEDULE — persistent in-memory module list
    let scheduleModules = [
      { courseTitle: "Introduction to Stock Markets", module: "Module 1: Basics", date: "2026-03-28", status: "published" },
      { courseTitle: "Introduction to Stock Markets", module: "Module 2: Indices", date: "2026-04-01", status: "scheduled" },
      { courseTitle: "Technical Analysis Fundamentals", module: "Module 1: Chart Patterns", date: "2026-03-30", status: "published" },
      { courseTitle: "Risk Management Strategies", module: "Module 1: Position Sizing", date: "2026-04-05", status: "scheduled" },
      { courseTitle: "Options Trading Basics", module: "Module 1: Intro to Options", date: "2026-04-10", status: "draft" }
    ];

    function renderSchedule() {
      document.getElementById("schedule-list").innerHTML = scheduleModules.length ? scheduleModules.map((m, idx) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid var(--gray-100);">
          <div>
            <div style="font-weight:700;font-size:14px;">${m.module}</div>
            <div style="font-size:12px;color:var(--gray-500);">${m.courseTitle}</div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;">
            <span style="font-size:13px;color:var(--gray-600);">📅 ${m.date}</span>
            <span class="badge ${m.status==='published'?'badge-green':m.status==='scheduled'?'badge-blue':'badge-gray'}">${m.status}</span>
            <button class="btn-icon danger" onclick="deleteModule(${idx})" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
          </div>
        </div>`).join("") : `<div class="empty-state"><div class="icon">Date️</div><p>No modules scheduled</p></div>`;
    }

    function deleteModule(idx) {
      if (!confirm("Delete this module release?")) return;
      scheduleModules.splice(idx, 1);
      UI.showToast("Module deleted.", "info");
      renderSchedule();
    }

    function openNewModuleModal() {
      const courses = DB.getProviderCourses(providerId);
      UI.showModal(`
        <div class="modal-title">Schedule Module Release</div>
        <div class="form-group"><label class="form-label">Course *</label>
          <select id="nm-course" class="form-select"><option value="">Select course</option>${courses.map(c=>`<option value="${c.id}">${c.title}</option>`).join("")}</select>
        </div>
        <div class="form-group"><label class="form-label">Module Name *</label><input id="nm-name" class="form-input" placeholder="e.g. Module 3: Technical Indicators"></div>
        <div class="form-group"><label class="form-label">Release Date *</label><input id="nm-date" type="date" class="form-input"></div>
        <div class="form-group"><label class="form-label">Status</label>
          <select id="nm-status" class="form-select"><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published">Published</option></select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-orange" onclick="saveNewModule()">Add Module</button>
        </div>`);
    }

    function saveNewModule() {
      const courseId = document.getElementById("nm-course").value;
      const name = document.getElementById("nm-name").value.trim();
      const date = document.getElementById("nm-date").value;
      const status = document.getElementById("nm-status").value;
      const valid = FormValidator.validate([
        FormValidator.select("nm-course", "a course"),
        FormValidator.required("nm-name", "Module name"),
        FormValidator.saneFutureDate("nm-date", "Release date", 365)
      ]);
      if (!valid) return;
      const course = DB.getCourseById(courseId);
      scheduleModules.push({ courseTitle: course?.title || "Unknown Course", module: name, date, status });
      UI.closeModal(); UI.showToast("Module scheduled!"); renderSchedule();
    }

    // ANALYTICS
    function renderAnalytics() {
      const courses = DB.getProviderCourses(providerId).filter(c => c.status === "published");
      const quizzes = DB.getProviderQuizzes(providerId);
      const totalEnrolled = courses.reduce((s, c) => s + c.enrolledCount, 0);
      const totalCompleted = courses.reduce((s, c) => s + c.completedCount, 0);
      const avgScore = quizzes.length
        ? Math.round(quizzes.reduce((s, q) => s + q.avgScore, 0) / quizzes.length)
        : 0;

      // Analytics cards
      const perf = document.getElementById("course-performance");
      perf.innerHTML = `
        <div class="analytics-grid" style="margin-bottom:20px;">
          <div class="analytics-card">
            <div class="ac-icon" style="background:var(--blue-light);">Users</div>
            <div class="ac-value" style="color:var(--blue);">${totalEnrolled}</div>
            <div class="ac-label">Total Enrollments</div>
          </div>
          <div class="analytics-card">
            <div class="ac-icon" style="background:var(--green-light);">Done</div>
            <div class="ac-value" style="color:var(--green);">${totalCompleted}</div>
            <div class="ac-label">Course Completions</div>
          </div>
          <div class="analytics-card">
            <div class="ac-icon" style="background:var(--orange-light);">Quiz</div>
            <div class="ac-value" style="color:var(--orange);">${avgScore}%</div>
            <div class="ac-label">Avg Quiz Score</div>
          </div>
        </div>
        ${courses.length ? courses.map(c => {
          const pct = c.enrolledCount ? Math.round(c.completedCount / c.enrolledCount * 100) : 0;
          return `<div class="perf-bar-item">
            <div class="perf-bar-label"><span style="font-weight:600;font-size:13px;">${c.title}</span><span style="font-size:13px;font-weight:700;">${pct}% complete</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;"></div></div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">${c.enrolledCount} enrolled • ${c.completedCount} completed</div>
          </div>`;
        }).join("") : emptyState("Analytics", "No published courses yet")}`;

      const feedbacks = [
        { name: "Rahul Sharma", rating: 5.0, text: "Excellent course! Technical analysis was particularly helpful.", course: "Technical Analysis Fundamentals", ago: "2 days ago" },
        { name: "Priya Patel", rating: 4.8, text: "Great introduction to risk management. Very practical examples.", course: "Risk Management Strategies", ago: "5 days ago" },
        { name: "Amit Kumar", rating: 4.5, text: "Clear explanations. Would love more real-world examples.", course: "Introduction to Stock Markets", ago: "1 week ago" }
      ];
      document.getElementById("student-feedback").innerHTML = feedbacks.map(f => `
        <div class="feedback-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-weight:800;font-size:14px;">${f.name}</span>
              <span class="rating">⭐ ${f.rating}</span>
            </div>
            <span style="font-size:12px;color:var(--gray-400);">${f.ago}</span>
          </div>
          <p style="font-size:13px;margin-bottom:8px;">"${f.text}"</p>
          <span style="font-size:12px;color:var(--blue);font-weight:600;">${f.course}</span>
        </div>`).join("");
    }


    function openProviderAssignmentModal() {
      const courses = DB.getProviderCourses(providerId);
      UI.showModal(`
        <div class="modal-title">Create Provider Assignment</div>
        <div class="form-group"><label class="form-label">Assignment Title *</label><input id="pa-title" class="form-input" placeholder="e.g. Module Reflection"></div>
        <div class="form-group"><label class="form-label">Description *</label><textarea id="pa-desc" class="form-textarea" placeholder="Describe the task for learners..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Course *</label><select id="pa-course" class="form-select"><option value="">Select course</option>${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join("")}</select></div>
          <div class="form-group"><label class="form-label">Due Date *</label><input id="pa-date" type="date" class="form-input"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Skill Points *</label><input id="pa-pts" type="number" class="form-input" min="1" max="100" value="25"></div>
          <div class="form-group"><label class="form-label">Status</label><select id="pa-status" class="form-select"><option value="draft">Draft</option><option value="published">Published</option></select></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-orange" onclick="saveProviderAssignment()">Create Assignment</button>
        </div>`);
    }

    function saveProviderAssignment() {
      const valid = FormValidator.validate([
        FormValidator.minLength("pa-title", "Assignment title", 3),
        FormValidator.minLength("pa-desc", "Description", 3),
        FormValidator.select("pa-course", "a course"),
        FormValidator.saneFutureDate("pa-date", "Due date", 365),
        FormValidator.positiveInt("pa-pts", "Skill points", 1, 100)
      ]);
      if (!valid) return;
      const createdAssignment = DB.addAssignment({
        title: document.getElementById("pa-title").value.trim(),
        description: document.getElementById("pa-desc").value.trim(),
        courseId: document.getElementById("pa-course").value,
        providerId,
        instructorId: providerId,
        dueDate: document.getElementById("pa-date").value,
        difficulty: "Medium",
        skillPoints: parseInt(document.getElementById("pa-pts").value, 10),
        status: document.getElementById("pa-status").value,
        studentIds: [],
        completedIds: []
      });
      DB.notifyRoleUsers("superuser", `New assignment created by Course Provider: ${createdAssignment.title}`, "info");
      UI.closeModal();
      UI.showToast("Provider assignment created!");
      renderCourses();
    }

    function deleteProviderAssignment(id) {
      const assignment = DB.getAssignmentById(id);
      if (!confirm(`Delete assignment "${assignment?.title}"?`)) return;
      DB.deleteAssignment(id);
      UI.showToast("Assignment deleted.", "info");
      renderCourses();
    }

    function renderVideos() {
      const videos = getProviderVideos();
      const list = document.getElementById("provider-videos-list");
      if (!list) return;
      list.innerHTML = videos.length ? videos.map(v => `
        <div class="course-card" style="overflow:hidden;">
          <div style="height:156px;background:linear-gradient(135deg,#0F172A 0%, #1E3A8A 100%);position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.92);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(15,23,42,0.25);"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:var(--blue);margin-left:3px;"><polygon points="8 5 19 12 8 19 8 5"></polygon></svg></div>
            <span class="badge ${v.status === 'published' ? 'badge-green' : 'badge-gray'}" style="position:absolute;top:14px;right:14px;">${v.status}</span>
            <span style="position:absolute;right:14px;bottom:12px;background:rgba(15,23,42,0.9);color:#fff;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;">${v.duration}</span>
          </div>
          <div style="padding:16px;">
            <div style="font-weight:800;font-size:15px;margin-bottom:6px;">${v.title}</div>
            <div style="font-size:13px;color:var(--gray-500);margin-bottom:12px;">${v.description || 'Uploaded video content for your learners.'}</div>
            <div style="display:flex;justify-content:space-between;gap:12px;font-size:12px;color:var(--gray-400);margin-bottom:14px;flex-wrap:wrap;">
              <span>${v.views || 0} views • ${v.sizeMB} MB</span>
              <span>${DB.getCourseById(v.courseId)?.title || 'General'}${v.moduleId ? ' • ' + ((DB.getCourseModules(v.courseId || '').find(m => m.id === v.moduleId)?.title) || 'Module') : ''}</span>
              <span>${v.uploadedAt}</span>
            </div>
            <div style="display:flex;gap:10px;">
              <button class="btn btn-secondary btn-sm" onclick="toggleVideoStatus('${v.id}')">${v.status === 'published' ? 'Unpublish' : 'Publish'}</button>
              <button class="btn-icon danger" onclick="deleteVideo('${v.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
            </div>
          </div>
        </div>`).join("") : `<div class="empty-state" style="grid-column:1/-1;"><div class="icon">Video</div><p>No videos uploaded yet.</p></div>`;
    }

    function openVideoPicker() {
      document.getElementById("video-file-input")?.click();
    }

    function bindVideoUpload() {
      const input = document.getElementById("video-file-input");
      const zone = document.getElementById("video-upload-zone");
      if (input && !input.dataset.bound) {
        input.dataset.bound = "true";
        input.addEventListener("change", e => {
          const file = e.target.files?.[0];
          if (file) openVideoPlacementModal(file);
          input.value = "";
        });
      }
      if (zone && !zone.dataset.bound) {
        zone.dataset.bound = "true";
        ["dragenter","dragover"].forEach(evt => zone.addEventListener(evt, ev => { ev.preventDefault(); zone.style.borderColor = 'var(--orange)'; }));
        ["dragleave","drop"].forEach(evt => zone.addEventListener(evt, ev => { ev.preventDefault(); zone.style.borderColor = 'var(--gray-200)'; }));
        zone.addEventListener("drop", ev => {
          const file = ev.dataTransfer?.files?.[0];
          if (file) openVideoPlacementModal(file);
        });
      }
    }

    function getPlacementOptions(courseId) {
      const modules = DB.getCourseModules(courseId);
      return modules.length ? modules.map(m => `<option value="${m.id}">After ${m.title}</option>`).join("") : '';
    }

    function openVideoPlacementModal(file) {
      pendingVideoFile = file;
      const courses = DB.getProviderCourses(providerId);
      if (!courses.length) { UI.showToast('Create a course before uploading videos.', 'error'); return; }
      const defaultCourse = courses[0].id;
      UI.showModal(`
        <div class="modal-title">Upload Video Material</div>
        <div class="modal-subtitle">Choose which course module this video should be added to.</div>
        <div class="form-group"><label class="form-label">Selected File</label><input class="form-input" value="${file.name}" disabled></div>
        <div class="form-group"><label class="form-label">Course *</label>
          <select id="vu-course" class="form-select" onchange="refreshVideoPlacementOptions(this.value)">${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Place Video</label>
          <select id="vu-after" class="form-select"><option value="">Add as next module at the end</option>${getPlacementOptions(defaultCourse)}</select>
        </div>
        <div class="form-group"><label class="form-label">Module Title *</label><input id="vu-title" class="form-input" value="${file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')}"></div>
        <div class="form-group"><label class="form-label">Description</label><textarea id="vu-desc" class="form-textarea" placeholder="Describe what learners will get from this material..."></textarea></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="cancelVideoUploadModal()">Cancel</button>
          <button class="btn btn-orange" onclick="confirmVideoUpload()">Upload Video</button>
        </div>`);
    }

    function refreshVideoPlacementOptions(courseId) {
      const target = document.getElementById('vu-after');
      if (!target) return;
      target.innerHTML = `<option value="">Add as next module at the end</option>${getPlacementOptions(courseId)}`;
    }

    function cancelVideoUploadModal() {
      pendingVideoFile = null;
      UI.closeModal();
    }

    function confirmVideoUpload() {
      if (!pendingVideoFile) { UI.showToast('Choose a video file first.', 'error'); return; }
      const valid = FormValidator.validate([
        FormValidator.select('vu-course', 'a course'),
        FormValidator.required('vu-title', 'Module title')
      ]);
      if (!valid) return;
      handleVideoUpload(pendingVideoFile, {
        courseId: document.getElementById('vu-course').value,
        afterModuleId: document.getElementById('vu-after').value,
        title: document.getElementById('vu-title').value.trim(),
        description: document.getElementById('vu-desc').value.trim()
      });
    }

    function handleVideoUpload(file, placement = {}) {
      const allowed = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
      if (!allowed.includes(file.type) && !/\.(mp4|mov|avi|mkv)$/i.test(file.name)) {
        UI.showToast("Upload MP4, MOV, AVI, or MKV files only.", "error");
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        UI.showToast("Video must be under 500MB.", "error");
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.src = objectUrl;
      probe.onloadedmetadata = () => {
        const result = DB.addVideoMaterial({
          providerId,
          courseId: placement.courseId,
          afterModuleId: placement.afterModuleId || '',
          title: placement.title || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          description: placement.description || 'Recently uploaded lesson video.',
          duration: formatVideoDuration(probe.duration),
          sizeMB: Math.max(1, Math.round(file.size / (1024 * 1024))),
          sourceName: file.name
        });
        URL.revokeObjectURL(objectUrl);
        pendingVideoFile = null;
        if (!result?.success) { UI.showToast(result?.message || 'Upload failed.', 'error'); return; }
        UI.closeModal();
        UI.showToast("Video uploaded successfully!");
        renderVideos();
      };
      probe.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        pendingVideoFile = null;
        UI.showToast("Could not read video metadata. Please try another file.", "error");
      };
    }

    function toggleVideoStatus(id) {
      const video = (IndAIData.videoLibrary || []).find(v => v.id === id);
      if (!video) return;
      video.status = video.status === 'published' ? 'draft' : 'published';
      persistData();
      renderVideos();
    }

    function deleteVideo(id) {
      if (!confirm("Delete this video?")) return;
      IndAIData.videoLibrary = (IndAIData.videoLibrary || []).filter(v => v.id !== id);
      persistData();
      UI.showToast("Video deleted.", "info");
      renderVideos();
    }

    function openProviderProfileModal() {
      const user = Auth.getCurrentUser();
      if (!user) return;
      const courses  = DB.getProviderCourses(providerId);
      const quizzes  = DB.getProviderQuizzes(providerId);
      const enrolled = courses.reduce((s,c)=>s+c.enrolledCount,0);
      UI.showModal(`
        <div class="modal-title">My Profile</div>
        <div style="text-align:center;margin-bottom:20px;">
          <div style="width:64px;height:64px;background:var(--orange-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px;">Course</div>
          <div style="font-weight:800;font-size:1.1rem;">${user.firstName} ${user.lastName}</div>
          <div style="font-size:13px;color:var(--gray-500);">${user.email}</div>
          <span class="badge badge-orange" style="margin-top:8px;display:inline-block;">Course Provider</span>
        </div>
        <div class="report-card">
          <div class="report-metric"><span>Total Courses</span><span style="font-weight:700;">${courses.length}</span></div>
          <div class="report-metric"><span>Published</span><span style="font-weight:700;">${courses.filter(c=>c.status==="published").length}</span></div>
          <div class="report-metric"><span>Total Enrollments</span><span style="font-weight:700;">${enrolled}</span></div>
          <div class="report-metric"><span>Active Quizzes</span><span style="font-weight:700;">${quizzes.filter(q=>q.status==="active").length}</span></div>
          <div class="report-metric"><span>Member Since</span><span style="font-weight:700;">${user.createdAt||'N/A'}</span></div>
        </div>
        <div class="modal-footer"><button class="btn btn-secondary" onclick="UI.closeModal()">Close</button></div>`);
    }

    function openProviderNotifModal() {
      const notifs = DB.getNotifications(providerId);
      const icons = { assignment:"Tasks", session:"Date️", achievement:"Points", feedback:"Note", info:"ℹ️" };
      UI.showModal(`
        <div class="modal-title">Alert Notifications</div>
        <div style="max-height:400px;overflow-y:auto;">
          ${notifs.length ? notifs.map(n=>`
            <div style="padding:12px;border-bottom:1px solid var(--gray-100);display:flex;gap:10px;align-items:flex-start;background:${n.read?'#fff':'var(--blue-light)'};">
              <span style="font-size:18px;flex-shrink:0;">${icons[n.type]||'Alert'}</span>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:${n.read?'400':'700'};">${n.message}</div>
                <div style="font-size:11px;color:var(--gray-400);margin-top:3px;">${n.createdAt}</div>
              </div>
              ${!n.read?`<button class="btn btn-secondary btn-sm" onclick="DB.markRead('${n.id}');openProviderNotifModal()">✓</button>`:''}
            </div>`).join('')
          : `<div class="empty-state"><div class="icon">Alert</div><p>No notifications yet.</p></div>`}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="DB.markAllRead(providerId);updateProviderNotifBadge();UI.closeModal()">Mark All Read</button>
          <button class="btn btn-primary" onclick="UI.closeModal()">Close</button>
        </div>`);
      DB.markAllRead(providerId);
      updateProviderNotifBadge();
    }

    function updateProviderNotifBadge() {
      const count = DB.getUnreadCount(providerId);
      const el = document.getElementById("notif-count");
      if (el) el.textContent = count || 0;
    }

    bindVideoUpload(); renderStats(); renderCourses(); renderVideos(); updateProviderNotifBadge();