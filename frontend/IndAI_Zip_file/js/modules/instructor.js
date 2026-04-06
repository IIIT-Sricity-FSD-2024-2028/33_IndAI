  const session = Auth.requireAuth(["instructor","superuser"]);
    DarkMode.injectInto(".nav-right");
  const user = Auth.getCurrentUser();
  let myStudents = [];

  function init() {
    if (!user) return;
    if (user.role === "instructor") {
      myStudents = DB.getLearners().filter(l => (user.studentIds||[]).includes(l.id));
    } else {
      myStudents = DB.getLearners();
    }
    document.getElementById("student-count").textContent = myStudents.length;
    updateNotifBadge();
    renderStats();
    renderOverview();
  }

  function updateNotifBadge() {
    const c = DB.getUnreadCount(user?.id || "u3");
    document.getElementById("notif-count").textContent = c || 0;
  }

  function switchTab(tab) {
    document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("view-" + tab).classList.add("active");
    document.getElementById("tab-" + tab).classList.add("active");
    if (tab === "students")    renderStudents();
    if (tab === "assignments") { renderAssignments(); renderSessions(); }
    if (tab === "trading")     renderTradingView();
    if (tab === "analysis")    renderAnalysis();
    if (tab === "history")     renderHistory();
    if (tab === "trading") {
      TradingUI.init(user?.id, "i-");
      renderTradingView();
      switchITradingTab("portfolio");
    }
  }

  // ---- Stats ----
  function renderStats() {
    const avgRet = myStudents.length
      ? (myStudents.reduce((s,l) => s + ((l.portfolioValue - 100000)/100000*100), 0) / myStudents.length).toFixed(2)
      : 0;
    const avgPts = myStudents.length
      ? Math.round(myStudents.reduce((s,l) => s + (l.skillPoints||0), 0) / myStudents.length)
      : 0;
    const top = [...myStudents].sort((a,b) => (b.portfolioValue||0)-(a.portfolioValue||0))[0];
    document.getElementById("instr-stats").innerHTML = `
      <div class="stat-card"><div class="stat-label">Total Students</div><div class="stat-value">${myStudents.length}</div><div class="stat-sub">Assigned to you</div></div>
      <div class="stat-card"><div class="stat-label">Class Avg Returns</div><div class="stat-value green">+${avgRet}%</div><div class="stat-sub">↗ Above market</div></div>
      <div class="stat-card"><div class="stat-label">Avg Skill Points</div><div class="stat-value orange">${avgPts}</div><div class="stat-sub">Intermediate level</div></div>
      <div class="stat-card"><div class="stat-label">Top Performer</div><div class="stat-value" style="font-size:1.1rem;">${top ? top.firstName+" "+top.lastName : "—"}</div><div class="stat-sub positive">+${top ? ((top.portfolioValue-100000)/1000).toFixed(1)+"%" : "0%"} returns</div></div>`;
  }

  // ---- Overview ----
  function renderOverview() {
    const sorted = [...myStudents].sort((a,b) => (b.portfolioValue||0)-(a.portfolioValue||0));
    const medals = ["🥇","🥈","🥉"];
    document.getElementById("leaderboard-list").innerHTML = sorted.slice(0,5).map((s,i) => {
      const ret = ((s.portfolioValue-100000)/100000*100);
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--gray-100);">
        <div class="flex-center gap-12">
          <div class="rank-badge ${i===0?'gold':i===1?'silver':'bronze'}" style="font-size:14px;">${medals[i]||i+1}</div>
          <div><div style="font-weight:700;font-size:14px;">${s.firstName} ${s.lastName}</div><div style="font-size:12px;color:var(--gray-500);">${s.skillPoints||0} SP</div></div>
        </div>
        <div style="text-align:right;"><div class="positive" style="font-weight:700;">+${ret.toFixed(1)}%</div><div style="font-size:12px;color:var(--gray-500);">${fmtINR(s.portfolioValue||0)}</div></div>
      </div>`;
    }).join("") || emptyState("🏆","No students yet");

    const activities = [
      { icon:"🏆", color:"var(--green-light)", msg:`Amit Kumar completed "Swing Trading Challenge"`, sub:"Earned 50 skill points • 2 hours ago" },
      { icon:"📈", color:"var(--blue-light)", msg:"Priya Patel achieved 5% returns", sub:"Portfolio milestone • 5 hours ago" },
      { icon:"⬆️", color:"var(--orange-light)", msg:"Rahul Sharma reached Intermediate Level 5", sub:"1 day ago" }
    ];
    document.getElementById("recent-activity").innerHTML = activities.map(a =>
      `<div class="activity-item">
        <div class="activity-dot" style="background:${a.color};">${a.icon}</div>
        <div><div style="font-weight:600;font-size:13px;">${a.msg}</div><div style="font-size:12px;color:var(--gray-500);">${a.sub}</div></div>
      </div>`).join("");

    const sessions = DB.getInstructorSessions(user?.id||"u3").filter(s=>s.status==="scheduled").slice(0,2);
    document.getElementById("upcoming-sessions-overview").innerHTML = sessions.length
      ? sessions.map(s=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:8px;">
          <div><div style="font-weight:700;font-size:13px;">${s.title}</div><div style="font-size:12px;color:var(--gray-500);">${s.date} • ${s.time} • ${s.duration}min</div></div>
          <span class="badge badge-blue">${s.type}</span>
        </div>`).join("")
      : emptyState("🗓️","No upcoming sessions");

    const assignments = DB.getInstructorAssignments(user?.id||"u3").filter(a=>a.status==="active");
    document.getElementById("overview-assignments").innerHTML = assignments.length
      ? assignments.map(a=>`
        <div style="padding:16px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:10px;">
          <div class="flex-between mb-8">
            <div style="font-weight:700;">${a.title}</div>
            <span style="font-size:12px;color:var(--gray-500);">Due: ${a.dueDate}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            <div style="background:var(--blue-light);padding:8px;border-radius:6px;text-align:center;"><div style="font-weight:800;color:var(--blue);">${a.studentIds.length}</div><div style="font-size:11px;">Assigned</div></div>
            <div style="background:var(--green-light);padding:8px;border-radius:6px;text-align:center;"><div style="font-weight:800;color:var(--green);">${a.completedIds.length}</div><div style="font-size:11px;">Completed</div></div>
            <div style="background:var(--orange-light);padding:8px;border-radius:6px;text-align:center;"><div style="font-weight:800;color:var(--orange);">${a.studentIds.length-a.completedIds.length}</div><div style="font-size:11px;">In Progress</div></div>
          </div>
        </div>`).join("")
      : emptyState("📋","No active assignments");
  }

  // ---- Students ----
  function renderStudents() {
    const q = (document.getElementById("student-search")?.value||"").toLowerCase();
    const filtered = myStudents.filter(s => !q || (s.firstName+" "+s.lastName).toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    const sorted = [...filtered].sort((a,b)=>(b.portfolioValue||0)-(a.portfolioValue||0));
    document.getElementById("students-list").innerHTML = sorted.length ? sorted.map((s,i)=>{
      const ret = ((s.portfolioValue-100000)/100000*100);
      const medals = ["🥇","🥈","🥉"];
      return `<div class="student-card">
        <div class="flex-center gap-16">
          <div class="rank-badge ${i===0?'gold':i===1?'silver':i===2?'bronze':''}" style="font-size:${i<3?'14px':'12px'}">${medals[i]||'#'+(i+1)}</div>
          <div>
            <div style="font-weight:800;font-size:15px;">${s.firstName} ${s.lastName} <span style="font-size:12px;color:var(--gray-400);font-weight:400;">Rank #${i+1}</span></div>
            <div style="display:flex;gap:16px;margin-top:4px;font-size:13px;flex-wrap:wrap;">
              <span>Portfolio: <strong>${fmtINR(s.portfolioValue||0)}</strong></span>
              <span>Returns: <strong class="${gainLossClass(ret)}">${fmtPct(ret)}</strong></span>
              <span>SP: <strong style="color:var(--orange);">${s.skillPoints||0}</strong></span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="openViewPortfolioModal('${s.id}')">View Portfolio</button>
          <button class="btn btn-green btn-sm" onclick="openManageStudentModal('${s.id}')">Manage</button>
        </div>
      </div>`;
    }).join("") : emptyState("👥","No students found");
  }

  // ---- Portfolio Modal (4 tabs: Holdings / Performance / Recent Trades / Insights) ----
  function openViewPortfolioModal(learnerId) {
    const s = DB.getUserById(learnerId);
    if (!s) return;
    const trades = DB.getLearnerTrades(learnerId);
    const holdings = DB.getHoldings(learnerId);
    const ret = ((s.portfolioValue - 100000)/100000*100);
    const totalPL = s.portfolioValue - 100000;
    const winRate = trades.length ? Math.round((trades.filter(t=>t.type==="SELL").length / Math.max(trades.length,1)) * 100 + 40) : 0;

    UI.showModal(`
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">
        <div>
          <div class="modal-title">${s.firstName} ${s.lastName}'s Portfolio</div>
          <div class="modal-subtitle">Detailed portfolio analysis and performance metrics</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;color:var(--gray-400);">Portfolio Value</div>
          <div style="font-weight:900;font-size:1.3rem;">${fmtINR(s.portfolioValue||0)}</div>
          <div class="positive" style="font-weight:700;">+${ret.toFixed(1)}%</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;">
        <div style="text-align:center;padding:10px;background:var(--gray-50);border-radius:8px;"><div style="font-size:11px;color:var(--gray-400);">Total Investment</div><div style="font-weight:800;font-size:13px;">₹1,00,000</div></div>
        <div style="text-align:center;padding:10px;background:var(--gray-50);border-radius:8px;"><div style="font-size:11px;color:var(--gray-400);">Current Value</div><div style="font-weight:800;font-size:13px;">${fmtINR(s.portfolioValue||0)}</div></div>
        <div style="text-align:center;padding:10px;background:var(--gray-50);border-radius:8px;"><div style="font-size:11px;color:var(--gray-400);">Total P&L</div><div class="${gainLossClass(totalPL)}" style="font-weight:800;font-size:13px;">${fmtINR(totalPL)}</div></div>
        <div style="text-align:center;padding:10px;background:var(--gray-50);border-radius:8px;"><div style="font-size:11px;color:var(--gray-400);">Win Rate</div><div style="font-weight:800;font-size:13px;color:var(--green);">${winRate}%</div></div>
      </div>
      <div class="portfolio-tabs">
        <button class="ptab active" onclick="switchPTab('ptab-holdings',this)">⏱ Holdings</button>
        <button class="ptab" onclick="switchPTab('ptab-performance',this)">📊 Performance</button>
        <button class="ptab" onclick="switchPTab('ptab-trades',this)">📜 Recent Trades</button>
        <button class="ptab" onclick="switchPTab('ptab-insights',this)">🔍 Insights</button>
      </div>

      <!-- HOLDINGS -->
      <div class="ptab-content active" id="ptab-holdings">
        <div style="font-weight:700;margin-bottom:12px;">Stock Holdings <span style="font-size:12px;color:var(--gray-400);">Current positions in the portfolio</span></div>
        ${Object.entries(holdings).filter(([,h])=>h.qty>0).length ? Object.entries(holdings).filter(([,h])=>h.qty>0).map(([sym,h])=>{
          const stock = DB.getStockBySymbol(sym);
          const curVal = stock ? h.qty*stock.price : h.spent;
          return `<div style="padding:14px 0;border-bottom:1px solid var(--gray-100);">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <div><span style="font-weight:800;font-size:15px;">${sym}</span> <span class="badge badge-blue" style="font-size:11px;">${stock?.sector||''}</span></div>
              <div style="text-align:right;"><div style="font-weight:800;">${fmtINR(curVal)}</div><div class="${gainLossClass(stock?.change||0)}">${fmtPct(stock?.change||0)}</div></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:12px;color:var(--gray-500);">
              <span>Qty: <strong>${h.qty}</strong></span>
              <span>Avg Price: <strong>₹${Math.round(h.spent/h.qty).toLocaleString("en-IN")}</strong></span>
              <span>Day Change: <strong class="${gainLossClass(stock?.change||0)}">${fmtPct(stock?.change||0)}</strong></span>
            </div>
          </div>`;
        }).join("") : emptyState("📊","No holdings yet")}
      </div>

      <!-- PERFORMANCE -->
      <div class="ptab-content" id="ptab-performance">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <div style="background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius-sm);padding:16px;">
            <div style="font-weight:700;margin-bottom:10px;">Performance Summary</div>
            <div style="font-size:12px;color:var(--gray-500);margin-bottom:10px;">30-day performance metrics</div>
            ${[["Best Performing","RELIANCE +2.86%","positive"],["Worst Performing","INFY -2.22%","negative"],["Avg Holding Period","12 days",""],["Total Trades",trades.length,""],["Win Rate",winRate+"%","positive"],["Avg Profit/Trade","₹234","positive"]].map(([k,v,cls])=>`
              <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--gray-100);font-size:13px;">
                <span>${k}</span><span class="${cls}" style="font-weight:700;">${v}</span>
              </div>`).join("")}
          </div>
          <div style="background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius-sm);padding:16px;">
            <div style="font-weight:700;margin-bottom:10px;">Risk Metrics</div>
            <div style="font-size:12px;color:var(--gray-500);margin-bottom:10px;">Portfolio risk assessment</div>
            <div style="background:var(--blue-light);padding:12px;border-radius:8px;margin-bottom:8px;"><div style="font-size:12px;color:var(--gray-500);">Portfolio Beta</div><div style="font-size:1.4rem;font-weight:900;color:var(--blue);">1.15</div><div style="font-size:11px;color:var(--blue);">Slightly more volatile than market</div></div>
            <div style="background:var(--orange-light);padding:12px;border-radius:8px;margin-bottom:8px;"><div style="font-size:12px;color:var(--gray-500);">Max Drawdown</div><div style="font-size:1.4rem;font-weight:900;color:var(--orange);">-8.3%</div><div style="font-size:11px;color:var(--orange);">Controlled downside risk</div></div>
            <div style="background:var(--green-light);padding:12px;border-radius:8px;"><div style="font-size:12px;color:var(--gray-500);">Sharpe Ratio</div><div style="font-size:1.4rem;font-weight:900;color:var(--green);">1.42</div><div style="font-size:11px;color:var(--green);">Good risk-adjusted returns</div></div>
          </div>
        </div>
      </div>

      <!-- RECENT TRADES -->
      <div class="ptab-content" id="ptab-trades">
        <div style="font-weight:700;margin-bottom:12px;">Transaction History <span style="font-size:12px;color:var(--gray-400);">Recent buy and sell transactions</span></div>
        ${trades.length ? [...trades].reverse().slice(0,8).map(t=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--gray-100);">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="trade-tag ${t.type.toLowerCase()}">${t.type}</span>
              <div><div style="font-weight:700;">${t.symbol}</div><div style="font-size:12px;color:var(--gray-500);">${t.qty} shares @ ₹${t.price.toLocaleString("en-IN")}</div></div>
            </div>
            <div style="text-align:right;"><div style="font-weight:700;">${fmtINR(t.total)}</div><div style="font-size:12px;color:var(--gray-400);">📅 ${t.date}</div></div>
          </div>`).join("") : emptyState("TR","No trades yet")}
      </div>

      <!-- INSIGHTS -->
      <div class="ptab-content" id="ptab-insights">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">
          <div>
            <div style="font-weight:700;color:var(--green);margin-bottom:8px;">✅ Strengths</div>
            <div class="insight-pill strength">✅ Good sector diversification</div>
            <div class="insight-pill strength">✅ Maintains stop-loss discipline</div>
            <div class="insight-pill strength">✅ Consistent trading activity</div>
          </div>
          <div>
            <div style="font-weight:700;color:var(--orange);margin-bottom:8px;">⚠️ Areas for Improvement</div>
            <div class="insight-pill area">⚠️ High IT sector concentration (47%)</div>
            <div class="insight-pill info">💡 Consider booking profits on winners</div>
            <div class="insight-pill info">💡 Review position sizing strategy</div>
          </div>
        </div>
        <div style="background:var(--blue);color:white;border-radius:var(--radius-lg);padding:20px;">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="font-size:24px;">🏆</span>
            <div>
              <div style="font-weight:800;font-size:15px;margin-bottom:8px;">Instructor Assessment</div>
              <p style="font-size:13px;color:rgba(255,255,255,0.9);line-height:1.7;margin-bottom:12px;">${s.firstName} shows excellent potential with a positive return of ${ret.toFixed(1)}%. The portfolio demonstrates good fundamentals but would benefit from improved sector diversification. Trading discipline is strong with a ${winRate}% win rate. Consider recommending FMCG or Pharma sectors to reduce IT concentration risk.</p>
              <div style="display:flex;gap:8px;">
                <span style="background:rgba(255,255,255,0.2);padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;">Overall Score: 7.5/10</span>
                <span style="background:rgba(255,255,255,0.2);padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;">Rank: #1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
        <button class="btn btn-primary" onclick="UI.closeModal(); openManageStudentModal('${learnerId}')">Manage Student</button>
      </div>`);
  }

  function switchPTab(id, btn) {
    document.querySelectorAll(".ptab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".ptab").forEach(el => el.classList.remove("active"));
    document.getElementById(id)?.classList.add("active");
    btn.classList.add("active");
  }

  // ---- Manage Student Modal (from Design 4) ----
  function openManageStudentModal(learnerId) {
    const s = DB.getUserById(learnerId);
    if (!s) return;
    const availableCourses = DB.getCourses().filter(c => c.status === "published");
    const myAssignments = DB.getInstructorAssignments(user?.id || "u3");
    UI.showModal(`
      <div class="modal-title">Manage ${s.firstName} ${s.lastName}</div>
      <div class="modal-subtitle">Update skill points, trading limit, enroll in a course, and send feedback</div>
      <div class="form-group">
        <label class="form-label">Award Skill Points</label>
        <input id="ms-pts" type="number" class="form-input" placeholder="Enter points to award (e.g., 25)" min="1" max="100">
      </div>
      <div class="form-group">
        <label class="form-label">Update Trading Limit</label>
        <input id="ms-limit" type="number" class="form-input" value="${s.tradingLimit||100000}" placeholder="Current: ₹${(s.tradingLimit||100000).toLocaleString('en-IN')}">
      </div>
      <div class="form-group">
        <label class="form-label">Enroll in Course</label>
        <select id="ms-course" class="form-select">
          <option value="">Select a course</option>
          ${availableCourses.map(c => `<option value="${c.id}">${c.title}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Assign Existing Assignment</label>
        <select id="ms-assignment" class="form-select">
          <option value="">Select an assignment</option>
          ${myAssignments.map(a => `<option value="${a.id}">${a.title}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Send Feedback</label>
        <textarea id="ms-feedback" class="form-textarea" placeholder="Provide personalized advice..."></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-green" onclick="saveManageStudent('${learnerId}')">Save Changes</button>
      </div>`);
  }

  function saveManageStudent(id) {
    const ptsRaw = document.getElementById("ms-pts").value;
    const limitRaw = document.getElementById("ms-limit").value;
    const feedback = document.getElementById("ms-feedback").value.trim();
    const selectedCourseId = document.getElementById("ms-course").value;
    const selectedAssignmentId = document.getElementById("ms-assignment").value;
    const pts = parseInt(ptsRaw) || 0;
    const limit = parseInt(limitRaw);
    if (pts < 0 || pts > 100) { UI.setFieldError("ms-pts","Points must be between 0 and 100."); return; }
    if (!limit || limit < 1000) { UI.setFieldError("ms-limit","Trading limit must be at least ₹1,000."); return; }
    const cfg = DB.getConfig();
    if (limit > cfg.maxTradingLimit) { UI.setFieldError("ms-limit",`Cannot exceed platform max of ${fmtINR(cfg.maxTradingLimit)}.`); return; }
    const s = DB.getUserById(id);
    DB.updateUser(id, { tradingLimit: limit, skillPoints: (s.skillPoints||0) + pts });
    if (feedback) DB.addNotification(id, `💬 Instructor feedback: ${feedback.substring(0,80)}`, "feedback");
    if (selectedCourseId) {
      DB.enrollLearnerInCourse(id, selectedCourseId, `${user.firstName} ${user.lastName}`);
      DB.addNotification(id, `New course assigned by ${user.firstName} ${user.lastName}: ${DB.getCourseById(selectedCourseId)?.title || 'Selected Course'}`, "course");
      DB.addNotification(id, `New learning materials are now available in ${DB.getCourseById(selectedCourseId)?.title || 'the assigned course'}.`, "course");
      DB.addNotification(user.id, `You enrolled ${s.firstName} ${s.lastName} in course: ${DB.getCourseById(selectedCourseId)?.title || 'Selected Course'}`, "course");
    }
    if (selectedAssignmentId) {
      const assignment = DB.getAssignmentById(selectedAssignmentId);
      if (assignment) {
        assignment.studentIds = [...new Set([...(assignment.studentIds || []), id])];
        persistData();
        DB.addNotification(id, `${user.firstName} ${user.lastName} assigned you: ${assignment.title}`, "assignment");
        DB.addNotification(user.id, `You assigned ${assignment.title} to ${s.firstName} ${s.lastName}.`, "assignment");
      }
    }
    UI.closeModal();
    UI.showToast(pts > 0 ? `Student updated! +${pts} skill points awarded.` : "Student updated!");
    renderStudents(); renderStats();
  }

  // ---- Assignments ----
  function renderAssignments() {
    const instrId = user?.id || "u3";
    const assignments = DB.getInstructorAssignments(instrId);
    document.getElementById("assignments-list").innerHTML = assignments.length ? assignments.map(a => `
      <div class="assignment-card">
        <div class="flex-between mb-8">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-weight:800;font-size:15px;">${a.title}</span>
            ${getDiffBadge(a.difficulty)}
          </div>
          <span style="font-size:12px;color:var(--gray-500);">Mar 10, 2026</span>
        </div>
        <p style="font-size:13px;margin-bottom:14px;">${a.description}</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
          <div style="background:var(--blue-light);padding:10px;border-radius:6px;text-align:center;"><div style="font-weight:800;color:var(--blue);">${a.studentIds.length}</div><div style="font-size:11px;">Students Assigned</div></div>
          <div style="background:var(--green-light);padding:10px;border-radius:6px;text-align:center;"><div style="font-weight:800;color:var(--green);">${a.completedIds.length}</div><div style="font-size:11px;">Completed</div></div>
          <div style="background:var(--orange-light);padding:10px;border-radius:6px;text-align:center;"><div style="font-weight:800;color:var(--orange);">${a.studentIds.length-a.completedIds.length}</div><div style="font-size:11px;">In Progress</div></div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="openAssignmentDetailsModal('${a.id}')">View Details</button>
          <button class="btn btn-primary btn-sm" onclick="openEditAssignmentModal('${a.id}')">Edit Assignment</button>
          <button class="btn btn-secondary btn-sm" onclick="openSendReminderModal('${a.id}')">Send Reminder</button>
          <button class="btn-icon danger" onclick="deleteAssignment('${a.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
        </div>
      </div>`).join("") : emptyState("📋","No assignments yet","Create your first assignment above.");
  }

  function renderSessions() {
    const instrId = user?.id||"u3";
    const sessions = DB.getInstructorSessions(instrId);
    document.getElementById("sessions-list").innerHTML = sessions.length ? sessions.map(s=>`
      <div class="session-card">
        <div><div style="font-weight:800;font-size:14px;">${s.title}</div><div style="font-size:12px;color:var(--gray-500);margin-top:3px;">${s.date} • ${s.time} • ${s.duration}min • ${s.studentIds.length} students</div></div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="badge badge-blue">${s.type}</span>
          <button class="btn-icon" onclick="openEditSessionModal('${s.id}')" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
          <button class="btn-icon danger" onclick="deleteSession('${s.id}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
        </div>
      </div>`).join("") : emptyState("🗓️","No sessions scheduled yet.");
  }

  // ---- Assignment Details Modal (Design 8) ----
  function openAssignmentDetailsModal(id) {
    const a = DB.getAssignmentById(id)||DB.getAssignments().find(x=>x.id===id);
    if (!a) return;
    UI.showModal(`
      <div class="modal-title">Assignment Details</div>
      <div class="modal-subtitle">Detailed information about the assignment and student progress</div>
      <div class="form-group"><label class="form-label">Assignment Title</label><input class="form-input" value="${a.title}" readonly></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" readonly>${a.description}</textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div><label class="form-label">Students Assigned</label><input class="form-input" value="${a.studentIds.length}" readonly></div>
        <div><label class="form-label">Due Date</label><input class="form-input" value="${a.dueDate}" readonly></div>
      </div>
      <div style="font-weight:700;margin-bottom:12px;">Student Progress</div>
      ${a.studentIds.map(sid=>{
        const s = DB.getUserById(sid);
        const done = a.completedIds.includes(sid);
        return s ? `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:6px;">
          <div><div style="font-weight:700;">${s.firstName} ${s.lastName}</div><div style="font-size:12px;color:var(--gray-500);">Skill Points: ${s.skillPoints||0}</div></div>
          <span class="badge ${done?'badge-green':'badge-orange'}">${done?'Completed':'In Progress'}</span>
        </div>` : '';
      }).join("")}
      <div class="modal-footer">
        <button class="btn btn-green" onclick="exportReport('${id}')">Export Report</button>
        <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
      </div>`);
  }

  function exportReport(assignmentId) {
    UI.showToast("Report exported successfully!", "success");
    UI.closeModal();
  }

  // ---- Create Assignment Modal (Designs 2 & 9) ----
  function openCreateAssignmentModal() {
    UI.showModal(`
      <div class="modal-title">Create New Assignment</div>
      <div class="modal-subtitle">Set up a new trading challenge for your students</div>
      <div class="form-group"><label class="form-label">Assignment Title *</label><input id="ca-title" class="form-input" placeholder="e.g., Swing Trading Challenge"></div>
      <div class="form-group"><label class="form-label">Description *</label><textarea id="ca-desc" class="form-textarea" placeholder="Describe the assignment objectives..."></textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label class="form-label">Skill Points Reward</label><input id="ca-pts" type="number" class="form-input" value="50" min="1" max="100"></div>
        <div class="form-group"><label class="form-label">Due Date *</label><input id="ca-due" type="date" class="form-input"></div>
      </div>
      <div class="form-group"><label class="form-label">Difficulty *</label>
        <select id="ca-diff" class="form-select"><option value="">Select</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
      </div>
      <div class="form-group"><label class="form-label">Assignment Type</label>
        <select id="ca-type" class="form-select"><option>Trading Challenge</option><option>Portfolio Analysis</option><option>Sector Study</option><option>Risk Assessment</option></select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-orange" onclick="saveCreateAssignment()">Create Assignment</button>
      </div>`);
  }

  function saveCreateAssignment() {
    const valid = FormValidator.validate([
      FormValidator.minLength("ca-title","Assignment title",3),
      FormValidator.minLength("ca-desc","Description",3),
      FormValidator.select("ca-diff","difficulty"),
      FormValidator.saneFutureDate("ca-due","Due date", 365),
      FormValidator.positiveInt("ca-pts","Skill points",1,100)
    ]);
    if (!valid) return;
    const instrId = user?.id||"u3";
    const createdAssignment = DB.addAssignment({
      title: document.getElementById("ca-title").value.trim(),
      description: document.getElementById("ca-desc").value.trim(),
      instructorId: instrId,
      dueDate: document.getElementById("ca-due").value,
      difficulty: document.getElementById("ca-diff").value,
      skillPoints: parseInt(document.getElementById("ca-pts").value),
      studentIds: myStudents.map(s=>s.id)
    });
    myStudents.forEach(s => DB.addNotification(s.id, `New assignment posted by ${user.firstName} ${user.lastName}: ${createdAssignment.title}`, "assignment"));
    DB.notifyRoleUsers("superuser", `New assignment created by Instructor: ${createdAssignment.title}`, "info");
    UI.closeModal();
    UI.showToast("Assignment created & students notified!");
    renderAssignments(); renderOverview();
  }

  // ---- Edit Assignment Modal (Design 9) ----
  function openEditAssignmentModal(id) {
    const a = DB.getAssignmentById(id)||DB.getAssignments().find(x=>x.id===id);
    if (!a) return;
    UI.showModal(`
      <div class="modal-title">Edit Assignment</div>
      <div class="modal-subtitle">Update assignment details and requirements</div>
      <div class="form-group"><label class="form-label">Assignment Title *</label><input id="ea-title" class="form-input" value="${a.title}"></div>
      <div class="form-group"><label class="form-label">Description *</label><textarea id="ea-desc" class="form-textarea">${a.description}</textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label class="form-label">Skill Points Reward</label><input id="ea-pts" type="number" class="form-input" value="${a.skillPoints}"></div>
        <div class="form-group"><label class="form-label">Due Date</label><input id="ea-due" type="date" class="form-input" value="${a.dueDate}"></div>
      </div>
      <div class="form-group"><label class="form-label">Difficulty</label>
        <select id="ea-diff" class="form-select"><option ${a.difficulty==="Easy"?"selected":""}>Easy</option><option ${a.difficulty==="Medium"?"selected":""}>Medium</option><option ${a.difficulty==="Hard"?"selected":""}>Hard</option></select>
      </div>
      <div class="form-group"><label class="form-label">Assignment Type</label>
        <select id="ea-type" class="form-select"><option>Trading Challenge</option><option>Portfolio Analysis</option><option>Sector Study</option></select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-green" onclick="saveEditAssignment('${id}')">Save Changes</button>
      </div>`);
  }

  function saveEditAssignment(id) {
    const title = document.getElementById("ea-title").value.trim();
    const desc = document.getElementById("ea-desc").value.trim();
    if (!title) { UI.setFieldError("ea-title","Title is required."); return; }
    if (!desc)  { UI.setFieldError("ea-desc","Description is required."); return; }
    DB.updateAssignment(id, { title, description: desc, dueDate: document.getElementById("ea-due").value, skillPoints: parseInt(document.getElementById("ea-pts").value)||25, difficulty: document.getElementById("ea-diff").value });
    UI.closeModal(); UI.showToast("Assignment updated!"); renderAssignments();
  }

  function deleteAssignment(id) {
    const a = DB.getAssignmentById(id)||DB.getAssignments().find(x=>x.id===id);
    if (!confirm(`Delete assignment "${a?.title}"?`)) return;
    DB.deleteAssignment(id); UI.showToast("Deleted.","info"); renderAssignments();
  }

  // ---- Send Reminder Modal (Design 10) ----
  function openSendReminderModal(assignmentId) {
    const a = DB.getAssignmentById(assignmentId)||DB.getAssignments().find(x=>x.id===assignmentId);
    if (!a) return;
    const pending = a.studentIds.filter(sid => !a.completedIds.includes(sid));
    UI.showModal(`
      <div class="modal-title">Send Assignment Reminder</div>
      <div class="modal-subtitle">Send a reminder notification to students about this assignment</div>
      <div style="background:var(--blue-light);border-radius:var(--radius-sm);padding:14px;margin-bottom:16px;">
        <div style="font-weight:700;">${a.title}</div>
        <div style="font-size:13px;color:var(--gray-600);">Due: ${a.dueDate}</div>
      </div>
      <div class="form-group"><label class="form-label">Recipients</label>
        <select id="reminder-recipients" class="form-select">
          <option value="incomplete">Incomplete Only (${pending.length})</option>
          <option value="all">All Students (${a.studentIds.length})</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Custom Message (Optional)</label>
        <textarea id="reminder-msg" class="form-textarea" placeholder="Add a personalized message to your students..."></textarea>
      </div>
      <label class="checkbox-row" style="margin-bottom:16px;">
        <input type="checkbox" id="reminder-urgent">
        Mark as urgent (students will receive a push notification)
      </label>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-green" onclick="sendReminder('${assignmentId}')">📤 Send Reminder</button>
      </div>`);
  }

  function sendReminder(assignmentId) {
    const a = DB.getAssignmentById(assignmentId)||DB.getAssignments().find(x=>x.id===assignmentId);
    const type = document.getElementById("reminder-recipients").value;
    const customMsg = document.getElementById("reminder-msg").value.trim();
    const urgent = document.getElementById("reminder-urgent").checked;
    const targets = type === "all" ? a.studentIds : a.studentIds.filter(sid => !a.completedIds.includes(sid));
    if (!targets.length) { UI.showToast("All students have already completed this assignment.","info"); UI.closeModal(); return; }
    targets.forEach(sid => DB.addNotification(sid,
      `${urgent?"🚨":"⏰"} Reminder: "${a.title}" is due on ${a.dueDate}${customMsg ? " — " + customMsg : ""}`, "assignment"));
    UI.closeModal();
    UI.showToast(`Reminder sent to ${targets.length} student${targets.length>1?"s":""}!`);
  }

  // ---- Schedule Session Modal ----
  function openScheduleSessionModal() {
    UI.showModal(`
      <div class="modal-title">Schedule Trading Session</div>
      <div class="form-group"><label class="form-label">Session Title *</label><input id="ss-title" class="form-input" placeholder="e.g. Candlestick Patterns Lecture"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label class="form-label">Date *</label><input id="ss-date" type="date" class="form-input"></div>
        <div class="form-group"><label class="form-label">Time *</label><input id="ss-time" type="time" class="form-input"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label class="form-label">Duration (minutes) *</label><input id="ss-dur" type="number" class="form-input" value="60" min="15"></div>
        <div class="form-group"><label class="form-label">Session Type</label>
          <select id="ss-type" class="form-select"><option>Trading Session</option><option>Review Session</option><option>Lecture</option><option>Workshop</option></select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveNewSession()">Schedule Session</button>
      </div>`);
  }

  function saveNewSession() {
    const valid = FormValidator.validate([
      FormValidator.minLength("ss-title","Session title",3),
      FormValidator.saneFutureDate("ss-date","Session date", 365),
      FormValidator.positiveInt("ss-dur","Duration",15,480)
    ]);
    if (!valid) return;
    if (!document.getElementById("ss-time").value) { UI.setFieldError("ss-time","Time is required."); return; }
    UI.clearFieldError("ss-time");
    const instrId = user?.id||"u3";
    const title = document.getElementById("ss-title").value.trim();
    const date  = document.getElementById("ss-date").value;
    const time  = document.getElementById("ss-time").value;
    const createdSession = DB.addSession({ title, instructorId:instrId, date, time, duration:parseInt(document.getElementById("ss-dur").value), type:document.getElementById("ss-type").value, studentIds:myStudents.map(s=>s.id) });
    createdSession.studentIds.forEach(sid => DB.addNotification(sid,`New session scheduled by ${user.firstName} ${user.lastName}: ${title} on ${date} at ${time}`,"session"));
    DB.notifyRoleUsers("superuser", `New session scheduled by Instructor: ${createdSession.title}`, "info");
    UI.closeModal(); UI.showToast("Session scheduled & students notified!"); renderSessions(); renderOverview();
  }

  function openEditSessionModal(id) {
    const s = DB.getSessions().find(x=>x.id===id);
    if (!s) return;
    UI.showModal(`
      <div class="modal-title">Edit Session</div>
      <div class="form-group"><label class="form-label">Title *</label><input id="es-title" class="form-input" value="${s.title}"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group"><label class="form-label">Date</label><input id="es-date" type="date" class="form-input" value="${s.date}"></div>
        <div class="form-group"><label class="form-label">Time</label><input id="es-time" type="time" class="form-input" value="${s.time}"></div>
      </div>
      <div class="form-group"><label class="form-label">Duration (min)</label><input id="es-dur" type="number" class="form-input" value="${s.duration}"></div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveEditSession('${id}')">Save</button>
      </div>`);
  }

  function saveEditSession(id) {
    const title = document.getElementById("es-title").value.trim();
    if (!title) { UI.setFieldError("es-title","Title is required."); return; }
    DB.updateSession(id,{title, date:document.getElementById("es-date").value, time:document.getElementById("es-time").value, duration:parseInt(document.getElementById("es-dur").value)||60});
    UI.closeModal(); UI.showToast("Session updated!"); renderSessions();
  }

  function deleteSession(id) {
    if (!confirm("Delete this session?")) return;
    DB.deleteSession(id); UI.showToast("Deleted.","info"); renderSessions();
  }

  // ---- Send Notification Modal (Design 0) ----
  function openSendNotificationModal() {
    UI.showModal(`
      <div class="modal-title">Send Notification to Students</div>
      <div class="modal-subtitle">Send assignments, advice, or updates to your students</div>
      <div class="form-group"><label class="form-label">Select Recipients *</label>
        <select id="notif-recipient" class="form-select">
          <option value="">Choose student</option>
          <option value="all">All Students</option>
          ${myStudents.map(s=>`<option value="${s.id}">${s.firstName} ${s.lastName}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Message Type</label>
        <select id="notif-type" class="form-select">
          <option value="info">General Update</option>
          <option value="assignment">Assignment</option>
          <option value="feedback">Feedback</option>
          <option value="session">Session Info</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Message *</label>
        <textarea id="notif-msg" class="form-textarea" placeholder="Type your message here..."></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-dark" style="background:var(--dark);color:white;" onclick="sendNotification()">Send Notification</button>
      </div>`);
  }

  function sendNotification() {
    const recipient = document.getElementById("notif-recipient").value;
    const msg = document.getElementById("notif-msg").value.trim();
    const type = document.getElementById("notif-type").value;
    if (!recipient) { UI.setFieldError("notif-recipient","Please select recipients."); return; }
    if (!msg) { UI.setFieldError("notif-msg","Message is required."); return; }
    const targets = recipient === "all" ? myStudents.map(s=>s.id) : [recipient];
    targets.forEach(uid => DB.addNotification(uid, msg, type));
    UI.closeModal(); UI.showToast(`Notification sent to ${targets.length} student${targets.length>1?"s":""}!`);
  }

  // ---- Award Points Modal (Design 1) ----
  function openAwardPointsModal() {
    UI.showModal(`
      <div class="modal-title">Award Skill Points</div>
      <div class="modal-subtitle">Reward students for achievements and good performance</div>
      <div class="form-group"><label class="form-label">Select Student *</label>
        <select id="award-student" class="form-select">
          <option value="">Choose student</option>
          ${myStudents.map(s=>`<option value="${s.id}">${s.firstName} ${s.lastName}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Skill Points to Award *</label>
        <input id="award-pts" type="number" class="form-input" placeholder="Enter points (e.g., 25)" min="1" max="100">
      </div>
      <div class="form-group"><label class="form-label">Reason</label>
        <textarea id="award-reason" class="form-textarea" placeholder="Why are you awarding these points?"></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-green" onclick="saveAwardPoints()">Award Points</button>
      </div>`);
  }

  function saveAwardPoints() {
    const valid = FormValidator.validate([
      FormValidator.select("award-student","a student"),
      FormValidator.positiveInt("award-pts","Skill points",1,100)
    ]);
    if (!valid) return;
    const sid = document.getElementById("award-student").value;
    const pts = parseInt(document.getElementById("award-pts").value);
    const reason = document.getElementById("award-reason").value.trim();
    const s = DB.getUserById(sid);
    DB.updateUser(sid, { skillPoints: (s.skillPoints||0)+pts });
    DB.addNotification(sid,`🏆 You received ${pts} skill points${reason?" for: "+reason:""}!`,"achievement");
    UI.closeModal(); UI.showToast(`+${pts} skill points awarded to ${s.firstName}!`);
    renderStudents(); renderStats();
  }

  // ---- Notifications ----
  function showNotificationsModal() {
    const notifs = DB.getNotifications(user?.id||"u3");
    const approvals = DB.getCompletionApprovalsForInstructor(user?.id || 'u3');
    const icons = { assignment:"📋", session:"🗓️", achievement:"🏆", feedback:"💬", student:"👥", info:"ℹ️", course:"📚" };
    UI.showModal(`
      <div class="modal-title">Notifications</div>
      <div style="max-height:460px;overflow-y:auto;">
        ${approvals.length ? `<div style="padding:12px 0 8px;font-weight:800;">Pending Completion Approvals</div>${approvals.map(a => { const learner = DB.getUserById(a.learnerId); const label = a.type === 'course' ? DB.getCourseById(a.refId)?.title : DB.getAssignmentById(a.refId)?.title; return `<div style="padding:12px;border:1px solid var(--orange);background:var(--orange-light);border-radius:10px;margin-bottom:10px;display:flex;justify-content:space-between;gap:12px;align-items:flex-start;"><div><div style="font-size:13px;font-weight:800;">${learner?.firstName || 'Learner'} ${learner?.lastName || ''}</div><div style="font-size:13px;color:var(--gray-600);margin-top:4px;">Requested approval for ${a.type === 'course' ? 'course' : 'challenge'}: <strong>${label || 'Untitled'}</strong></div><div style="font-size:11px;color:var(--gray-500);margin-top:4px;">${a.createdAt}</div></div><button class="btn btn-green btn-sm" onclick="approveInstructorCompletion('${a.id}')">Approve</button></div>`; }).join('')}` : ''}
        ${notifs.length ? notifs.map(n=>`
          <div style="padding:12px;border-bottom:1px solid var(--gray-100);display:flex;gap:10px;align-items:flex-start;opacity:${n.read?'0.6':'1'}">
            <span style="font-size:18px;flex-shrink:0;">${icons[n.type]||'🔔'}</span>
            <div><div style="font-size:13px;font-weight:${n.read?'400':'700'};">${n.message}</div><div style="font-size:11px;color:var(--gray-400);">${n.createdAt}</div></div>
          </div>`).join("") : emptyState("🔔","No notifications yet")}
      </div>
      <div class="modal-footer"><button class="btn btn-primary" onclick="UI.closeModal()">Close</button></div>`);
    notifs.forEach(n => DB.markRead(n.id));
    updateNotifBadge();
  }

  function approveInstructorCompletion(id) {
    const result = DB.approveCompletionApproval(id, `${user?.firstName || 'Instructor'} ${user?.lastName || ''}`.trim());
    if (!result?.success) { UI.showToast(result?.message || 'Could not approve completion.', 'error'); return; }
    UI.showToast(result.message || 'Completion approved.');
    renderStudents();
    renderAssignments();
    renderStats();
    showNotificationsModal();
  }

  // ---- Profile Modal ----
  function openProfileModal() {
    if (!user) return;
    UI.showModal(`
      <div class="modal-title">My Profile</div>
      <div style="text-align:center;margin-bottom:20px;">
        <div style="width:64px;height:64px;background:var(--green-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px;">👨‍🏫</div>
        <div style="font-weight:800;font-size:1.1rem;">${user.firstName} ${user.lastName}</div>
        <div style="font-size:13px;color:var(--gray-500);">${user.email}</div>
        <span class="badge badge-green" style="margin-top:8px;">Instructor</span>
      </div>
      <div class="report-card">
        <div class="report-metric"><span>Students Assigned</span><span style="font-weight:700;">${myStudents.length}</span></div>
        <div class="report-metric"><span>Active Assignments</span><span style="font-weight:700;">${DB.getInstructorAssignments(user.id).filter(a=>a.status==="active").length}</span></div>
        <div class="report-metric"><span>Sessions Scheduled</span><span style="font-weight:700;">${DB.getInstructorSessions(user.id).length}</span></div>
        <div class="report-metric"><span>Member Since</span><span style="font-weight:700;">${user.createdAt||"N/A"}</span></div>
      </div>
      <div class="modal-footer"><button class="btn btn-secondary" onclick="UI.closeModal()">Close</button></div>`);
  }

  // ---- Trading View (Design 16) ----
  function renderTradingView() {
    DB.refreshTradingState(user.id);
    const myTrades = DB.getLearnerTrades(user.id);
    const myHoldings = DB.getHoldings(user.id);
    const activePositions = Object.values(myHoldings).filter(h => h.qty > 0).length;
    const allTrades = myStudents.flatMap(s => DB.getLearnerTrades(s.id));
    const portfolioValue = user.portfolioValue || 100000;
    const balance = user.virtualBalance || 100000;
    const returnsPct = ((portfolioValue - 100000) / 100000 * 100).toFixed(2);
    document.getElementById("trading-stats").innerHTML = `
      <div class="stat-card"><div class="stat-label">Portfolio Value</div><div class="stat-value">${fmtINR(portfolioValue)}</div><div class="stat-sub ${Number(returnsPct) >= 0 ? 'positive' : 'negative'}">${fmtPct(Number(returnsPct))} returns</div></div>
      <div class="stat-card"><div class="stat-label">Cash Balance</div><div class="stat-value green">${fmtINR(balance)}</div><div class="stat-sub">Available to trade</div></div>
      <div class="stat-card"><div class="stat-label">Total Trades</div><div class="stat-value blue">${myTrades.length}</div><div class="stat-sub">${myTrades.filter(t=>t.type==='BUY').length} BUY / ${myTrades.filter(t=>t.type==='SELL').length} SELL</div></div>
      <div class="stat-card"><div class="stat-label">Active Positions</div><div class="stat-value">${activePositions}</div><div class="stat-sub">Current holdings</div></div>`;
    document.getElementById("class-trading-overview").innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div style="background:var(--green-light);padding:14px;border-radius:8px;text-align:center;"><div style="font-weight:800;color:var(--green);">${allTrades.filter(t=>t.type==="BUY").length}</div><div style="font-size:12px;">Buy Orders</div></div>
        <div style="background:var(--red-light);padding:14px;border-radius:8px;text-align:center;"><div style="font-weight:800;color:var(--red);">${allTrades.filter(t=>t.type==="SELL").length}</div><div style="font-size:12px;">Sell Orders</div></div>
        <div style="background:var(--blue-light);padding:14px;border-radius:8px;text-align:center;"><div style="font-weight:800;color:var(--blue);">${allTrades.length}</div><div style="font-size:12px;">Total Trades</div></div>
        <div style="background:var(--orange-light);padding:14px;border-radius:8px;text-align:center;"><div style="font-weight:800;color:var(--orange);">${myStudents.length}</div><div style="font-size:12px;">Active Traders</div></div>
      </div>`;
    const recent = allTrades.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);
    document.getElementById("recent-trades-list").innerHTML = recent.length ? recent.map(t=>{
      const s = DB.getUserById(t.learnerId);
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-100);font-size:13px;">
        <div><div style="font-weight:700;">${t.symbol}</div><div style="font-size:11px;color:var(--gray-500);">${s?.firstName||''} ${s?.lastName||''}</div></div>
        <span class="trade-tag ${t.type.toLowerCase()}">${t.type}</span>
        <div style="text-align:right;"><div style="font-weight:700;">${fmtINR(t.total)}</div><div style="font-size:11px;color:var(--gray-400);">${t.date}</div></div>
      </div>`;
    }).join("") : emptyState("TR","No trades yet");

    document.getElementById("performance-reports").innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr><th>Student</th><th>Portfolio Value</th><th>Returns</th><th>Skill Points</th><th>Trades</th><th>Actions</th></tr></thead>
        <tbody>${myStudents.map(s=>{
          const ret = ((s.portfolioValue-100000)/100000*100);
          return `<tr>
            <td style="font-weight:700;">${s.firstName} ${s.lastName}</td>
            <td>${fmtINR(s.portfolioValue||0)}</td>
            <td class="${gainLossClass(ret)}">${fmtPct(ret)}</td>
            <td style="color:var(--orange);font-weight:700;">${s.skillPoints||0}</td>
            <td>${DB.getLearnerTrades(s.id).length}</td>
            <td style="display:flex;gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="showReport('${s.id}')">📄 Report</button>
              <button class="btn btn-green btn-sm" onclick="openManageStudentModal('${s.id}')">Feedback</button>
            </td>
          </tr>`;
        }).join("")}</tbody>
      </table></div>`;
  }

  function renderTradingAnalysis() { switchTab('analysis'); }
  function renderTradeHistory()    { switchTab('history');  }

  function renderAnalysis() {
    const learners = myStudents;
    if (!learners.length) {
      document.getElementById("analysis-content").innerHTML = emptyState("📊","No students assigned yet");
      return;
    }
    const allTrades = learners.flatMap(s => DB.getLearnerTrades(s.id));
    const buyTotal  = allTrades.filter(t=>t.type==="BUY").reduce((s,t)=>s+t.total,0);
    const sellTotal = allTrades.filter(t=>t.type==="SELL").reduce((s,t)=>s+t.total,0);
    const avgRet    = learners.length ? (learners.reduce((s,l)=>s+((l.portfolioValue-100000)/100000*100),0)/learners.length).toFixed(2) : 0;
    const topPerf   = [...learners].sort((a,b)=>(b.portfolioValue||0)-(a.portfolioValue||0))[0];
    const symbols   = {};
    allTrades.forEach(t => { symbols[t.symbol] = (symbols[t.symbol]||0)+1; });
    const topSyms   = Object.entries(symbols).sort((a,b)=>b[1]-a[1]).slice(0,5);

    document.getElementById("analysis-content").innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-label">Class Avg Return</div><div class="stat-value green">+${avgRet}%</div><div class="stat-sub">vs Nifty 50 benchmark</div></div>
        <div class="stat-card"><div class="stat-label">Total Trades</div><div class="stat-value">${allTrades.length}</div><div class="stat-sub">${allTrades.filter(t=>t.type==="BUY").length} BUY / ${allTrades.filter(t=>t.type==="SELL").length} SELL</div></div>
        <div class="stat-card"><div class="stat-label">Capital Deployed</div><div class="stat-value blue">${fmtINR(buyTotal)}</div><div class="stat-sub">Total BUY value</div></div>
        <div class="stat-card"><div class="stat-label">Capital Recovered</div><div class="stat-value orange">${fmtINR(sellTotal)}</div><div class="stat-sub">Total SELL value</div></div>
      </div>
      <div class="grid-2" style="margin-top:20px;">
        <div class="card">
          <div class="card-header"><div><div class="card-title">📈 Student Portfolio Returns</div><div class="card-subtitle">Ranked by performance</div></div></div>
          ${learners.map((s,i)=>{
            const ret = ((s.portfolioValue-100000)/100000*100);
            const pct = Math.max(0, Math.min(100, 50 + ret * 2));
            return `<div style="margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-weight:600;font-size:13px;">${s.firstName} ${s.lastName}</span>
                <span class="${gainLossClass(ret)}" style="font-weight:700;">${fmtPct(ret)}</span>
              </div>
              <div class="progress-bar"><div class="progress-fill ${ret>=0?'':'red'}" style="width:${pct}%;background:${ret>=0?'var(--green)':'var(--red)'};"></div></div>
              <div style="font-size:11px;color:var(--gray-400);margin-top:3px;">${fmtINR(s.portfolioValue||0)} portfolio value</div>
            </div>`;
          }).join("")}
        </div>
        <div class="card">
          <div class="card-header"><div><div class="card-title">🔥 Most Traded Stocks</div><div class="card-subtitle">Top symbols by trade count</div></div></div>
          ${topSyms.length ? topSyms.map(([sym,count],i)=>{
            const stock = DB.getStockBySymbol(sym);
            const pct = Math.round(count / allTrades.length * 100);
            return `<div style="margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <div><span style="font-weight:800;">${sym}</span> <span style="font-size:12px;color:var(--gray-500);">${stock?.name||''}</span></div>
                <span style="font-weight:700;">${count} trades (${pct}%)</span>
              </div>
              <div class="progress-bar"><div class="progress-fill blue" style="width:${Math.min(pct*2,100)}%;"></div></div>
              <div style="font-size:11px;color:var(--gray-400);margin-top:3px;">Current: ${fmtINR(stock?.price||0)} | ${(stock?.change||0)>=0?'+':''}${stock?.change||0}%</div>
            </div>`;
          }).join("") : emptyState("DT","No trade data yet")}
          <div style="margin-top:16px;padding:14px;background:var(--blue-light);border-radius:var(--radius-sm);">
            <div style="font-size:13px;font-weight:700;margin-bottom:8px;">Top Performer</div>
            ${topPerf ? `<div style="font-weight:800;font-size:15px;">${topPerf.firstName} ${topPerf.lastName}</div>
            <div style="font-size:13px;color:var(--gray-600);">Portfolio: ${fmtINR(topPerf.portfolioValue||0)} | <span class="positive">+${((topPerf.portfolioValue-100000)/100000*100).toFixed(1)}%</span></div>
            <div style="font-size:12px;color:var(--gray-500);margin-top:4px;">${topPerf.skillPoints||0} skill points</div>` : 'N/A'}
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:20px;">
        <div class="card-header"><div><div class="card-title">📊 Risk Assessment</div><div class="card-subtitle">Portfolio risk metrics across all students</div></div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Student</th><th>Portfolio Value</th><th>Returns</th><th>Skill Points</th><th>Total Trades</th><th>Buy</th><th>Sell</th><th>Risk Profile</th></tr></thead>
          <tbody>${learners.map(s=>{
            const ret = ((s.portfolioValue-100000)/100000*100);
            const trades = DB.getLearnerTrades(s.id);
            const risk = s.riskTolerance || (Math.abs(ret) > 10 ? 'high' : Math.abs(ret) > 5 ? 'moderate' : 'low');
            const riskColor = {high:'badge-red',moderate:'badge-orange',low:'badge-green'}[risk]||'badge-gray';
            return `<tr>
              <td style="font-weight:700;">${s.firstName} ${s.lastName}</td>
              <td>${fmtINR(s.portfolioValue||0)}</td>
              <td class="${gainLossClass(ret)}">${fmtPct(ret)}</td>
              <td style="color:var(--orange);font-weight:700;">${s.skillPoints||0}</td>
              <td>${trades.length}</td>
              <td style="color:var(--green);font-weight:600;">${trades.filter(t=>t.type==="BUY").length}</td>
              <td style="color:var(--red);font-weight:600;">${trades.filter(t=>t.type==="SELL").length}</td>
              <td><span class="badge ${riskColor}">${risk}</span></td>
            </tr>`;
          }).join("")}</tbody>
        </table></div>
      </div>`;
  }

  function renderHistory() {
    const q    = (document.getElementById("history-search")?.value||"").toLowerCase();
    const type = document.getElementById("history-type")?.value||"";
    let trades = myStudents.flatMap(s => DB.getLearnerTrades(s.id).map(t=>({...t,_student:s})));
    if (q)    trades = trades.filter(t => t.symbol.toLowerCase().includes(q) || (t._student.firstName+" "+t._student.lastName).toLowerCase().includes(q));
    if (type) trades = trades.filter(t => t.type === type);
    trades.sort((a,b) => new Date(b.date)-new Date(a.date));
    const tbody = document.getElementById("history-tbody");
    if (!trades.length) { tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--gray-400);">No trades found</td></tr>`; return; }
    tbody.innerHTML = trades.map(t => `<tr>
      <td style="font-weight:600;">${t._student.firstName} ${t._student.lastName}</td>
      <td style="font-weight:800;">${t.symbol}</td>
      <td><span class="badge ${t.type==='BUY'?'badge-green':'badge-red'}">${t.type}</span></td>
      <td>${t.qty}</td>
      <td>${fmtINR(t.price)}</td>
      <td style="font-weight:700;">${fmtINR(t.total)}</td>
      <td style="color:var(--gray-400);">${t.date}</td>
      <td><span class="badge badge-green">Executed</span></td>
    </tr>`).join("");
  }

  function exportAnalysis() { UI.showToast("Analysis report exported successfully!"); }

  function showReport(learnerId) {
    const r = DB.generateReport(learnerId);
    if (!r) return;
    UI.showModal(`
      <div class="modal-title">📄 Performance Report</div>
      <div class="modal-subtitle">${r.studentName}</div>
      <div class="report-card">
        <div class="report-metric"><span class="label">Portfolio Value</span><span class="value">${fmtINR(r.portfolioValue)}</span></div>
        <div class="report-metric"><span class="label">Virtual Balance</span><span class="value">${fmtINR(r.virtualBalance)}</span></div>
        <div class="report-metric"><span class="label">Total Returns</span><span class="value ${gainLossClass(r.totalReturn)}">${fmtPct(Number(r.totalReturn))}</span></div>
        <div class="report-metric"><span class="label">Skill Points</span><span class="value" style="color:var(--orange);">${r.skillPoints}</span></div>
        <div class="report-metric"><span class="label">Total Trades</span><span class="value">${r.totalTrades} (${r.buyOrders} buy / ${r.sellOrders} sell)</span></div>
        <div class="report-metric"><span class="label">Top Trade</span><span class="value">${r.topTrade}</span></div>
        <div class="report-metric"><span class="label">Assignments</span><span class="value">${r.completedAssignments}/${r.totalAssignments} completed</span></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
        <button class="btn btn-primary" onclick="UI.closeModal();openManageStudentModal('${learnerId}')">Give Feedback</button>
      </div>`);
  }

  // ========================
  // INSTRUCTOR PERSONAL TRADING
  // ========================
  let iCapFilter = "All", iSectorFilter = "All", iQuickMarketMode = "all";
  let iCurrentTradeType = "BUY";

  function switchITradingTab(tab) {
    document.querySelectorAll(".itab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".ptab[id^='itab-']").forEach(b => b.classList.remove("active"));
    document.getElementById("itab-content-" + tab)?.classList.add("active");
    document.getElementById("itab-" + tab)?.classList.add("active");
    if (tab === "portfolio") iRenderPortfolio();
    if (tab === "watchlist") iRenderWatchlist();
    if (tab === "market")    iRenderMarket();
    if (tab === "class")     renderTradingView();
  }

  function iRenderPortfolio() {
    if (!user) return;
    DB.refreshTradingState(user.id);
    const portVal = user.portfolioValue || 100000;
    const bal     = user.virtualBalance || 100000;
    const ret     = ((portVal - 100000) / 100000 * 100).toFixed(2);
    document.getElementById("i-port-val").textContent = fmtINR(portVal);
    document.getElementById("i-port-ret").textContent = fmtPct(Number(ret));
    document.getElementById("i-port-ret").className   = gainLossClass(ret);
    document.getElementById("i-port-bal").textContent = fmtINR(bal);

    const trades  = DB.getLearnerTrades(user.id);
    const holdings = DB.getHoldings(user.id);
    const holdArr  = Object.entries(holdings).filter(([,h]) => h.qty > 0);

    document.getElementById("i-holdings-list").innerHTML = holdArr.length
      ? holdArr.map(([sym,h]) => {
          const stock = DB.getStockBySymbol(sym);
          const curVal = stock ? h.qty * stock.price : h.spent;
          const pnl    = stock ? stock.change : 0;
          return `<div class="holding-row">
            <div><div class="holding-sym">${sym}</div><div class="holding-meta">${h.qty} shares · Avg ₹${(h.qty > 0 ? Math.round(h.spent / h.qty) : 0).toLocaleString("en-IN")}</div></div>
            <div style="text-align:right;"><div style="font-weight:800;">${fmtINR(curVal)}</div><div class="${gainLossClass(pnl)}">${pnl>=0?'+':''}${pnl}%</div></div>
          </div>`;
        }).join("")
      : `<p style="color:var(--gray-400);font-size:13px;padding:16px 0;">No holdings yet. Go to Market tab to start trading!</p>`;

    document.getElementById("i-trade-history").innerHTML = trades.length
      ? [...trades].reverse().map(t => `<tr>
          <td style="font-weight:700;">${t.symbol}</td>
          <td><span class="badge ${t.type==='BUY'?'badge-green':'badge-red'}">${t.type}</span></td>
          <td>${t.qty}</td><td>₹${t.price.toLocaleString("en-IN")}</td>
          <td style="font-weight:700;">${fmtINR(t.total)}</td>
          <td style="color:var(--gray-400);">${t.date}</td>
          <td><span class="badge badge-green">Executed</span></td>
        </tr>`).join("")
      : `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--gray-400);">No trades yet</td></tr>`;
  }

  function iRenderWatchlist() {
    const lists = DB.getWatchlists(user?.id);
    const active = DB.getActiveWatchlist(user?.id);
    const wl = active ? active.symbols : [];
    const stocks = wl.map(sym => DB.getStockBySymbol(sym)).filter(Boolean);
    const toolbar = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <select id="i-watchlist-select" class="form-select" style="min-width:190px;" onchange="iSwitchWatchlist(this.value)">
          ${lists.map(w => `<option value="${w.id}" ${w.active ? 'selected' : ''}>${w.name} (${(w.symbols||[]).length})</option>`).join('')}
        </select>
        <button class="btn btn-secondary btn-sm" onclick="iCreateWatchlist()">+ New List</button>
        <button class="btn btn-secondary btn-sm" onclick="iDeleteCurrentWatchlist()">Delete List</button>
      </div>
      <div style="font-size:12px;color:var(--gray-500);">Managing: <strong>${active?.name || 'My Watchlist'}</strong></div>
    </div>`;
    document.getElementById("i-watchlist-table").innerHTML = toolbar + (stocks.length
      ? `<table>
          <thead><tr><th>Symbol</th><th>Company</th><th>Price</th><th>Change</th><th>Sector</th><th>Actions</th></tr></thead>
          <tbody>${stocks.map(s => `<tr>
            <td style="font-weight:800;">${s.symbol}</td>
            <td>${s.name}</td>
            <td style="font-weight:700;">₹${s.price.toLocaleString("en-IN")}</td>
            <td class="${s.change>=0?'gain':'loss'}">${s.change>=0?'+':''}${s.change}%</td>
            <td><span class="badge badge-blue" style="font-size:11px;">${s.sector}</span></td>
            <td><div style="display:flex;gap:8px;">
              <button class="btn btn-green btn-sm" onclick="iOpenTradeModal('${s.symbol}','BUY')">Buy</button>
              <button class="btn btn-danger btn-sm" onclick="iOpenTradeModal('${s.symbol}','SELL')">Sell</button>
              <button class="btn-icon danger" onclick="iRemoveWatch('${s.symbol}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
            </div></td>
          </tr>`).join("")}</tbody>
        </table>`
      : `<div class="empty-state"><div class="icon">⭐</div><p>This watchlist is empty. Use the search above to add stocks.</p></div>`);
  }

  function iSwitchWatchlist(id) {
    DB.setActiveWatchlist(user?.id, id);
    iRenderWatchlist();
  }

  function iCreateWatchlist() {
    DB.createWatchlist(user?.id);
    iRenderWatchlist();
    UI.showToast('New watchlist created.');
  }

  function iDeleteCurrentWatchlist() {
    const active = DB.getActiveWatchlist(user?.id);
    if (!active) return;
    DB.deleteWatchlist(user?.id, active.id);
    iRenderWatchlist();
    UI.showToast('Watchlist updated.', 'info');
  }

  function iSearchToAdd() {
    const q  = (document.getElementById("i-watch-search")?.value || "").toLowerCase().trim();
    const el = document.getElementById("i-search-results");
    if (!q) { el.style.display = "none"; return; }
    const results = DB.getStocks().filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)).slice(0,5);
    if (!results.length) { el.style.display = "none"; return; }
    el.style.display = "block";
    el.innerHTML = results.map(s => `
      <div class="flex-between" style="padding:10px 0;border-bottom:1px solid var(--gray-100);">
        <div><span style="font-weight:700;">${s.symbol}</span> <span style="font-size:13px;color:var(--gray-500);">${s.name}</span></div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="${s.change>=0?'gain':'loss'}">${s.change>=0?'+':''}${s.change}%</span>
          <button class="btn btn-secondary btn-sm" onclick="iAddToWatch('${s.symbol}')">+ Add</button>
        </div>
      </div>`).join("");
  }

  function iAddToWatch(sym) {
    DB.addToWatchlist(user?.id, sym);
    document.getElementById("i-watch-search").value = "";
    document.getElementById("i-search-results").style.display = "none";
    UI.showToast(sym + " added to watchlist!"); iRenderWatchlist();
  }

  function iRemoveWatch(sym) {
    DB.removeFromWatchlist(user?.id, sym);
    UI.showToast(sym + " removed.", "info"); iRenderWatchlist();
  }

  function iRenderMarket() {
    const stocks  = DB.getStocks();
    const gainers = [...stocks].sort((a,b) => b.change - a.change).slice(0,5);
    const losers  = [...stocks].sort((a,b) => a.change - b.change).slice(0,5);
    const active  = [...stocks].sort((a,b) => Number(String(b.vol).replace(/[^\d]/g,'')) - Number(String(a.vol).replace(/[^\d]/g,''))).slice(0,5);
    document.getElementById("i-top-gainers").innerHTML = gainers.map(s =>
      `<div class="flex-between" style="padding:5px 0;"><div><span style="font-weight:700;font-size:13px;">${s.symbol}</span><br><span style="font-size:11px;color:var(--gray-400);">₹${s.price}</span></div><span class="gain">+${s.change}%</span></div>`
    ).join("");
    document.getElementById("i-top-losers").innerHTML = losers.map(s =>
      `<div class="flex-between" style="padding:5px 0;"><div><span style="font-weight:700;font-size:13px;">${s.symbol}</span><br><span style="font-size:11px;color:var(--gray-400);">₹${s.price}</span></div><span class="loss">${s.change}%</span></div>`
    ).join("");
    document.getElementById("i-most-active").innerHTML = active.map(s =>
      `<div class="flex-between" style="padding:5px 0;"><div><span style="font-weight:700;font-size:13px;">${s.symbol}</span><br><span style="font-size:11px;color:var(--gray-400);">Vol. ${s.vol}</span></div><span class="${gainLossClass(s.change)}">${s.change>=0?'+':''}${s.change}%</span></div>`
    ).join("");
    document.getElementById("i-market-card-gainers")?.classList.toggle('active', iQuickMarketMode === 'gainers');
    document.getElementById("i-market-card-losers")?.classList.toggle('active', iQuickMarketMode === 'losers');
    document.getElementById("i-market-card-active")?.classList.toggle('active', iQuickMarketMode === 'active');
    iFilterMarket();
  }

  function iSetCapFilter(cap, btn) {
    iCapFilter = cap;
    document.getElementById("i-cap-filters").querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active"); iFilterMarket();
  }

  function iSetSectorFilter(sector, btn) {
    iSectorFilter = sector;
    document.getElementById("i-sector-filters").querySelectorAll(".cat-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active"); iFilterMarket();
  }

  function iApplyQuickMarket(mode) {
    iQuickMarketMode = iQuickMarketMode === mode ? 'all' : mode;
    iRenderMarket();
  }

  function iFilterMarket() {
    const q = (document.getElementById("i-market-search")?.value || "").toLowerCase();
    let stocks = DB.getStocks().filter(s => {
      const mQ   = !q || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      const mCap = iCapFilter === "All" || s.cap === iCapFilter;
      const mSec = iSectorFilter === "All" || s.sector === iSectorFilter;
      return mQ && mCap && mSec;
    });
    if (iQuickMarketMode === 'gainers') stocks = [...stocks].sort((a,b) => b.change - a.change);
    else if (iQuickMarketMode === 'losers') stocks = [...stocks].sort((a,b) => a.change - b.change);
    else if (iQuickMarketMode === 'active') stocks = [...stocks].sort((a,b) => Number(String(b.vol).replace(/[^\d]/g,'')) - Number(String(a.vol).replace(/[^\d]/g,'')));
    document.getElementById("i-stock-list").innerHTML = stocks.length
      ? stocks.map(s => `
          <div class="stock-row">
            <div style="flex:2;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-weight:800;">${s.symbol}</span>
                <span class="badge badge-gray" style="font-size:10px;">${s.cap}</span>
                <span class="badge badge-blue" style="font-size:10px;">${s.sector}</span>
              </div>
              <div style="font-size:12px;color:var(--gray-500);margin-top:2px;">${s.name} • Market Cap: ${s.marketCap} • Vol: ${s.vol}</div>
            </div>
            <div style="text-align:right;margin-right:20px;">
              <div style="font-weight:800;font-size:15px;">₹${s.price.toLocaleString("en-IN")}</div>
              <div class="${gainLossClass(s.change)}">${s.change>=0?'+':''}${s.change}%</div>
            </div>
            <button class="btn btn-green btn-sm" onclick="iOpenTradeModal('${s.symbol}','BUY')">Trade</button>
          </div>`).join("")
      : emptyState("🔍", "No stocks match your filters");
  }

  function iOpenTradeModal(symbol, defaultType) {
    const stock = DB.getStockBySymbol(symbol);
    if (!stock) return;
    iCurrentTradeType = defaultType;
    DB.refreshTradingState(user.id);
    const bal = DB.getUserById(user.id)?.virtualBalance || 0;
    UI.showModal(`
      <div class="modal-title">Trade ${symbol}</div>
      <div class="trade-modal-stock">
        <div style="font-weight:800;font-size:1.1rem;">${symbol}</div>
        <div style="font-size:13px;color:var(--gray-600);">${stock.name}</div>
        <div style="display:flex;gap:20px;margin-top:8px;">
          <div><span style="font-size:12px;color:var(--gray-400);">Price</span><br><strong>₹${stock.price.toLocaleString("en-IN")}</strong></div>
          <div><span style="font-size:12px;color:var(--gray-400);">Change</span><br><strong class="${gainLossClass(stock.change)}">${stock.change>=0?'+':''}${stock.change}%</strong></div>
          <div><span style="font-size:12px;color:var(--gray-400);">My Balance</span><br><strong>${fmtINR(bal)}</strong></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Order Type *</label>
        <div style="display:flex;gap:10px;">
          <button id="i-type-buy" class="btn ${defaultType==='BUY'?'btn-green':'btn-secondary'} btn-block" onclick="iSetType('BUY')">Buy</button>
          <button id="i-type-sell" class="btn ${defaultType==='SELL'?'btn-danger':'btn-secondary'} btn-block" onclick="iSetType('SELL')">Sell</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Quantity *</label>
        <input id="i-trade-qty" type="number" class="form-input" placeholder="Number of shares" min="1" oninput="iCalcTotal('${symbol}')">
      </div>
      <div style="background:var(--gray-50);border-radius:var(--radius-sm);padding:12px;margin-bottom:16px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;"><span>Price per share:</span><strong>₹${stock.price.toLocaleString("en-IN")}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;"><span>Estimated Total:</span><strong id="i-est-total">₹0</strong></div>
      </div>
      <div id="i-trade-error" class="alert alert-red" style="display:none;margin-bottom:12px;"></div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="iExecuteTrade('${symbol}')">Confirm Order</button>
      </div>`);
  }

  function iSetType(type) {
    iCurrentTradeType = type;
    document.getElementById("i-type-buy").className  = `btn ${type==="BUY"?"btn-green":"btn-secondary"} btn-block`;
    document.getElementById("i-type-sell").className = `btn ${type==="SELL"?"btn-danger":"btn-secondary"} btn-block`;
  }

  function iCalcTotal(sym) {
    const stock = DB.getStockBySymbol(sym);
    const qty   = parseInt(document.getElementById("i-trade-qty")?.value) || 0;
    document.getElementById("i-est-total").textContent = fmtINR(qty * (stock?.price||0));
  }

  function iExecuteTrade(symbol) {
    const qty    = parseInt(document.getElementById("i-trade-qty").value);
    const stock  = DB.getStockBySymbol(symbol);
    const errEl  = document.getElementById("i-trade-error");
    errEl.style.display = "none";
    if (!qty || qty <= 0) { errEl.textContent = "Enter a valid quantity."; errEl.style.display = "flex"; return; }
    if (qty > 10000)      { errEl.textContent = "Max 10,000 shares per order."; errEl.style.display = "flex"; return; }

    // Instructors get a personal trading limit; initialise if needed
    if (!user.virtualBalance || user.virtualBalance <= 0) {
      DB.updateUser(user.id, { virtualBalance: 100000, portfolioValue: 100000, tradingLimit: 150000 });
    }
    const result = DB.executeTrade(user.id, symbol, iCurrentTradeType, qty, stock.price);
    if (!result.success) { errEl.textContent = result.message; errEl.style.display = "flex"; return; }

    DB.refreshTradingState(user.id);
    UI.closeModal();
    UI.showToast(`${iCurrentTradeType} ${qty} ${symbol} executed!`);
    renderStats();
    renderTradingView();
    iRenderPortfolio();
    if (document.getElementById('itab-content-market')?.classList.contains('active')) iRenderMarket();
  }

  // ========================
  // FIX 5: Cross-actor live linking
  // All dropdowns use DB.getLearners() / DB.getInstructors() live at open time,
  // so newly created users automatically appear without any extra code.
  // The existing openCreateAssignmentModal, openSendNotificationModal etc
  // already call DB.getLearners() at render time — they're live already.
  // ========================

  init();