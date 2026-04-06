// ============================================================
// IndAI Platform – Reusable Trading UI Component
// Used by both learner-dashboard and instructor-dashboard
// Requires: mockData.js, auth.js (DB, UI, fmtINR, etc.)
// ============================================================

const TradingUI = {
  // State
  _userId:        null,
  _capFilter:     "All",
  _sectorFilter:  "All",
  _tradeType:     "BUY",
  _prefix:        "",   // id prefix: "" for learner, "i-" for instructor

  /**
   * Initialise for a specific user and DOM id-prefix.
   * prefix="" → elements like "market-search", "stock-list" etc.
   * prefix="i-" → elements like "i-market-search", "i-stock-list" etc.
   */
  init(userId, prefix) {
    this._userId       = userId;
    this._prefix       = prefix || "";
    this._capFilter    = "All";
    this._sectorFilter = "All";
  },

  // ---- Helpers ----
  _el(id) { return document.getElementById(this._prefix + id); },

  // ---- Portfolio ----
  renderPortfolio() {
    const user     = DB.getUserById(this._userId);
    if (!user) return;
    DB.refreshTradingState(this._userId);

    // Initialise trading account if first time
    if (!user.virtualBalance || user.virtualBalance <= 0) {
      DB.updateUser(this._userId, { virtualBalance: 100000, portfolioValue: 100000, tradingLimit: 150000 });
    }

    const portVal  = user.portfolioValue || 100000;
    const bal      = user.virtualBalance  || 100000;
    const ret      = ((portVal - 100000) / 100000 * 100).toFixed(2);

    const portValEl  = this._el("port-val");
    const portRetEl  = this._el("port-ret");
    const portBalEl  = this._el("port-bal");
    if (portValEl) portValEl.textContent = fmtINR(portVal);
    if (portRetEl) { portRetEl.textContent = fmtPct(Number(ret)); portRetEl.className = gainLossClass(ret); }
    if (portBalEl) portBalEl.textContent = fmtINR(bal);

    // Holdings
    const holdings = DB.getHoldings(this._userId);
    const holdArr  = Object.entries(holdings).filter(([, h]) => h.qty > 0);
    const holdingsEl = this._el("holdings-list");
    if (holdingsEl) {
      holdingsEl.innerHTML = holdArr.length
        ? holdArr.map(([sym, h]) => {
            const stock  = DB.getStockBySymbol(sym);
            const curVal = stock ? h.qty * stock.price : h.spent;
            const pnl    = stock ? stock.change : 0;
            const avgPx  = h.qty > 0 ? Math.round(h.spent / h.qty) : 0;
            const unrealised = stock ? (stock.price - avgPx) * h.qty : 0;
            return `<div class="holding-row">
              <div>
                <div class="holding-sym">${sym}</div>
                <div class="holding-meta">${h.qty} shares · Avg ₹${avgPx.toLocaleString("en-IN")}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:800;">${fmtINR(curVal)}</div>
                <div class="${gainLossClass(pnl)}">${pnl >= 0 ? "+" : ""}${pnl}%</div>
                <div style="font-size:11px;color:var(--gray-400);">P&L: <span class="${gainLossClass(unrealised)}">${fmtINR(unrealised)}</span></div>
              </div>
            </div>`;
          }).join("")
        : `<p style="color:var(--gray-400);font-size:13px;padding:16px 0;">No holdings yet. Start trading!</p>`;
    }

    // Trade history
    const trades    = DB.getLearnerTrades(this._userId);
    const historyEl = this._el("trade-history");
    if (historyEl) {
      historyEl.innerHTML = trades.length
        ? [...trades].reverse().map(t => `<tr>
            <td style="font-weight:700;">${t.symbol}</td>
            <td><span class="badge ${t.type === "BUY" ? "badge-green" : "badge-red"}">${t.type}</span></td>
            <td>${t.qty}</td>
            <td>₹${t.price.toLocaleString("en-IN")}</td>
            <td style="font-weight:700;">${fmtINR(t.total)}</td>
            <td style="color:var(--gray-400);">${t.date}</td>
            <td><span class="badge badge-green">Executed</span></td>
          </tr>`).join("")
        : `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--gray-400);">No trades yet. Go to Market to start!</td></tr>`;
    }
  },

  // ---- Watchlist ----
  renderWatchlist() {
    const lists = DB.getWatchlists(this._userId);
    const active = DB.getActiveWatchlist(this._userId);
    const wl = active ? active.symbols : [];
    const stocks = wl.map(sym => DB.getStockBySymbol(sym)).filter(Boolean);
    const el     = this._el("watchlist-table");
    if (!el) return;
    const p = this._prefix;

    const toolbar = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <select id="${p}watchlist-select" class="form-select" style="min-width:190px;" onchange="TradingUI.switchWatchlist(this.value)">
          ${lists.map(w => `<option value="${w.id}" ${w.active ? 'selected' : ''}>${w.name} (${(w.symbols||[]).length})</option>`).join('')}
        </select>
        <button class="btn btn-secondary btn-sm" onclick="TradingUI.createWatchlist()">+ New List</button>
        <button class="btn btn-secondary btn-sm" onclick="TradingUI.deleteCurrentWatchlist()">Delete List</button>
      </div>
      <div style="font-size:12px;color:var(--gray-500);">Managing: <strong>${active?.name || 'My Watchlist'}</strong></div>
    </div>`;

    el.innerHTML = toolbar + (stocks.length
      ? `<table>
          <thead><tr><th>Symbol</th><th>Company</th><th>Price</th><th>Change</th><th>Cap</th><th>Sector</th><th>Actions</th></tr></thead>
          <tbody>${stocks.map(s => `<tr>
            <td style="font-weight:800;">${s.symbol}</td>
            <td style="font-size:13px;">${s.name}</td>
            <td style="font-weight:700;">₹${s.price.toLocaleString("en-IN")}</td>
            <td class="${s.change >= 0 ? "gain" : "loss"}">${s.change >= 0 ? "+" : ""}${s.change}%</td>
            <td><span class="badge badge-gray" style="font-size:11px;">${s.cap}</span></td>
            <td><span class="badge badge-blue" style="font-size:11px;">${s.sector}</span></td>
            <td><div style="display:flex;gap:8px;">
              <button class="btn btn-green btn-sm" onclick="TradingUI._openTradeModal('${s.symbol}','BUY')">Buy</button>
              <button class="btn btn-danger btn-sm" onclick="TradingUI._openTradeModal('${s.symbol}','SELL')">Sell</button>
              <button class="btn-icon danger" onclick="TradingUI.removeFromWatchlist('${s.symbol}')" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
            </div></td>
          </tr>`).join("")}</tbody>
        </table>`
      : emptyState("WL", "This watchlist is empty", "Search above to add stocks."));
  },

  switchWatchlist(id) {
    DB.setActiveWatchlist(this._userId, id);
    this.renderWatchlist();
  },

  createWatchlist() {
    DB.createWatchlist(this._userId);
    this.renderWatchlist();
    UI.showToast('New watchlist created.');
  },

  deleteCurrentWatchlist() {
    const active = DB.getActiveWatchlist(this._userId);
    if (!active) return;
    DB.deleteWatchlist(this._userId, active.id);
    this.renderWatchlist();
    UI.showToast('Watchlist updated.', 'info');
  },

  searchToAdd() {    const q   = (this._el("watch-search")?.value || "").toLowerCase().trim();
    const el  = this._el("search-results");
    if (!el) return;
    if (!q) { el.style.display = "none"; return; }
    const results = DB.getStocks().filter(s =>
      s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 6);
    if (!results.length) { el.style.display = "none"; return; }
    el.style.display = "block";
    el.innerHTML = results.map(s => `
      <div class="flex-between" style="padding:10px 0;border-bottom:1px solid var(--gray-100);">
        <div>
          <span style="font-weight:700;">${s.symbol}</span>
          <span style="font-size:13px;color:var(--gray-500);"> ${s.name}</span>
          <span class="badge badge-gray" style="font-size:10px;margin-left:6px;">${s.cap}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="${s.change >= 0 ? "gain" : "loss"}">${s.change >= 0 ? "+" : ""}${s.change}%</span>
          <span style="font-weight:700;font-size:13px;">₹${s.price.toLocaleString("en-IN")}</span>
          <button class="btn btn-secondary btn-sm" onclick="TradingUI.addToWatchlist('${s.symbol}')">Add</button>
        </div>
      </div>`).join("");
  },

  addToWatchlist(sym) {
    const added = DB.addToWatchlist(this._userId, sym);
    if (!added) { UI.showToast(sym + " is already in your watchlist.", "info"); return; }
    const el = this._el("watch-search");
    if (el) el.value = "";
    const res = this._el("search-results");
    if (res) res.style.display = "none";
    UI.showToast(sym + " added to watchlist!");
    this.renderWatchlist();
  },

  removeFromWatchlist(sym) {
    DB.removeFromWatchlist(this._userId, sym);
    UI.showToast(sym + " removed from watchlist.", "info");
    this.renderWatchlist();
  },

  // ---- Market / Stock Explorer ----
  renderMarket() {
    const stocks  = DB.getStocks();
    const gainers = [...stocks].sort((a, b) => b.change - a.change).slice(0, 5);
    const losers  = [...stocks].sort((a, b) => a.change - b.change).slice(0, 5);
    const active  = [...stocks].sort((a, b) => parseFloat(b.vol) - parseFloat(a.vol)).slice(0, 5);

    const topG = this._el("top-gainers");
    const topL = this._el("top-losers");
    const most = this._el("most-active");
    if (topG) topG.innerHTML = gainers.map(s =>
      `<div class="flex-between" style="padding:5px 0;">
        <div><span style="font-weight:700;font-size:13px;">${s.symbol}</span><br>
          <span style="font-size:11px;color:var(--gray-400);">₹${s.price.toLocaleString("en-IN")}</span></div>
        <span class="gain">+${s.change}%</span>
      </div>`).join("");
    if (topL) topL.innerHTML = losers.map(s =>
      `<div class="flex-between" style="padding:5px 0;">
        <div><span style="font-weight:700;font-size:13px;">${s.symbol}</span><br>
          <span style="font-size:11px;color:var(--gray-400);">₹${s.price.toLocaleString("en-IN")}</span></div>
        <span class="loss">${s.change}%</span>
      </div>`).join("");
    if (most) most.innerHTML = active.map(s =>
      `<div class="flex-between" style="padding:5px 0;">
        <div><span style="font-weight:700;font-size:13px;">${s.symbol}</span><br>
          <span style="font-size:11px;color:var(--gray-400);">Vol. ${s.vol}</span></div>
        <span class="${gainLossClass(s.change)}">${s.change >= 0 ? "+" : ""}${s.change}%</span>
      </div>`).join("");

    this.filterMarket();
  },

  setCapFilter(cap, btn) {
    this._capFilter = cap;
    const container = this._el("cap-filters");
    if (container) container.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    this.filterMarket();
  },

  setSectorFilter(sector, btn) {
    this._sectorFilter = sector;
    const container = this._el("sector-filters");
    if (container) container.querySelectorAll(".cat-chip").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    this.filterMarket();
  },

  filterMarket() {
    const q      = (this._el("market-search")?.value || "").toLowerCase();
    const stocks = DB.getStocks().filter(s => {
      const mQ   = !q || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      const mCap = this._capFilter   === "All" || s.cap    === this._capFilter;
      const mSec = this._sectorFilter === "All" || s.sector === this._sectorFilter;
      return mQ && mCap && mSec;
    });

    const countEl = this._el("stock-count-label");
    if (countEl) countEl.textContent = `Showing ${stocks.length} of ${DB.getStocks().length} stocks`;

    const listEl = this._el("stock-list");
    if (!listEl) return;
    listEl.innerHTML = stocks.length
      ? stocks.map(s => `
          <div class="stock-row">
            <div style="flex:2;">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-weight:800;">${s.symbol}</span>
                <span class="badge badge-gray" style="font-size:10px;">${s.cap}</span>
                <span class="badge badge-blue" style="font-size:10px;">${s.sector}</span>
              </div>
              <div style="font-size:12px;color:var(--gray-500);margin-top:2px;">
                ${s.name} · Market Cap: ${s.marketCap} · Vol: ${s.vol}
              </div>
            </div>
            <div style="text-align:right;margin-right:20px;">
              <div style="font-weight:800;font-size:15px;">₹${s.price.toLocaleString("en-IN")}</div>
              <div class="${gainLossClass(s.change)}">${s.change >= 0 ? "+" : ""}${s.change}%</div>
            </div>
            <button class="btn btn-green btn-sm" onclick="TradingUI._openTradeModal('${s.symbol}','BUY')">Trade Now</button>
          </div>`)
        .join("")
      : `<div class="empty-state">
          <div class="icon">SR</div>
          <p style="font-weight:600;color:var(--gray-700);">No stocks match your filters</p>
          <p style="font-size:12px;margin-top:4px;">Try selecting "All" for Cap or Sector</p>
          <button class="btn btn-secondary btn-sm" style="margin-top:12px;" onclick="TradingUI.resetFilters()">Reset Filters</button>
        </div>`;
  },

  resetFilters() {
    this._capFilter    = "All";
    this._sectorFilter = "All";
    const ms = this._el("market-search"); if (ms) ms.value = "";
    const cf = this._el("cap-filters");
    const sf = this._el("sector-filters");
    if (cf) cf.querySelectorAll(".chip").forEach((b, i) => b.classList.toggle("active", i === 0));
    if (sf) sf.querySelectorAll(".cat-chip").forEach((b, i) => b.classList.toggle("active", i === 0));
    this.filterMarket();
  },

  // ---- Trade Modal ----
  _openTradeModal(symbol, defaultType) {
    const stock = DB.getStockBySymbol(symbol);
    if (!stock) return;
    this._tradeType = defaultType;
    DB.refreshTradingState(this._userId);
    const user = DB.getUserById(this._userId);
    const bal  = user?.virtualBalance || 0;

    UI.showModal(`
      <div class="modal-title">Trade ${symbol}</div>
      <div class="trade-modal-stock" style="background:var(--blue-light);border-radius:var(--radius-sm);padding:14px;margin-bottom:16px;">
        <div style="font-weight:800;font-size:1.1rem;">${symbol}</div>
        <div style="font-size:13px;color:var(--gray-600);">${stock.name}</div>
        <div style="display:flex;gap:20px;margin-top:8px;flex-wrap:wrap;">
          <div><span style="font-size:12px;color:var(--gray-400);">Price</span><br><strong>₹${stock.price.toLocaleString("en-IN")}</strong></div>
          <div><span style="font-size:12px;color:var(--gray-400);">Change</span><br>
            <strong class="${gainLossClass(stock.change)}">${stock.change >= 0 ? "+" : ""}${stock.change}%</strong></div>
          <div><span style="font-size:12px;color:var(--gray-400);">My Balance</span><br><strong>${fmtINR(bal)}</strong></div>
          <div><span style="font-size:12px;color:var(--gray-400);">Sector</span><br><span class="badge badge-blue">${stock.sector}</span></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Order Type *</label>
        <div style="display:flex;gap:10px;">
          <button id="_trade-buy"  class="btn ${defaultType === "BUY"  ? "btn-green"   : "btn-secondary"} btn-block" onclick="TradingUI._setType('BUY')" >Buy</button>
          <button id="_trade-sell" class="btn ${defaultType === "SELL" ? "btn-danger"  : "btn-secondary"} btn-block" onclick="TradingUI._setType('SELL')" >Sell</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Quantity *</label>
        <input id="_trade-qty" type="number" class="form-input" placeholder="Number of shares" min="1"
          oninput="TradingUI._calcTotal('${symbol}')">
      </div>
      <div style="background:var(--gray-50);border-radius:var(--radius-sm);padding:12px;margin-bottom:16px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>Price per share:</span><strong>₹${stock.price.toLocaleString("en-IN")}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>Estimated Total:</span><strong id="_est-total">₹0</strong>
        </div>
      </div>
      <div id="_trade-error" class="alert alert-red" style="display:none;margin-bottom:12px;"></div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="TradingUI._executeTrade('${symbol}')">Confirm Order</button>
      </div>`);
  },

  _setType(type) {
    this._tradeType = type;
    document.getElementById("_trade-buy") .className = `btn ${type === "BUY"  ? "btn-green"  : "btn-secondary"} btn-block`;
    document.getElementById("_trade-sell").className = `btn ${type === "SELL" ? "btn-danger" : "btn-secondary"} btn-block`;
  },

  _calcTotal(sym) {
    const stock = DB.getStockBySymbol(sym);
    const qty   = parseInt(document.getElementById("_trade-qty")?.value) || 0;
    const el    = document.getElementById("_est-total");
    if (el) el.textContent = fmtINR(qty * (stock?.price || 0));
  },

  _executeTrade(symbol) {
    const qty   = parseInt(document.getElementById("_trade-qty").value);
    const stock = DB.getStockBySymbol(symbol);
    const errEl = document.getElementById("_trade-error");
    errEl.style.display = "none";

    if (!qty || qty <= 0)  { errEl.textContent = "Enter a valid quantity.";          errEl.style.display = "flex"; return; }
    if (qty > 10000)       { errEl.textContent = "Maximum 10,000 shares per order."; errEl.style.display = "flex"; return; }

    const result = DB.executeTrade(this._userId, symbol, this._tradeType, qty, stock.price);
    if (!result.success) { errEl.textContent = result.message; errEl.style.display = "flex"; return; }

    UI.closeModal();
    UI.showToast(`${this._tradeType} ${qty} x ${symbol} @ ₹${stock.price.toLocaleString("en-IN")} executed.`);

    // Refresh portfolio display
    this.renderPortfolio();

    // Refresh skill points badge if present
    const user = DB.getUserById(this._userId);
    const spEl = document.getElementById("skill-pts");
    if (spEl && user) spEl.textContent = user.skillPoints || 0;

    // Refresh top-level stats if function exists
    if (typeof renderStats === 'function') renderStats();
    if (typeof renderPortfolioGraph === 'function') renderPortfolioGraph();
    if (typeof updateNotifBadge === 'function') updateNotifBadge();
  }
};
