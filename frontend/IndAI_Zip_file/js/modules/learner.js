    const session = Auth.requireAuth(["learner", "superuser"]);
    DarkMode.injectInto(".nav-right");
    const user = Auth.getCurrentUser();
    let currentPeriod = "1M";
    let capFilter = "All", sectorFilter = "All";

    function init() {
      if (!user) return;
      TradingUI.init(user.id, "");
      document.getElementById("skill-pts").textContent = user.skillPoints || 0;
      buildTicker();
      renderStats();
      renderPortfolio();
      renderPortfolioGraph();
      updateNotifBadge();
      window.addEventListener('resize', () => {
        if (document.getElementById('view-portfolio')?.classList.contains('active')) {
          renderPortfolioGraph();
        }
      });
    }

    function updateNotifBadge() {
      const c = DB.getUnreadCount(user?.id || "u6");
      document.getElementById("notif-count").textContent = c || 0;
    }

    function buildTicker() {
      const stocks = DB.getStocks().slice(0, 10);
      const items = stocks.map(s => `
        <div class="ticker-item">
          <span class="ticker-sym">${s.symbol}</span>
          <span style="font-weight:800;">₹${s.price.toLocaleString("en-IN")}</span>
          <span style="${s.change>=0?'color:var(--green)':'color:var(--red);'}">${s.change>=0?'+':''}${s.change}%</span>
        </div>`).join("");
      document.getElementById("ticker-track").innerHTML = items + items; // double for loop
    }

    function renderStats() {
      if (!user) return;
      DB.refreshTradingState(user.id);
      const ret = ((user.portfolioValue - 100000) / 100000 * 100).toFixed(2);
      const holdings = DB.getHoldings(user.id);
      const usedCapital = Object.values(holdings).reduce((sum, h) => sum + Number(h.spent || 0), 0);
      const usedPct = Math.max(0, Math.min(100, Math.round((usedCapital / Math.max(user.tradingLimit || 1, 1)) * 100)));
      const challenges = DB.getLearnerAssignments(user.id).filter(a => a.status === "active").length;
      document.getElementById("learner-stats").innerHTML = `
        <div class="stat-card"><div class="stat-label">Portfolio Value</div><div class="stat-value">${UI.formatCurrency(user.portfolioValue)}</div><div class="stat-sub positive">↗ ${ret}% returns</div></div>
        <div class="stat-card"><div class="stat-label">Trading Limit</div><div class="stat-value">${UI.formatCurrency(user.tradingLimit)}</div>
          <div style="margin-top:6px;"><div class="progress-bar"><div class="progress-fill blue" style="width:${usedPct}%;"></div></div><div class="stat-sub mt-8">${usedPct}% utilized • ${UI.formatCurrency(Math.max((user.tradingLimit||0) - usedCapital, 0))} available</div></div>
        </div>
        <div class="stat-card"><div class="stat-label">Skill Points</div><div class="stat-value orange">${user.skillPoints || 0}</div><div class="stat-sub">Level: ${(user.skillPoints||0)>300?'Advanced':(user.skillPoints||0)>150?'Intermediate':'Beginner'}</div></div>
        <div class="stat-card"><div class="stat-label">Active Challenges</div><div class="stat-value">${challenges}</div><div class="stat-sub">Avg. Progress: 60%</div></div>`;
    }

    function switchTab(tab) {
      document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.getElementById("view-" + tab).classList.add("active");
      document.getElementById("tab-" + tab).classList.add("active");
      if (tab === "portfolio") { renderPortfolio(); renderPortfolioGraph(); }
      if (tab === "watchlist") { TradingUI.renderWatchlist(); }
      if (tab === "trading") TradingUI.renderMarket();
      if (tab === "challenges") renderChallenges();
      if (tab === "learning") renderLearning();
      if (tab === "notifications") renderNotifications();
      if (tab === "settings") renderSettings();
    }

    function setPeriod(p, btn) {
      currentPeriod = p;
      document.getElementById('period-btns').querySelectorAll('button').forEach(b => { b.className = 'btn btn-secondary btn-sm'; });
      if (btn) btn.className = 'btn btn-primary btn-sm';
      renderPortfolioGraph();
    }

    function renderPortfolioGraph() {
      const canvas = document.getElementById('portfolio-chart');
      if (!canvas || !window.TradingModule || !user) return;
      const ctx = canvas.getContext('2d');
      const container = canvas.parentElement;
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(320, Math.floor((container?.clientWidth || 640) - 24));
      const height = 220;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const pad = 18;
      const series = TradingModule.buildPortfolioSeries(DB.getUserById(user.id), DB.getLearnerTrades(user.id), currentPeriod);
      const values = series.map(p => p.value);
      const min = Math.min(...values) * 0.995;
      const max = Math.max(...values) * 1.005;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach(r => {
        const y = height * r;
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(width - pad, y);
        ctx.stroke();
      });

      ctx.beginPath();
      series.forEach((point, idx) => {
        const x = pad + ((width - pad * 2) / Math.max(series.length - 1, 1)) * idx;
        const y = height - pad - ((point.value - min) / Math.max(max - min, 1)) * (height - pad * 2);
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const last = series[series.length - 1];
      const lastX = pad + ((width - pad * 2) / Math.max(series.length - 1, 1)) * (series.length - 1);
      const lastY = height - pad - ((last.value - min) / Math.max(max - min, 1)) * (height - pad * 2);
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // PORTFOLIO
    function renderPortfolio() {
      if (user?.id) DB.refreshTradingState(user.id);
      if (!user) return;
      TradingUI.renderPortfolio();
      const liveUser = DB.getUserById(user.id);
      document.getElementById('port-val').textContent = UI.formatCurrency(liveUser?.portfolioValue || 100000);
      const ret = (((liveUser?.portfolioValue || 100000) - 100000) / 100000 * 100);
      document.getElementById('port-ret').textContent = fmtPct(ret);
      document.getElementById('port-ret').className = gainLossClass(ret);
    }

    // WATCHLIST
    function renderWatchlist() {
      const wl = DB.getWatchlist(user?.id || "u6");
      const stocks = wl.map(sym => DB.getStockBySymbol(sym)).filter(Boolean);
      document.getElementById("watchlist-table").innerHTML = stocks.length ? `
        <table>
          <thead><tr><th>Symbol</th><th>Company</th><th>Price</th><th>Change</th><th>Cap</th><th>Sector</th><th>Actions</th></tr></thead>
          <tbody>${stocks.map(s => `
            <tr>
              <td style="font-weight:800;">${s.symbol}</td>
              <td style="font-size:13px;">${s.name}</td>
              <td style="font-weight:700;">₹${s.price.toLocaleString("en-IN")}</td>
              <td class="${s.change>=0?'gain':'loss'}">${s.change>=0?'+':''}${s.change}%</td>
              <td style="font-size:12px;">${s.cap}</td>
              <td><span class="badge badge-blue" style="font-size:11px;">${s.sector}</span></td>
              <td>
                <div style="display:flex;gap:8px;">
                  <button class="btn btn-green btn-sm" onclick="TradingUI._openTradeModal('${s.symbol}','BUY')">Buy</button>
                  <button class="btn btn-danger btn-sm" onclick="TradingUI._openTradeModal('${s.symbol}','SELL')">Sell</button>
                  <button class="btn-icon danger" onclick="TradingUI.removeFromWatchlist('${s.symbol}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
                </div>
              </td>
            </tr>`).join("")}
          </tbody>
        </table>` : `<div class="empty-state"><div class="icon">⭐</div><p>Your watchlist is empty. Search above to add stocks.</p></div>`;
    }

    function searchToAdd() {
      const q = document.getElementById("watch-search").value.trim().toLowerCase();
      const el = document.getElementById("search-results");
      if (!q) { el.style.display = "none"; return; }
      const results = DB.getStocks().filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)).slice(0, 5);
      if (!results.length) { el.style.display = "none"; return; }
      el.style.display = "block";
      el.innerHTML = results.map(s => `
        <div class="flex-between" style="padding:10px 0;border-bottom:1px solid var(--gray-100);">
          <div><span style="font-weight:700;">${s.symbol}</span> <span style="font-size:13px;color:var(--gray-500);">${s.name}</span></div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="${s.change>=0?'gain':'loss'}">${s.change>=0?'+':''}${s.change}%</span>
            <button class="btn btn-secondary btn-sm" onclick="TradingUI.addToWatchlist('${s.symbol}')">+ Add</button>
          </div>
        </div>`).join("");
    }

    function addToWatchlist(sym) {
      DB.addToWatchlist(user?.id || "u6", sym);
      document.getElementById("watch-search").value = "";
      document.getElementById("search-results").style.display = "none";
      UI.showToast(sym + " added to watchlist!"); renderWatchlist();
    }

    function removeFromWatchlist(sym) {
      DB.removeFromWatchlist(user?.id || "u6", sym);
      UI.showToast(sym + " removed.", "info"); renderWatchlist();
    }

    // MARKET / TRADING
    function renderMarket() {
      const stocks = DB.getStocks();
      const gainers = [...stocks].sort((a,b) => b.change - a.change).slice(0,5);
      const losers = [...stocks].sort((a,b) => a.change - b.change).slice(0,5);
      const active = [...stocks].sort(() => Math.random() - 0.5).slice(0,5);

      document.getElementById("top-gainers").innerHTML = gainers.map(s =>
        `<div class="flex-between" style="padding:5px 0;"><div><span style="font-weight:700;font-size:13px;">${s.symbol}</span><br><span style="font-size:11px;color:var(--gray-400);">₹${s.price}</span></div><span class="gain">+${s.change}%</span></div>`
      ).join("");
      document.getElementById("top-losers").innerHTML = losers.map(s =>
        `<div class="flex-between" style="padding:5px 0;"><div><span style="font-weight:700;font-size:13px;">${s.symbol}</span><br><span style="font-size:11px;color:var(--gray-400);">₹${s.price}</span></div><span class="loss">${s.change}%</span></div>`
      ).join("");
      document.getElementById("most-active").innerHTML = active.map(s =>
        `<div class="flex-between" style="padding:5px 0;"><div><span style="font-weight:700;font-size:13px;">${s.symbol}</span><br><span style="font-size:11px;color:var(--gray-400);">Vol. ${s.vol}</span></div><span class="${s.change>=0?'gain':'loss'}">${s.change>=0?'+':''}${s.change}%</span></div>`
      ).join("");

      filterMarket();
    }

    function setCapFilter(cap, btn) {
      capFilter = cap;
      document.getElementById("cap-filters").querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active"); filterMarket();
    }

    function setSectorFilter(sector, btn) {
      sectorFilter = sector;
      document.getElementById("sector-filters").querySelectorAll(".cat-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active"); filterMarket();
    }

    function filterMarket() {
      const q = (document.getElementById("market-search")?.value || "").toLowerCase();
      let stocks = DB.getStocks().filter(s => {
        const matchQ = !q || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
        const matchCap = capFilter === "All" || s.cap === capFilter;
        const matchSec = sectorFilter === "All" || s.sector === sectorFilter;
        return matchQ && matchCap && matchSec;
      });
      document.getElementById("stock-count-label").textContent = `All Stocks – Showing ${stocks.length} of ${DB.getStocks().length} stocks`;
      document.getElementById("stock-list").innerHTML = stocks.length ? stocks.map(s => `
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
            <div class="${s.change>=0?'gain':'loss'}">${s.change>=0?'+':''}${s.change}%</div>
          </div>
          <button class="btn btn-green btn-sm" onclick="TradingUI._openTradeModal('${s.symbol}','BUY')">View</button>
        </div>`).join("") : `<div class="empty-state"><div class="icon">🔍</div><p style="font-weight:600;color:var(--gray-700);">No stocks match your filters</p><p style="font-size:12px;margin-top:4px;">Try selecting "All" for Cap or Sector to see more results</p><button class="btn btn-secondary btn-sm" style="margin-top:12px;" onclick="resetMarketFilters()">Reset Filters</button></div>`;
    }

    function resetMarketFilters() {
      capFilter = "All"; sectorFilter = "All";
      document.getElementById("market-search").value = "";
      document.getElementById("cap-filters").querySelectorAll(".chip").forEach((b,i) => b.classList.toggle("active", i===0));
      document.getElementById("sector-filters").querySelectorAll(".cat-chip").forEach((b,i) => b.classList.toggle("active", i===0));
      filterMarket();
    }

    function openTradeModal(symbol, defaultType) {
      const stock = DB.getStockBySymbol(symbol);
      if (!stock) return;
      UI.showModal(`
        <div class="modal-title">Trade ${symbol}</div>
        <div class="trade-modal-stock">
          <div style="font-weight:800;font-size:1.1rem;">${symbol}</div>
          <div style="font-size:13px;color:var(--gray-600);">${stock.name}</div>
          <div style="display:flex;gap:20px;margin-top:8px;">
            <div><span style="font-size:12px;color:var(--gray-400);">Price</span><br><strong>₹${stock.price.toLocaleString("en-IN")}</strong></div>
            <div><span style="font-size:12px;color:var(--gray-400);">Change</span><br><strong class="${stock.change>=0?'gain':'loss'}">${stock.change>=0?'+':''}${stock.change}%</strong></div>
            <div><span style="font-size:12px;color:var(--gray-400);">Your Balance</span><br><strong>${UI.formatCurrency(user?.virtualBalance||0)}</strong></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Order Type *</label>
          <div style="display:flex;gap:10px;">
            <button id="type-buy" class="btn ${defaultType==='BUY'?'btn-green':'btn-secondary'} btn-block" onclick="setType('BUY')">Buy</button>
            <button id="type-sell" class="btn ${defaultType==='SELL'?'btn-danger':'btn-secondary'} btn-block" onclick="setType('SELL')">Sell</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Quantity *</label>
          <input id="trade-qty" type="number" class="form-input" placeholder="Number of shares" min="1" oninput="calcTotal('${symbol}')">
        </div>
        <div style="background:var(--gray-50);border-radius:var(--radius-sm);padding:12px;margin-bottom:16px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;"><span>Price per share:</span><strong>₹${stock.price.toLocaleString("en-IN")}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;"><span>Estimated Total:</span><strong id="est-total">₹0</strong></div>
        </div>
        <div id="trade-error" class="alert alert-red" style="display:none;margin-bottom:12px;"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="executeTrade('${symbol}')">Confirm Order</button>
        </div>`);
      currentTradeType = defaultType;
    }

    let currentTradeType = "BUY";
    function setType(type) {
      currentTradeType = type;
      document.getElementById("type-buy").className = `btn ${type==="BUY"?"btn-green":"btn-secondary"} btn-block`;
      document.getElementById("type-sell").className = `btn ${type==="SELL"?"btn-danger":"btn-secondary"} btn-block`;
    }

    function calcTotal(sym) {
      const stock = DB.getStockBySymbol(sym);
      const qty = parseInt(document.getElementById("trade-qty")?.value) || 0;
      document.getElementById("est-total").textContent = UI.formatCurrency(qty * (stock?.price || 0));
    }

    function executeTrade(symbol) {
      const qty = parseInt(document.getElementById("trade-qty").value);
      const stock = DB.getStockBySymbol(symbol);
      const errEl = document.getElementById("trade-error");
      errEl.style.display = "none";
      if (!qty || qty <= 0) { errEl.textContent = "Enter a valid quantity."; errEl.style.display = "flex"; return; }
      if (qty > 10000) { errEl.textContent = "Maximum 10,000 shares per order."; errEl.style.display = "flex"; return; }
      const learnerId = user?.id || "u6";
      const result = DB.executeTrade(learnerId, symbol, currentTradeType, qty, stock.price);
      if (!result.success) { errEl.textContent = result.message; errEl.style.display = "flex"; return; }
      DB.refreshTradingState(learnerId);
      UI.closeModal(); UI.showToast(`${currentTradeType} order for ${qty} ${symbol} executed!`);
      document.getElementById("skill-pts").textContent = DB.getUserById(learnerId)?.skillPoints || 0;
      renderStats(); renderPortfolio();
    }

    // CHALLENGES
    function renderChallenges() {
      const assignments = DB.getLearnerAssignments(user?.id || "u6");
      const diffColors = { Easy:"badge-green", Medium:"badge-orange", Hard:"badge-red" };
      document.getElementById("challenges-list").innerHTML = assignments.length ? assignments.map(a => {
        const completed = a.completedIds.includes(user?.id || "u6");
        const pendingApproval = (a.pendingCompletedIds || []).includes(user?.id || "u6");
        // Deterministic progress based on assignment id so it doesn't change on re-render
        const seed = a.id.charCodeAt(a.id.length - 1);
        const progress = completed ? 100 : (pendingApproval ? 100 : Math.min(90, 30 + (seed % 5) * 12));
        return `<div class="challenge-card">
          <div class="flex-between mb-8">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-weight:800;font-size:15px;">${a.title}</span>
              ${getDiffBadge(a.difficulty)}
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:var(--orange);font-weight:700;">🏆 +${a.skillPoints}</span>
              <span style="font-size:12px;color:var(--gray-400);">${a.dueDate}</span>
            </div>
          </div>
          <p style="font-size:13px;margin-bottom:14px;">${a.description}</p>
          <div class="flex-between mb-8"><span style="font-size:13px;font-weight:600;">Progress</span><span style="font-weight:700;">${progress}%</span></div>
          <div class="progress-bar mb-8"><div class="progress-fill ${completed?'green':''}" style="width:${progress}%;"></div></div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:12px;color:var(--gray-500);">${completed?'✅ Approved & completed!':(pendingApproval?'⏳ Awaiting instructor approval':'Keep going! You\'re almost there.')}</span>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="viewChallengeDetails('${a.id}')">Details</button>
              ${(!completed && !pendingApproval) ? `<button class="btn btn-green btn-sm" onclick="markChallengeComplete('${a.id}')">Mark Complete</button>` : ''}
            </div>
          </div>
        </div>`;
      }).join("") : emptyState("CH", "No challenges assigned yet", "Check back with your instructor.");

      // Populate leaderboard with classmates
      const instrId = user?.instructorId;
      const classmates = instrId
        ? DB.getLearners().filter(l => (DB.getUserById(instrId)?.studentIds || []).includes(l.id))
        : DB.getLearners().slice(0, 6);
      renderLeaderboard(classmates, "leaderboard-container");
    }

    function markChallengeComplete(id) {
      const a = DB.getAssignmentById(id);
      if (!a) return;
      const uid = user?.id || "u6";
      if (a.completedIds.includes(uid)) { UI.showToast("Already completed!", "info"); return; }
      if ((a.pendingCompletedIds || []).includes(uid)) { UI.showToast("Already submitted for instructor approval.", "info"); return; }
      const pendingIds = [...new Set([...(a.pendingCompletedIds || []), uid])];
      DB.updateAssignment(id, { pendingCompletedIds: pendingIds });
      if (user?.instructorId) {
        DB.requestCompletionApproval({ type: 'assignment', learnerId: uid, instructorId: user.instructorId, refId: id });
        DB.addNotification(uid, `Challenge "${a.title}" submitted for instructor approval. Skill points will be awarded after approval.`, "info");
        UI.showToast('Challenge submitted for instructor approval.');
      } else {
        DB.updateAssignment(id, { completedIds: [...new Set([...(a.completedIds || []), uid])], pendingCompletedIds: (a.pendingCompletedIds || []).filter(x => x !== uid) });
        DB.updateUser(uid, { skillPoints: (DB.getUserById(uid)?.skillPoints || 0) + a.skillPoints });
        DB.addNotification(uid, `Challenge "${a.title}" completed! +${a.skillPoints} skill points`, "achievement");
        document.getElementById("skill-pts").textContent = DB.getUserById(uid)?.skillPoints || 0;
        UI.showToast(`Challenge completed! +${a.skillPoints} skill points awarded! 🎉`);
      }
      renderChallenges(); renderStats();
    }

    function viewChallengeDetails(id) {
      const a = DB.getAssignments().find(x => x.id === id);
      if (!a) return;
      UI.showModal(`
        <div class="modal-title">${a.title}</div>
        <span class="badge badge-orange" style="margin-bottom:12px;display:inline-block;">${a.difficulty}</span>
        <p style="font-size:14px;margin-bottom:16px;">${a.description}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div style="background:var(--orange-light);padding:12px;border-radius:8px;text-align:center;"><div style="font-weight:800;color:var(--orange);">+${a.skillPoints} pts</div><div style="font-size:12px;">Reward</div></div>
          <div style="background:var(--blue-light);padding:12px;border-radius:8px;text-align:center;"><div style="font-weight:800;color:var(--blue);">${a.dueDate}</div><div style="font-size:12px;">Due Date</div></div>
        </div>
        <div class="modal-footer"><button class="btn btn-primary" onclick="UI.closeModal()">Close</button></div>`);
    }

    function renderLearning() {
      const enrollments = DB.getLearnerEnrollments(user?.id || "u6");
      document.getElementById("learning-list").innerHTML = enrollments.length ? enrollments.map(e => {
        const course = DB.getCourseById(e.courseId);
        if (!course) return "";
        const done = e.status === "completed";
        const pendingApproval = e.status === "pending_approval";
        const quizzes = DB.getQuizzes().filter(q => q.courseId === e.courseId && q.status === "active");
        return `<div class="course-row">
          <div class="flex-between mb-8">
            <div><span style="font-weight:800;font-size:15px;">${course.title}</span>${done?` <span class="badge badge-green" style="margin-left:8px;">Completed</span>`:(pendingApproval?` <span class="badge badge-orange" style="margin-left:8px;">Awaiting Approval</span>`:'')}</div>
            <span style="font-size:12px;color:var(--gray-400);">${course.lessons} lessons • ${course.duration}</span>
          </div>
          <div class="flex-between mb-8"><span style="font-size:13px;color:var(--gray-500);">Progress</span><span style="font-weight:700;">${e.progress}%</span></div>
          <div class="progress-bar mb-8"><div class="progress-fill" style="width:${e.progress}%;"></div></div>
          <div class="flex-between">
            <span style="font-size:12px;color:var(--gray-500);">${done?'All modules completed':(pendingApproval?'Waiting for instructor approval':((DB.getLearnerCourseProgress(user?.id || "u6", e.courseId)?.completedModuleIds||[]).length)+' of '+DB.getCourseModules(e.courseId).length+' modules completed')}</span>
            <div style="display:flex;gap:8px;">
              ${quizzes.length ? `<button class="btn btn-orange btn-sm" onclick="openQuizModal('${quizzes[0].id}','${e.courseId}')">Take Quiz</button>` : ''}
              <button class="btn ${(done || pendingApproval)?'btn-secondary':'btn-primary'} btn-sm" onclick="openCourseView('${e.courseId}')">${done?'Review':(pendingApproval?'View Status':'Continue')}</button>
            </div>
          </div>
        </div>`;
      }).join("") : emptyState("CR", "No courses enrolled yet");

      const sessions = DB.getLearnerSessions(user?.id || "u6").filter(s => s.status === "scheduled");
      document.getElementById("upcoming-sessions-learner").innerHTML = sessions.length ? sessions.map(s => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:8px;transition:background 0.15s;" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''">
          <div>
            <div style="font-weight:700;">${s.title}</div>
            <div style="font-size:12px;color:var(--gray-500);">${s.date} at ${s.time} • ${s.duration} minutes</div>
          </div>
          <span class="badge badge-blue">${s.type}</span>
        </div>`).join("") : emptyState("SC", "No upcoming sessions");
    }

    // ---- Quiz Engine UI ----
    let activeQuiz = { questions: [], answers: {}, quizId: null, courseId: null, current: 0 };

    function openQuizModal(quizId, courseId) {
      const quiz = DB.getQuizzes().find(q => q.id === quizId);
      const course = DB.getCourseById(courseId);
      if (!quiz || !course) return;
      const questions = QuizEngine.generateQuestions(course.title);
      activeQuiz = { questions, answers: {}, quizId, courseId, current: 0 };
      renderQuizQuestion();
    }

    function renderQuizQuestion() {
      const { questions, answers, current } = activeQuiz;
      if (current >= questions.length) { showQuizResults(); return; }
      const q = questions[current];
      const pct = Math.round(((current) / questions.length) * 100);
      UI.showModal(`
        <div class="modal-title">Quiz — Question ${current + 1} of ${questions.length}</div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%;"></div></div>
        <div class="quiz-question">
          <div class="q-number">Question ${current + 1}</div>
          <div class="q-text">${q.q}</div>
          ${q.options.map((opt, i) => `
            <div class="quiz-option ${answers[current] === i ? 'selected' : ''}" onclick="selectAnswer(${i})" id="opt-${i}">
              <span style="width:24px;height:24px;border:2px solid var(--gray-300);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">${String.fromCharCode(65+i)}</span>
              ${opt}
            </div>`).join("")}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Exit Quiz</button>
          <button class="btn btn-primary" onclick="nextQuestion()" ${answers[current] === undefined ? 'disabled' : ''} id="quiz-next-btn">
            ${current + 1 < questions.length ? 'Next →' : 'Submit Quiz'}
          </button>
        </div>`);
    }

    function selectAnswer(idx) {
      activeQuiz.answers[activeQuiz.current] = idx;
      document.querySelectorAll(".quiz-option").forEach((el, i) => {
        el.classList.toggle("selected", i === idx);
      });
      const btn = document.getElementById("quiz-next-btn");
      if (btn) btn.disabled = false;
    }

    function nextQuestion() {
      activeQuiz.current++;
      renderQuizQuestion();
    }

    function showQuizResults() {
      const { questions, answers, quizId } = activeQuiz;
      const result = QuizEngine.score(questions, answers);
      const pass = result.pct >= 60;
      const quiz = DB.getQuizzes().find(q => q.id === quizId);
      DB.recordQuizAttempt(quizId, result.pct);
      if (pass && user) {
        DB.updateUser(user.id, { skillPoints: (DB.getUserById(user.id)?.skillPoints || 0) + Math.round(result.pct / 10) });
        document.getElementById('skill-pts').textContent = DB.getUserById(user.id)?.skillPoints || 0;
      }
      if (user) {
        const quizModule = DB.getCourseModules(activeQuiz.courseId).find(m => m.type === 'quiz');
        if (quizModule && !DB.isCourseModuleComplete(user.id, activeQuiz.courseId, quizModule.id)) {
          DB.markCourseModuleComplete(user.id, activeQuiz.courseId, quizModule.id);
        }
      }
      if (user?.instructorId) {
        const learnerName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        DB.addNotification(user.instructorId, `${learnerName} completed Quiz: ${quiz?.title || 'Course Quiz'} – Score: ${result.correct}/${result.total}`, 'feedback');
      }
      UI.showModal(`
        <div class="quiz-result">
          <div class="score-circle ${pass ? 'pass' : 'fail'}">${result.pct}%</div>
          <h3 style="margin-bottom:8px;">${pass ? 'Well Done' : 'Try Again'}</h3>
          <p style="margin-bottom:20px;">${result.correct} out of ${result.total} questions correct.</p>
          ${pass ? `<div class="alert alert-green" style="text-align:left;margin-bottom:16px;">✅ You passed! <strong>+${Math.round(result.pct/10)} skill points</strong> awarded.</div>` : `<div class="alert alert-red" style="text-align:left;margin-bottom:16px;">Score below 60%. Review the course material and try again.</div>`}
          <h4 style="margin-bottom:12px;text-align:left;">Answer Review:</h4>
          ${questions.map((q, i) => {
            const correct = answers[i] === q.ans;
            return `<div style="padding:10px;background:${correct?'var(--green-light)':'var(--red-light)'};border-radius:6px;margin-bottom:6px;text-align:left;font-size:13px;">
              <strong>${correct?'✓':'✗'} Q${i+1}:</strong> ${q.q}<br>
              <span style="color:var(--gray-600);">Your answer: ${q.options[answers[i]]||'Not answered'}</span>
              ${!correct?`<br><span style="color:var(--green);font-weight:700;">Correct: ${q.options[q.ans]}</span>`:''}
            </div>`;
          }).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
          ${!pass ? `<button class="btn btn-primary" onclick="retakeQuiz()">Retake Quiz</button>` : ''}
        </div>`);
    }

    function retakeQuiz() {
      const { quizId, courseId } = activeQuiz;
      openQuizModal(quizId, courseId);
    }

    function getModuleTypeLabel(type) {
      const labels = { video: 'Video', article: 'Article', quiz: 'Quiz' };
      return labels[type] || 'Module';
    }

    function openCourseView(courseId) {
      const course = DB.getCourseById(courseId);
      const enroll = DB.getLearnerEnrollments(user?.id || 'u6').find(e => e.courseId === courseId);
      const modules = DB.getCourseModules(courseId);
      const progressRecord = DB.getLearnerCourseProgress(user?.id || 'u6', courseId);
      const completedIds = progressRecord?.completedModuleIds || [];
      const completedCount = modules.filter(m => completedIds.includes(m.id)).length;
      const nextModule = DB.getNextIncompleteCourseModule(user?.id || 'u6', courseId);
      UI.showModal(`
        <div class="modal-title">${course?.title}</div>
        <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px;">${course?.description}</p>
        <div style="background:var(--blue-light);padding:14px;border-radius:8px;margin-bottom:16px;">
          <div class="flex-between"><span style="font-size:13px;font-weight:700;">Your Progress</span><span style="font-weight:800;color:var(--blue);">${enroll?.progress||0}%</span></div>
          <div class="progress-bar mt-8"><div class="progress-fill blue" style="width:${enroll?.progress||0}%;"></div></div>
          <div style="font-size:12px;color:var(--gray-600);margin-top:8px;">${completedCount} of ${modules.length} modules completed</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;">
          <div style="background:var(--gray-50);padding:10px;border-radius:8px;text-align:center;"><div style="font-weight:800;">${modules.length}</div><div style="font-size:12px;">Modules</div></div>
          <div style="background:var(--gray-50);padding:10px;border-radius:8px;text-align:center;"><div style="font-weight:800;">${course?.duration}</div><div style="font-size:12px;">Duration</div></div>
          <div style="background:var(--orange-light);padding:10px;border-radius:8px;text-align:center;"><div style="font-weight:800;color:var(--orange);">+${course?.skillPoints} pts</div><div style="font-size:12px;">Reward</div></div>
        </div>
        <div class="course-module-list">
          ${modules.map(m => {
            const done = completedIds.includes(m.id);
            return `<div class="course-module-item">
              <div class="course-module-meta">
                <div class="course-module-top">
                  <span class="module-type-badge">${getModuleTypeLabel(m.type)}</span>
                  <span class="course-module-title">${m.title}</span>
                </div>
                <div class="course-module-sub">${m.duration} • ${m.description}</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                ${done ? `<span class="module-complete-badge">✓</span>` : ((enroll?.status === 'pending_approval' || completedIds.includes(m.id)) ? `<span class="module-complete-badge">✓</span>` : `<button class="btn btn-secondary btn-sm" onclick="completeCourseModule('${courseId}','${m.id}')">Mark Done</button>`)}
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
          <button class="btn btn-primary" onclick="continueLesson('${courseId}')" ${(!nextModule || enroll?.status === 'pending_approval') ? 'disabled' : ''}>${enroll?.status === 'pending_approval' ? 'Awaiting Approval' : 'Continue Learning'}</button>
        </div>`);
    }

    function completeCourseModule(courseId, moduleId) {
      const uid = user?.id || 'u6';
      const enroll = DB.getLearnerEnrollments(uid).find(e => e.courseId === courseId);
      if (enroll?.status === 'pending_approval') {
        UI.showToast('This course is already awaiting instructor approval.', 'info');
        return;
      }
      if (DB.isCourseModuleComplete(uid, courseId, moduleId)) {
        UI.showToast('This module is already completed.', 'info');
        return;
      }
      const result = DB.markCourseModuleComplete(uid, courseId, moduleId);
      const course = DB.getCourseById(courseId);
      if (result.status === 'completed') {
        if (user?.instructorId) {
          DB.updateEnrollment(uid, courseId, { status: 'pending_approval', progress: 100, completionRequestedAt: todayISO() });
          DB.requestCompletionApproval({ type: 'course', learnerId: uid, instructorId: user.instructorId, refId: courseId });
          DB.addNotification(uid, `Course "${course?.title}" submitted for instructor approval. Skill points will be awarded after approval.`, 'info');
          UI.showToast('Course submitted for instructor approval.');
        } else {
          const pts = course?.skillPoints || 0;
          DB.updateUser(uid, { skillPoints: (DB.getUserById(uid)?.skillPoints || 0) + pts });
          DB.updateEnrollment(uid, courseId, { status: 'completed', progress: 100, rewardGrantedAt: todayISO() });
          DB.addNotification(uid, `Course "${course?.title}" completed! +${pts} skill points`, 'achievement');
          document.getElementById('skill-pts').textContent = DB.getUserById(uid)?.skillPoints || 0;
          UI.showToast(`Course completed! +${pts} skill points awarded!`);
        }
      } else {
        UI.showToast('Module completed. Progress updated.');
      }
      renderLearning();
      renderStats();
      openCourseView(courseId);
    }

    function continueLesson(courseId) {
      const uid = user?.id || 'u6';
      const nextModule = DB.getNextIncompleteCourseModule(uid, courseId);
      if (!nextModule) {
        UI.closeModal();
        UI.showToast('All course modules are already completed.', 'info');
        return;
      }
      completeCourseModule(courseId, nextModule.id);
    }

    // NOTIFICATIONS
    function renderNotifications() {
      const notifs = DB.getNotifications(user?.id || "u6");
      const colors = { assignment:"var(--blue)", session:"var(--green)", achievement:"var(--orange)", feedback:"var(--purple)", course:"var(--blue)", info:"var(--gray-500)" };
      const icons = { assignment:"Assignment", session:"Session", achievement:"Achievement", feedback:"Feedback", course:"Course", info:"Info" };
      document.getElementById("notifications-list").innerHTML = notifs.length ? notifs.map(n => `
        <div class="notif-row" style="${n.read?'opacity:0.6':''}">
          <div class="notif-dot" style="background:${colors[n.type]||'var(--gray-400)'};"></div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:${n.read?'400':'700'};">${icons[n.type]||'🔔'} ${n.message}</div>
            <div style="font-size:11px;color:var(--gray-400);margin-top:3px;">${n.createdAt}</div>
          </div>
          ${!n.read ? `<button class="btn btn-secondary btn-sm" onclick="markRead('${n.id}')">Mark read</button>` : ''}
        </div>`).join("") : `<div class="empty-state"><div class="icon">NT</div><p>No notifications</p></div>`;
      updateNotifBadge();
      window.addEventListener('resize', () => {
        if (document.getElementById('view-portfolio')?.classList.contains('active')) {
          renderPortfolioGraph();
        }
      });
    }

    function markRead(id) { DB.markRead(id); renderNotifications(); }
    function markAllRead() {
      DB.markAllRead(user?.id || "u6");
      renderNotifications(); UI.showToast("All marked as read");
    }

    // SETTINGS
    function renderSettings() {
      if (!user) return;
      document.getElementById("set-first").value = user.firstName || "";
      document.getElementById("set-last").value = user.lastName || "";
      document.getElementById("set-email").value = user.email || "";
      document.getElementById("set-inst").value = user.institution || "";
      document.getElementById("set-major").value = user.major || "";
      document.getElementById("account-info").innerHTML = `
        <div>Role: <strong>${user.role}</strong></div>
        <div>Student ID: <strong>${user.studentId || "N/A"}</strong></div>
        <div>Grade: <strong>${user.grade || "N/A"}</strong></div>
        <div>Member Since: <strong>${user.createdAt || "N/A"}</strong></div>
        <div>Experience: <strong>${user.experience || "N/A"}</strong></div>
        <div>Risk Tolerance: <strong>${user.riskTolerance || "N/A"}</strong></div>`;
    }

    function saveSettings() {
      const ok = Validation.validate([
        Validation.name('set-first', 'First name', 3),
        Validation.name('set-last', 'Last name', 3),
        Validation.minLength('set-inst', 'Institution', 3),
        Validation.notStartingWithNumber('set-inst', 'Institution'),
        Validation.minLength('set-major', 'Course / Major', 3)
      ]);
      if (!ok) return;
      DB.updateUser(user.id, {
        firstName: document.getElementById('set-first').value.trim(),
        lastName: document.getElementById('set-last').value.trim(),
        institution: document.getElementById('set-inst').value.trim(),
        major: document.getElementById('set-major').value.trim()
      });
      UI.showToast('Settings saved.');
    }

    function checkPwNew() {
      const pw = document.getElementById("pw-new").value;
      const c = Validate.password(pw);
      document.getElementById("npw-len").className = "pw-rule" + (c.length?" met":"");
      document.getElementById("npw-upper").className = "pw-rule" + (c.upper?" met":"");
      document.getElementById("npw-num").className = "pw-rule" + (c.number?" met":"");
      document.getElementById("npw-special").className = "pw-rule" + (c.special?" met":"");
    }

    function changePassword() {
      const current = document.getElementById("pw-current").value;
      const newPw = document.getElementById("pw-new").value;
      const confirm = document.getElementById("pw-confirm").value;
      if (!current || !newPw || !confirm) { UI.showToast("All fields are required.", "error"); return; }
      if (current !== user.password) { UI.showToast("Current password is incorrect.", "error"); return; }
      const checks = Validate.password(newPw);
      if (!checks.valid()) { UI.showToast("New password doesn't meet requirements.", "error"); return; }
      if (newPw !== confirm) { UI.showToast("New passwords do not match.", "error"); return; }
      DB.updateUser(user.id, { password: newPw });
      document.getElementById("pw-current").value = "";
      document.getElementById("pw-new").value = "";
      document.getElementById("pw-confirm").value = "";
      UI.showToast("Password updated successfully!");
    }

    function openLearnerProfileModal() {
      if (!user) return;
      const enrollments = DB.getLearnerEnrollments(user.id);
      const completed   = enrollments.filter(e=>e.status==="completed").length;
      const trades      = DB.getLearnerTrades(user.id);
      const ret         = ((user.portfolioValue-100000)/100000*100).toFixed(2);
      UI.showModal(`
        <div class="modal-title">My Profile</div>
        <div style="text-align:center;margin-bottom:20px;">
          <div style="width:64px;height:64px;background:var(--blue-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px;">🎓</div>
          <div style="font-weight:800;font-size:1.1rem;">${user.firstName} ${user.lastName}</div>
          <div style="font-size:13px;color:var(--gray-500);">${user.email}</div>
          <span class="badge badge-blue" style="margin-top:8px;display:inline-block;">Learner</span>
        </div>
        <div class="report-card">
          <div class="report-metric"><span>Student ID</span><span style="font-weight:700;">${user.studentId||'N/A'}</span></div>
          <div class="report-metric"><span>Institution</span><span style="font-weight:700;">${user.institution||'N/A'}</span></div>
          <div class="report-metric"><span>Grade / Major</span><span style="font-weight:700;">${user.grade||'N/A'} – ${user.major||'N/A'}</span></div>
          <div class="report-metric"><span>Skill Points</span><span style="font-weight:700;color:var(--orange);">${user.skillPoints||0}</span></div>
          <div class="report-metric"><span>Portfolio Value</span><span style="font-weight:700;">${fmtINR(user.portfolioValue||0)}</span></div>
          <div class="report-metric"><span>Total Return</span><span class="${gainLossClass(ret)}">${fmtPct(Number(ret))}</span></div>
          <div class="report-metric"><span>Total Trades</span><span style="font-weight:700;">${trades.length}</span></div>
          <div class="report-metric"><span>Courses Completed</span><span style="font-weight:700;">${completed} / ${enrollments.length}</span></div>
          <div class="report-metric"><span>Experience Level</span><span style="font-weight:700;">${user.experience||'N/A'}</span></div>
          <div class="report-metric"><span>Risk Tolerance</span><span style="font-weight:700;">${user.riskTolerance||'N/A'}</span></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
          <button class="btn btn-primary" onclick="UI.closeModal();switchTab('settings')">Edit Profile</button>
        </div>`);
    }

    init();