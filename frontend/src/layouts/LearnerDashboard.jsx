import React from "react";
export default function LearnerDashboard({
  slots = {},
  form = {},
  onField = () => {},
  onAction = () => {},
  tab = "",
  step = 1,
  busy = false,
  error = "",
  showPassword = false,
}) {
  return (
    <>
      <nav className="top-nav">
        <div className="flex-center gap-12">
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "var(--blue)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "1rem" }}>{"IndAI"}</div>
            <div style={{ fontSize: "11px", color: "var(--gray-500)" }}>
              {"Learner Portal"}
            </div>
          </div>
        </div>
        <div className="nav-right">
          <div
            className="nav-info"
            style={{
              background: "var(--orange-light)",
              borderColor: "#FDE68A",
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--orange)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
              </svg>
            </span>
            <span style={{ fontSize: "12px", color: "var(--gray-600)" }}>
              {"Skill Points"}
            </span>
            <span
              id="skill-pts"
              style={{ fontWeight: "800", color: "var(--orange)" }}
            >
              {slots["skill-pts"] ?? <>{"0"}</>}
            </span>
          </div>
          <button
            id="subscription-nav"
            className="btn btn-secondary btn-sm"
            style={{ whiteSpace: "nowrap" }}
            onClick={(e) => {
              onAction("switchTab('subscription')", e);
            }}
          >
            {slots["subscription-nav"] ?? <>{"Free Plan \u00b7 Upgrade"}</>}
          </button>
          <div
            className="notif-btn"
            onClick={(e) => {
              onAction("switchTab('notifications')", e);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="notif-badge" id="notif-count">
              {slots["notif-count"] ?? <>{"0"}</>}
            </span>
          </div>
          <button
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "2px solid var(--gray-200)",
              background: "var(--blue-light)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Profile"
            onClick={(e) => {
              onAction("openLearnerProfileModal()", e);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--blue)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          <button
            className="logout-btn"
            onClick={(e) => {
              onAction("Auth.logout()", e);
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {"Logout"}
          </button>
        </div>
      </nav>
      <section
        className="market-pulse-bar"
        id="market-pulse"
        aria-label="Dynamic stock market pulse"
      >
        {slots["market-pulse"] ?? (
          <>
            <div className="market-pulse-summary">
              <div className="market-pulse-live">
                <span className="market-pulse-dot" aria-hidden="true"></span>
                <span id="market-pulse-source">
                  {slots["market-pulse-source"] ?? <>{"LIVE MARKET"}</>}
                </span>
              </div>
              <div className="market-pulse-breadth" id="market-pulse-breadth">
                {slots["market-pulse-breadth"] ?? (
                  <>{"Connecting to stock feed\u2026"}</>
                )}
              </div>
            </div>
            <div className="market-pulse-viewport">
              <div
                className="ticker-track market-pulse-track"
                id="ticker-track"
                style={{
                  animationPlayState: form.__paused ? "paused" : "running",
                }}
                aria-live="polite"
              >
                {slots["ticker-track"] ?? <></>}
              </div>
            </div>
            <button
              className="market-pulse-toggle"
              id="market-pulse-toggle"
              type="button"
              title="Pause market ticker"
              aria-label="Pause market ticker"
              onClick={(e) => {
                onAction("toggleMarketPulseMotion()", e);
              }}
            >
              {slots["market-pulse-toggle"] ?? <>{"\u2161"}</>}
            </button>
          </>
        )}
      </section>
      <div className="dashboard-content">
        <div className="stat-grid" id="learner-stats">
          {slots["learner-stats"] ?? <></>}
        </div>
        <div className="tab-bar tabs-8">
          <button
            id="tab-portfolio"
            className={"tab-btn" + (tab === "portfolio" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('portfolio')", e);
            }}
          >
            {slots["tab-portfolio"] ?? (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="8" height="8" rx="1"></rect>
                  <rect x="14" y="2" width="8" height="8" rx="1"></rect>
                  <rect x="2" y="14" width="8" height="8" rx="1"></rect>
                  <rect x="14" y="14" width="8" height="8" rx="1"></rect>
                </svg>
                {" Portfolio"}
              </>
            )}
          </button>
          <button
            id="tab-watchlist"
            className={"tab-btn" + (tab === "watchlist" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('watchlist')", e);
            }}
          >
            {slots["tab-watchlist"] ?? (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {" Watchlist"}
              </>
            )}
          </button>
          <button
            id="tab-trading"
            className={"tab-btn" + (tab === "trading" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('trading')", e);
            }}
          >
            {slots["tab-trading"] ?? (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
                {" Trading"}
              </>
            )}
          </button>
          <button
            id="tab-challenges"
            className={"tab-btn" + (tab === "challenges" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('challenges')", e);
            }}
          >
            {slots["tab-challenges"] ?? (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                </svg>
                {" Challenges"}
              </>
            )}
          </button>
          <button
            id="tab-learning"
            className={"tab-btn" + (tab === "learning" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('learning')", e);
            }}
          >
            {slots["tab-learning"] ?? (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                {" Learning"}
              </>
            )}
          </button>
          <button
            id="tab-subscription"
            className={"tab-btn" + (tab === "subscription" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('subscription')", e);
            }}
          >
            {slots["tab-subscription"] ?? (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                {" Subscription"}
              </>
            )}
          </button>
          <button
            id="tab-notifications"
            className={"tab-btn" + (tab === "notifications" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('notifications')", e);
            }}
          >
            {slots["tab-notifications"] ?? (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {" Notifications"}
              </>
            )}
          </button>
          <button
            id="tab-settings"
            className={"tab-btn" + (tab === "settings" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('settings')", e);
            }}
          >
            {slots["tab-settings"] ?? (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                {" Settings"}
              </>
            )}
          </button>
        </div>
        {tab === "portfolio" && (
          <div
            id="view-portfolio"
            className={"view-section" + (tab === "portfolio" ? " active" : "")}
          >
            {slots["view-portfolio"] ?? (
              <>
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{"Portfolio Growth"}</div>
                        <div className="card-subtitle">
                          {"Track your portfolio performance over time"}
                        </div>
                      </div>
                      <div
                        style={{ display: "flex", gap: "6px" }}
                        id="period-btns"
                      >
                        {slots["period-btns"] ?? (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => {
                                onAction("setPeriod('1W',this)", e);
                              }}
                            >
                              {"1W"}
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                onAction("setPeriod('1M',this)", e);
                              }}
                            >
                              {"1M"}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => {
                                onAction("setPeriod('3M',this)", e);
                              }}
                            >
                              {"3M"}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => {
                                onAction("setPeriod('1Y',this)", e);
                              }}
                            >
                              {"1Y"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "32px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <div
                          style={{ fontSize: "12px", color: "var(--gray-400)" }}
                        >
                          {"Current Value"}
                        </div>
                        <div
                          id="port-val"
                          style={{ fontWeight: "800", fontSize: "1.2rem" }}
                        >
                          {slots["port-val"] ?? <></>}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{ fontSize: "12px", color: "var(--gray-400)" }}
                        >
                          {"Total Returns"}
                        </div>
                        <div
                          id="port-ret"
                          className="gain"
                          style={{ fontSize: "1rem", fontWeight: "800" }}
                        >
                          {slots["port-ret"] ?? <></>}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{ fontSize: "12px", color: "var(--gray-400)" }}
                        >
                          {"vs Benchmark"}
                        </div>
                        <div
                          style={{ color: "var(--green)", fontWeight: "800" }}
                        >
                          {"+1.75%"}
                        </div>
                      </div>
                    </div>
                    <div
                      className="portfolio-chart"
                      style={{
                        height: "220px",
                        background: "var(--gray-50)",
                        borderRadius: "var(--radius-sm)",
                        padding: "12px",
                        overflow: "hidden",
                      }}
                    >
                      <canvas id="portfolio-chart">
                        {slots["portfolio-chart"] ?? <></>}
                      </canvas>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{"Holdings"}</div>
                        <div className="card-subtitle">
                          {"Your current stock positions"}
                        </div>
                      </div>
                    </div>
                    <div id="holdings-list">
                      {slots["holdings-list"] ?? <></>}
                    </div>
                    <div className="divider"></div>
                    <div
                      className="card-header"
                      style={{ marginBottom: "12px" }}
                    >
                      <div>
                        <div className="card-title">{"Portfolio Analyzer"}</div>
                        <div className="card-subtitle">
                          {"AI-powered insights on your portfolio"}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px",
                          background: "var(--green-light)",
                          borderRadius: "8px",
                          borderLeft: "3px solid var(--green)",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "13px",
                            color: "#065F46",
                          }}
                        >
                          {"Strong Performance"}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#065F46",
                            marginTop: "2px",
                          }}
                        >
                          {"Your portfolio is outperforming the market by 2.4%"}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "12px",
                          background: "var(--orange-light)",
                          borderRadius: "8px",
                          borderLeft: "3px solid var(--orange)",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "13px",
                            color: "#92400E",
                          }}
                        >
                          {"Diversification Tip"}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#92400E",
                            marginTop: "2px",
                          }}
                        >
                          {
                            "Consider adding healthcare or FMCG stocks for better sector balance"
                          }
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "12px",
                          background: "var(--blue-light)",
                          borderRadius: "8px",
                          borderLeft: "3px solid var(--blue)",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "13px",
                            color: "var(--blue)",
                          }}
                        >
                          {"Risk Level: Moderate"}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--blue)",
                            marginTop: "2px",
                          }}
                        >
                          {"Portfolio volatility is within acceptable range"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card mt-24">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{"Trade History"}</div>
                      <div className="card-subtitle">
                        {"All your executed trades"}
                      </div>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{"Symbol"}</th>
                          <th>{"Type"}</th>
                          <th>{"Quantity"}</th>
                          <th>{"Price"}</th>
                          <th>{"Total"}</th>
                          <th>{"Date"}</th>
                          <th>{"Status"}</th>
                        </tr>
                      </thead>
                      <tbody id="trade-history">
                        {slots["trade-history"] ?? <></>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "watchlist" && (
          <div
            id="view-watchlist"
            className={"view-section" + (tab === "watchlist" ? " active" : "")}
          >
            {slots["view-watchlist"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Watchlist"}</h3>
                    <p className="page-subtitle">
                      {"Stocks you're monitoring"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div className="search-box">
                      <span className="search-icon">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </span>
                      <input
                        id="watch-search"
                        className="form-input"
                        style={{ width: "200px" }}
                        placeholder="Search to add..."
                        value={form["watch-search"] ?? ""}
                        onChange={(e) =>
                          onField("watch-search", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div
                  id="search-results"
                  style={{ display: "none" }}
                  className="card mb-16"
                >
                  {slots["search-results"] ?? <></>}
                </div>
                <div className="card">
                  <div id="watchlist-table">
                    {slots["watchlist-table"] ?? <></>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "trading" && (
          <div
            id="view-trading"
            className={"view-section" + (tab === "trading" ? " active" : "")}
          >
            {slots["view-trading"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Market Explorer"}</h3>
                    <p className="page-subtitle">
                      {"Discover and analyze stocks across all sectors"}
                    </p>
                  </div>
                </div>
                <div className="card mb-16">
                  <div className="search-box mb-16">
                    <span className="search-icon">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </span>
                    <input
                      id="market-search"
                      className="form-input"
                      placeholder="Search by symbol or company name..."
                      value={form["market-search"] ?? ""}
                      onChange={(e) => onField("market-search", e.target.value)}
                    />
                  </div>
                  <div className="filter-chips" id="cap-filters">
                    {slots["cap-filters"] ?? (
                      <>
                        <button
                          className="chip active"
                          onClick={(e) => {
                            onAction("TradingUI.setCapFilter('All',this)", e);
                          }}
                        >
                          {"All"}
                        </button>
                        <button
                          className="chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setCapFilter('Large Cap',this)",
                              e,
                            );
                          }}
                        >
                          {"Large Cap"}
                        </button>
                        <button
                          className="chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setCapFilter('Mid Cap',this)",
                              e,
                            );
                          }}
                        >
                          {"Mid Cap"}
                        </button>
                        <button
                          className="chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setCapFilter('Small Cap',this)",
                              e,
                            );
                          }}
                        >
                          {"Small Cap"}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="filter-chips" id="sector-filters">
                    {slots["sector-filters"] ?? (
                      <>
                        <button
                          className="cat-chip active"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('All',this)",
                              e,
                            );
                          }}
                        >
                          {"All"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction("TradingUI.setSectorFilter('IT',this)", e);
                          }}
                        >
                          {"IT"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('Banking',this)",
                              e,
                            );
                          }}
                        >
                          {"Banking"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('Energy',this)",
                              e,
                            );
                          }}
                        >
                          {"Energy"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('FMCG',this)",
                              e,
                            );
                          }}
                        >
                          {"FMCG"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('Pharma',this)",
                              e,
                            );
                          }}
                        >
                          {"Pharma"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('Automobile',this)",
                              e,
                            );
                          }}
                        >
                          {"Auto"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('Telecom',this)",
                              e,
                            );
                          }}
                        >
                          {"Telecom"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('Infrastructure',this)",
                              e,
                            );
                          }}
                        >
                          {"Infra"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('Power',this)",
                              e,
                            );
                          }}
                        >
                          {"Power"}
                        </button>
                        <button
                          className="cat-chip"
                          onClick={(e) => {
                            onAction(
                              "TradingUI.setSectorFilter('Technology',this)",
                              e,
                            );
                          }}
                        >
                          {"Tech"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid-3 mb-16">
                  <div className="card" id="top-gainers-card">
                    {slots["top-gainers-card"] ?? (
                      <>
                        <div
                          style={{
                            color: "var(--green)",
                            fontWeight: "800",
                            fontSize: "13px",
                            marginBottom: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                          {" Top Gainers"}
                        </div>
                        <div id="top-gainers">
                          {slots["top-gainers"] ?? <></>}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="card" id="top-losers-card">
                    {slots["top-losers-card"] ?? (
                      <>
                        <div
                          style={{
                            color: "var(--red)",
                            fontWeight: "800",
                            fontSize: "13px",
                            marginBottom: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                          {" Top Losers"}
                        </div>
                        <div id="top-losers">
                          {slots["top-losers"] ?? <></>}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="card">
                    <div
                      style={{
                        color: "var(--blue)",
                        fontWeight: "800",
                        fontSize: "13px",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      {" Most Active"}
                    </div>
                    <div id="most-active">{slots["most-active"] ?? <></>}</div>
                  </div>
                </div>
                <div className="card">
                  <div className="flex-between mb-16">
                    <div style={{ fontWeight: "700" }} id="stock-count-label">
                      {slots["stock-count-label"] ?? <>{"All Stocks"}</>}
                    </div>
                  </div>
                  <div id="stock-list">{slots["stock-list"] ?? <></>}</div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "challenges" && (
          <div
            id="view-challenges"
            className={"view-section" + (tab === "challenges" ? " active" : "")}
          >
            {slots["view-challenges"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Trading Challenges"}</h3>
                    <p className="page-subtitle">
                      {"Complete challenges to earn skill points"}
                    </p>
                  </div>
                </div>
                <div className="grid-2">
                  <div id="challenges-list">
                    {slots["challenges-list"] ?? <></>}
                  </div>
                  <div>
                    <div className="card mb-16">
                      <div className="card-header">
                        <div>
                          <div
                            className="card-title"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "7px",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--orange)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                              <path d="M4 22h16"></path>
                              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                              <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                            </svg>
                            {" Class Leaderboard"}
                          </div>
                          <div className="card-subtitle">
                            {"Top performers in your class"}
                          </div>
                        </div>
                      </div>
                      <div id="leaderboard-container">
                        {slots["leaderboard-container"] ?? <></>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "learning" && (
          <div
            id="view-learning"
            className={"view-section" + (tab === "learning" ? " active" : "")}
          >
            {slots["view-learning"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"My Learning"}</h3>
                    <p className="page-subtitle">
                      {"Your enrolled courses and progress"}
                    </p>
                  </div>
                </div>
                <div id="learning-list">{slots["learning-list"] ?? <></>}</div>
                <div className="card mt-24">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{"Course Catalog"}</div>
                      <div className="card-subtitle">
                        {
                          "Free, Pro and institution learning available to your account"
                        }
                      </div>
                    </div>
                  </div>
                  <div id="available-courses-list">
                    {slots["available-courses-list"] ?? <></>}
                  </div>
                </div>
                <div className="card mt-24">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{"Upcoming Sessions"}</div>
                      <div className="card-subtitle">
                        {"Scheduled trading classes"}
                      </div>
                    </div>
                  </div>
                  <div id="upcoming-sessions-learner">
                    {slots["upcoming-sessions-learner"] ?? <></>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "subscription" && (
          <div
            id="view-subscription"
            className={
              "view-section" + (tab === "subscription" ? " active" : "")
            }
          >
            {slots["view-subscription"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Plans & Subscription"}</h3>
                    <p className="page-subtitle">
                      {
                        "Upgrade to Pro for advanced courses, enhanced quizzes and premium learning material"
                      }
                    </p>
                  </div>
                  <span
                    id="subscription-status-badge"
                    className="badge badge-gray"
                  >
                    {slots["subscription-status-badge"] ?? <>{"FREE"}</>}
                  </span>
                </div>
                <div id="subscription-summary" className="mb-16">
                  {slots["subscription-summary"] ?? <></>}
                </div>
                <div id="subscription-plans" className="grid-3">
                  {slots["subscription-plans"] ?? <></>}
                </div>
                <div className="card mt-24">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{"Institution Access"}</div>
                      <div className="card-subtitle">
                        {
                          "B2B access supplied by your institute is separate from your personal Pro plan"
                        }
                      </div>
                    </div>
                  </div>
                  <div id="learner-institution-access">
                    {slots["learner-institution-access"] ?? <></>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "notifications" && (
          <div
            id="view-notifications"
            className={
              "view-section" + (tab === "notifications" ? " active" : "")
            }
          >
            {slots["view-notifications"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Notifications"}</h3>
                    <p className="page-subtitle">{"Your alerts and updates"}</p>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      onAction("markAllRead()", e);
                    }}
                  >
                    {"Mark all as read"}
                  </button>
                </div>
                <div className="card">
                  <div id="notifications-list">
                    {slots["notifications-list"] ?? <></>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "settings" && (
          <div
            id="view-settings"
            className={"view-section" + (tab === "settings" ? " active" : "")}
          >
            {slots["view-settings"] ?? (
              <>
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{"Profile Settings"}</div>
                        <div className="card-subtitle">
                          {"Update your personal information"}
                        </div>
                      </div>
                    </div>
                    <div id="settings-form">
                      {slots["settings-form"] ?? (
                        <>
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">
                                {"First Name"}
                              </label>
                              <input
                                id="set-first"
                                className="form-input"
                                value={form["set-first"] ?? ""}
                                onChange={(e) =>
                                  onField("set-first", e.target.value)
                                }
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">
                                {"Last Name"}
                              </label>
                              <input
                                id="set-last"
                                className="form-input"
                                value={form["set-last"] ?? ""}
                                onChange={(e) =>
                                  onField("set-last", e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">{"Email"}</label>
                            <input
                              id="set-email"
                              className="form-input"
                              readOnly={true}
                              style={{ opacity: "0.7" }}
                              value={form["set-email"] ?? ""}
                              onChange={(e) =>
                                onField("set-email", e.target.value)
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">
                              {"Institution"}
                            </label>
                            <input
                              id="set-inst"
                              className="form-input"
                              value={form["set-inst"] ?? ""}
                              onChange={(e) =>
                                onField("set-inst", e.target.value)
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">
                              {"Course / Major"}
                            </label>
                            <input
                              id="set-major"
                              className="form-input"
                              value={form["set-major"] ?? ""}
                              onChange={(e) =>
                                onField("set-major", e.target.value)
                              }
                            />
                          </div>
                          <button
                            className="btn btn-primary btn-block"
                            onClick={(e) => {
                              onAction("saveSettings()", e);
                            }}
                          >
                            {"Save Changes"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{"Change Password"}</div>
                        <div className="card-subtitle">
                          {"Update your account password"}
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Current Password *"}
                      </label>
                      <input
                        id="pw-current"
                        type="password"
                        className="form-input"
                        value={form["pw-current"] ?? ""}
                        onChange={(e) => onField("pw-current", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{"New Password *"}</label>
                      <input
                        id="pw-new"
                        type="password"
                        className="form-input"
                        value={form["pw-new"] ?? ""}
                        onChange={(e) => onField("pw-new", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Confirm New Password *"}
                      </label>
                      <input
                        id="pw-confirm"
                        type="password"
                        className="form-input"
                        value={form["pw-confirm"] ?? ""}
                        onChange={(e) => onField("pw-confirm", e.target.value)}
                      />
                    </div>
                    <div className="pw-req">
                      <div className="pw-req-title">
                        {"Password Requirements:"}
                      </div>
                      <div className="pw-rule" id="npw-len">
                        {slots["npw-len"] ?? <>{"At least 8 characters"}</>}
                      </div>
                      <div className="pw-rule" id="npw-upper">
                        {slots["npw-upper"] ?? <>{"One uppercase letter"}</>}
                      </div>
                      <div className="pw-rule" id="npw-num">
                        {slots["npw-num"] ?? <>{"One number"}</>}
                      </div>
                      <div className="pw-rule" id="npw-special">
                        {slots["npw-special"] ?? <>{"One special character"}</>}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-block mt-16"
                      onClick={(e) => {
                        onAction("changePassword()", e);
                      }}
                    >
                      {"Update Password"}
                    </button>
                    <div
                      className="card mt-24"
                      style={{ background: "var(--gray-50)" }}
                    >
                      <div style={{ fontWeight: "700", marginBottom: "12px" }}>
                        {"Account Information"}
                      </div>
                      <div
                        id="account-info"
                        style={{
                          fontSize: "13px",
                          color: "var(--gray-600)",
                          lineHeight: "2",
                        }}
                      >
                        {slots["account-info"] ?? <></>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
