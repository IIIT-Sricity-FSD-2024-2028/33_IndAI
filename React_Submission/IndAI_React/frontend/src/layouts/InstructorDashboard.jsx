import React from "react";
export default function InstructorDashboard({
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
          <div className="nav-brand-logo green">
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <div className="nav-brand-title">{"IndAI"}</div>
            <div className="nav-brand-sub">{"Instructor Portal"}</div>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-info green-info">
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            <span className="nav-info-label">{"My Students"}</span>
            <span
              id="student-count"
              className="nav-info-value"
              style={{ color: "var(--green)" }}
            >
              {slots["student-count"] ?? <>{"0"}</>}
            </span>
          </div>
          <div
            className="notif-btn"
            title="Notifications"
            onClick={(e) => {
              onAction("showNotificationsModal()", e);
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="notif-badge" id="notif-count">
              {slots["notif-count"] ?? <>{"0"}</>}
            </span>
          </div>
          <button
            className="profile-btn"
            title="Profile"
            aria-label="Profile"
            onClick={(e) => {
              onAction("openProfileModal()", e);
            }}
          >
            <svg viewBox="0 0 24 24">
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
      <div className="dashboard-content">
        <div className="stat-grid" id="instr-stats">
          {slots["instr-stats"] ?? <></>}
        </div>
        <div className="tab-bar tabs-7">
          <button
            id="tab-overview"
            className={"tab-btn" + (tab === "overview" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('overview')", e);
            }}
          >
            {slots["tab-overview"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                {"\n    Overview"}
              </>
            )}
          </button>
          <button
            id="tab-students"
            className={"tab-btn" + (tab === "students" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('students')", e);
            }}
          >
            {slots["tab-students"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {"\n    Students"}
              </>
            )}
          </button>
          <button
            id="tab-assignments"
            className={"tab-btn" + (tab === "assignments" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('assignments')", e);
            }}
          >
            {slots["tab-assignments"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                {"\n    Assignments"}
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
                <svg viewBox="0 0 24 24">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                </svg>
                {"\n    My Trading"}
              </>
            )}
          </button>
          <button
            id="tab-analysis"
            className={"tab-btn" + (tab === "analysis" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('analysis')", e);
            }}
          >
            {slots["tab-analysis"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                {"\n    Analysis"}
              </>
            )}
          </button>
          <button
            id="tab-earnings"
            className={"tab-btn" + (tab === "earnings" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('earnings')", e);
            }}
          >
            {slots["tab-earnings"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M8 8h8M8 12h6M12 8c0 5-2 7-5 8"></path>
                </svg>
                {"\n    Earnings"}
              </>
            )}
          </button>
          <button
            id="tab-history"
            className={"tab-btn" + (tab === "history" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('history')", e);
            }}
          >
            {slots["tab-history"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {"\n    History"}
              </>
            )}
          </button>
        </div>
        {tab === "overview" && (
          <div
            id="view-overview"
            className={"view-section" + (tab === "overview" ? " active" : "")}
          >
            {slots["view-overview"] ?? (
              <>
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          {"Class Performance Leaderboard"}
                        </div>
                        <div className="card-subtitle">
                          {"Top performing students this month"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            onAction("openSendNotificationModal()", e);
                          }}
                        >
                          {"Send Notification"}
                        </button>
                        <button
                          className="btn btn-green btn-sm"
                          onClick={(e) => {
                            onAction("openAwardPointsModal()", e);
                          }}
                        >
                          {"Award Points"}
                        </button>
                      </div>
                    </div>
                    <div id="leaderboard-list">
                      {slots["leaderboard-list"] ?? <></>}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{"Recent Activity"}</div>
                        <div className="card-subtitle">
                          {"Latest student actions and achievements"}
                        </div>
                      </div>
                    </div>
                    <div id="recent-activity">
                      {slots["recent-activity"] ?? <></>}
                    </div>
                    <div className="divider"></div>
                    <div
                      className="card-header"
                      style={{ marginBottom: "12px" }}
                    >
                      <div>
                        <div className="card-title">{"Upcoming Sessions"}</div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          onAction("openScheduleSessionModal()", e);
                        }}
                      >
                        {"+ Schedule"}
                      </button>
                    </div>
                    <div id="upcoming-sessions-overview">
                      {slots["upcoming-sessions-overview"] ?? <></>}
                    </div>
                  </div>
                </div>
                <div className="card mt-24">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{"Active Assignments"}</div>
                      <div className="card-subtitle">
                        {"Monitor assignment progress"}
                      </div>
                    </div>
                    <button
                      className="btn btn-orange btn-sm"
                      onClick={(e) => {
                        onAction("openCreateAssignmentModal()", e);
                      }}
                    >
                      {"+ New Assignment"}
                    </button>
                  </div>
                  <div id="overview-assignments">
                    {slots["overview-assignments"] ?? <></>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "students" && (
          <div
            id="view-students"
            className={"view-section" + (tab === "students" ? " active" : "")}
          >
            {slots["view-students"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Student Management"}</h3>
                    <p className="page-subtitle">
                      {"Monitor and manage your assigned students"}
                    </p>
                  </div>
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
                      type="text"
                      id="student-search"
                      className="form-input"
                      style={{ width: "220px" }}
                      placeholder="Search students..."
                      value={form["student-search"] ?? ""}
                      onChange={(e) =>
                        onField("student-search", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div id="students-list">{slots["students-list"] ?? <></>}</div>
              </>
            )}
          </div>
        )}
        {tab === "assignments" && (
          <div
            id="view-assignments"
            className={
              "view-section" + (tab === "assignments" ? " active" : "")
            }
          >
            {slots["view-assignments"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Assignments & Sessions"}</h3>
                    <p className="page-subtitle">
                      {"Manage trading exercises and class schedules"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn btn-orange btn-sm"
                      onClick={(e) => {
                        onAction("openCreateAssignmentModal()", e);
                      }}
                    >
                      {"+ New Assignment"}
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onClick={(e) => {
                        onAction("openScheduleSessionModal()", e);
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {" Schedule Session"}
                    </button>
                  </div>
                </div>
                <h4
                  style={{
                    marginBottom: "12px",
                    fontSize: "14px",
                    color: "var(--gray-600)",
                  }}
                >
                  {"Trading Assignments"}
                </h4>
                <div id="assignments-list">
                  {slots["assignments-list"] ?? <></>}
                </div>
                <h4
                  style={{
                    margin: "24px 0 12px",
                    fontSize: "14px",
                    color: "var(--gray-600)",
                  }}
                >
                  {"Trading Sessions"}
                </h4>
                <div id="sessions-list">{slots["sessions-list"] ?? <></>}</div>
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
                <div className="stat-grid" id="trading-stats">
                  {slots["trading-stats"] ?? <></>}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    background: "var(--gray-100)",
                    borderRadius: "var(--radius-sm)",
                    padding: "4px",
                    marginBottom: "20px",
                    width: "fit-content",
                  }}
                >
                  <button
                    className="ptab active"
                    id="itab-portfolio"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={(e) => {
                      onAction("switchITradingTab('portfolio')", e);
                    }}
                  >
                    {slots["itab-portfolio"] ?? (
                      <>
                        <svg
                          width="14"
                          height="14"
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
                          <rect
                            x="14"
                            y="14"
                            width="8"
                            height="8"
                            rx="1"
                          ></rect>
                        </svg>
                        {" My Portfolio"}
                      </>
                    )}
                  </button>
                  <button
                    className="ptab"
                    id="itab-watchlist"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={(e) => {
                      onAction("switchITradingTab('watchlist')", e);
                    }}
                  >
                    {slots["itab-watchlist"] ?? (
                      <>
                        <svg
                          width="14"
                          height="14"
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
                    className="ptab"
                    id="itab-market"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={(e) => {
                      onAction("switchITradingTab('market')", e);
                    }}
                  >
                    {slots["itab-market"] ?? (
                      <>
                        <svg
                          width="14"
                          height="14"
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
                        {" Market"}
                      </>
                    )}
                  </button>
                  <button
                    className="ptab"
                    id="itab-class"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={(e) => {
                      onAction("switchITradingTab('class')", e);
                    }}
                  >
                    {slots["itab-class"] ?? (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        {" Class Overview"}
                      </>
                    )}
                  </button>
                </div>
                <div
                  className="itab-content active"
                  id="itab-content-portfolio"
                >
                  {slots["itab-content-portfolio"] ?? (
                    <>
                      <div className="grid-2">
                        <div className="card">
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
                                {" My Portfolio"}
                              </div>
                              <div className="card-subtitle">
                                {"Your personal paper trading account"}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "24px",
                              marginBottom: "16px",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--gray-400)",
                                }}
                              >
                                {"Portfolio Value"}
                              </div>
                              <div
                                id="i-port-val"
                                style={{
                                  fontWeight: "800",
                                  fontSize: "1.2rem",
                                }}
                              >
                                {slots["i-port-val"] ?? <></>}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--gray-400)",
                                }}
                              >
                                {"Returns"}
                              </div>
                              <div
                                id="i-port-ret"
                                style={{ fontSize: "1rem", fontWeight: "800" }}
                              >
                                {slots["i-port-ret"] ?? <></>}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--gray-400)",
                                }}
                              >
                                {"Cash Balance"}
                              </div>
                              <div
                                id="i-port-bal"
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: "800",
                                  color: "var(--green)",
                                }}
                              >
                                {slots["i-port-bal"] ?? <></>}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              height: "130px",
                              background: "var(--gray-50)",
                              borderRadius: "var(--radius-sm)",
                              padding: "12px",
                              overflow: "hidden",
                            }}
                          >
                            <svg
                              width="100%"
                              height="100%"
                              viewBox="0 0 600 110"
                              preserveAspectRatio="none"
                            >
                              <defs>
                                <lineargradient
                                  id="iPortGrad"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  {slots["iPortGrad"] ?? (
                                    <>
                                      <stop
                                        offset="0%"
                                        stopColor="#10B981"
                                        stopOpacity="0.3"
                                      ></stop>
                                      <stop
                                        offset="100%"
                                        stopColor="#10B981"
                                        stopOpacity="0"
                                      ></stop>
                                    </>
                                  )}
                                </lineargradient>
                              </defs>
                              <path
                                d="M0,80 C80,70 160,60 240,55 C320,50 400,40 600,30"
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="2.5"
                              ></path>
                              <path
                                d="M0,80 C80,70 160,60 240,55 C320,50 400,40 600,30 L600,110 L0,110 Z"
                                fill="url(#iPortGrad)"
                              ></path>
                            </svg>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              marginTop: "14px",
                            }}
                          >
                            <button
                              className="btn btn-green btn-sm"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                              onClick={(e) => {
                                onAction("switchITradingTab('market')", e);
                              }}
                            >
                              <svg
                                width="13"
                                height="13"
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
                              {" Trade Now"}
                            </button>
                          </div>
                        </div>
                        <div className="card">
                          <div className="card-header">
                            <div>
                              <div className="card-title">{"Holdings"}</div>
                              <div className="card-subtitle">
                                {"Current positions"}
                              </div>
                            </div>
                          </div>
                          <div id="i-holdings-list">
                            {slots["i-holdings-list"] ?? <></>}
                          </div>
                        </div>
                      </div>
                      <div className="card mt-16">
                        <div className="card-header">
                          <div>
                            <div className="card-title">{"Trade History"}</div>
                          </div>
                        </div>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>{"Symbol"}</th>
                                <th>{"Type"}</th>
                                <th>{"Qty"}</th>
                                <th>{"Price"}</th>
                                <th>{"Total"}</th>
                                <th>{"Date"}</th>
                                <th>{"Status"}</th>
                              </tr>
                            </thead>
                            <tbody id="i-trade-history">
                              {slots["i-trade-history"] ?? <></>}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="itab-content" id="itab-content-watchlist">
                  {slots["itab-content-watchlist"] ?? (
                    <>
                      <div className="flex-between mb-16">
                        <div>
                          <h3 className="page-title">{"My Watchlist"}</h3>
                          <p className="page-subtitle">
                            {"Stocks you're monitoring"}
                          </p>
                        </div>
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
                              <line
                                x1="21"
                                y1="21"
                                x2="16.65"
                                y2="16.65"
                              ></line>
                            </svg>
                          </span>
                          <input
                            id="i-watch-search"
                            className="form-input"
                            style={{ width: "200px" }}
                            placeholder="Search to add..."
                            value={form["i-watch-search"] ?? ""}
                            onChange={(e) =>
                              onField("i-watch-search", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div
                        id="i-search-results"
                        style={{ display: "none" }}
                        className="card mb-16"
                      >
                        {slots["i-search-results"] ?? <></>}
                      </div>
                      <div className="card">
                        <div id="i-watchlist-table">
                          {slots["i-watchlist-table"] ?? <></>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="itab-content" id="itab-content-market">
                  {slots["itab-content-market"] ?? (
                    <>
                      <div className="flex-between mb-16">
                        <div>
                          <h3 className="page-title">{"Market Explorer"}</h3>
                          <p className="page-subtitle">
                            {"Discover and trade stocks"}
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
                              <line
                                x1="21"
                                y1="21"
                                x2="16.65"
                                y2="16.65"
                              ></line>
                            </svg>
                          </span>
                          <input
                            id="i-market-search"
                            className="form-input"
                            placeholder="Search by symbol or company name..."
                            value={form["i-market-search"] ?? ""}
                            onChange={(e) =>
                              onField("i-market-search", e.target.value)
                            }
                          />
                        </div>
                        <div className="filter-chips" id="i-cap-filters">
                          {slots["i-cap-filters"] ?? (
                            <>
                              <button
                                className="chip active"
                                onClick={(e) => {
                                  onAction("iSetCapFilter('All',this)", e);
                                }}
                              >
                                {"All"}
                              </button>
                              <button
                                className="chip"
                                onClick={(e) => {
                                  onAction(
                                    "iSetCapFilter('Large Cap',this)",
                                    e,
                                  );
                                }}
                              >
                                {"Large Cap"}
                              </button>
                              <button
                                className="chip"
                                onClick={(e) => {
                                  onAction("iSetCapFilter('Mid Cap',this)", e);
                                }}
                              >
                                {"Mid Cap"}
                              </button>
                              <button
                                className="chip"
                                onClick={(e) => {
                                  onAction(
                                    "iSetCapFilter('Small Cap',this)",
                                    e,
                                  );
                                }}
                              >
                                {"Small Cap"}
                              </button>
                            </>
                          )}
                        </div>
                        <div className="filter-chips" id="i-sector-filters">
                          {slots["i-sector-filters"] ?? (
                            <>
                              <button
                                className="cat-chip active"
                                onClick={(e) => {
                                  onAction("iSetSectorFilter('All',this)", e);
                                }}
                              >
                                {"All"}
                              </button>
                              <button
                                className="cat-chip"
                                onClick={(e) => {
                                  onAction("iSetSectorFilter('IT',this)", e);
                                }}
                              >
                                {"IT"}
                              </button>
                              <button
                                className="cat-chip"
                                onClick={(e) => {
                                  onAction(
                                    "iSetSectorFilter('Banking',this)",
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
                                    "iSetSectorFilter('Energy',this)",
                                    e,
                                  );
                                }}
                              >
                                {"Energy"}
                              </button>
                              <button
                                className="cat-chip"
                                onClick={(e) => {
                                  onAction("iSetSectorFilter('FMCG',this)", e);
                                }}
                              >
                                {"FMCG"}
                              </button>
                              <button
                                className="cat-chip"
                                onClick={(e) => {
                                  onAction(
                                    "iSetSectorFilter('Pharma',this)",
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
                                    "iSetSectorFilter('Automobile',this)",
                                    e,
                                  );
                                }}
                              >
                                {"Auto"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid-3 mb-16">
                        <div
                          className="card market-summary-card"
                          id="i-market-card-gainers"
                          onClick={(e) => {
                            onAction("iApplyQuickMarket('gainers')", e);
                          }}
                        >
                          {slots["i-market-card-gainers"] ?? (
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
                              <div id="i-top-gainers">
                                {slots["i-top-gainers"] ?? <></>}
                              </div>
                            </>
                          )}
                        </div>
                        <div
                          className="card market-summary-card"
                          id="i-market-card-losers"
                          onClick={(e) => {
                            onAction("iApplyQuickMarket('losers')", e);
                          }}
                        >
                          {slots["i-market-card-losers"] ?? (
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
                              <div id="i-top-losers">
                                {slots["i-top-losers"] ?? <></>}
                              </div>
                            </>
                          )}
                        </div>
                        <div
                          className="card market-summary-card"
                          id="i-market-card-active"
                          onClick={(e) => {
                            onAction("iApplyQuickMarket('active')", e);
                          }}
                        >
                          {slots["i-market-card-active"] ?? (
                            <>
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
                              <div id="i-most-active">
                                {slots["i-most-active"] ?? <></>}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="card">
                        <div id="i-stock-list">
                          {slots["i-stock-list"] ?? <></>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="itab-content" id="itab-content-class">
                  {slots["itab-content-class"] ?? (
                    <>
                      <div className="grid-2">
                        <div className="card">
                          <div className="card-header">
                            <div>
                              <div className="card-title">
                                {"Class Trading Overview"}
                              </div>
                            </div>
                          </div>
                          <div id="class-trading-overview">
                            {slots["class-trading-overview"] ?? <></>}
                          </div>
                        </div>
                        <div className="card">
                          <div className="card-header">
                            <div>
                              <div className="card-title">
                                {"Recent Class Trades"}
                              </div>
                              <div className="card-subtitle">
                                {"Latest student trades"}
                              </div>
                            </div>
                          </div>
                          <div id="recent-trades-list">
                            {slots["recent-trades-list"] ?? <></>}
                          </div>
                        </div>
                      </div>
                      <div className="card mt-24">
                        <div className="card-header">
                          <div>
                            <div className="card-title">
                              {"Student Performance Reports"}
                            </div>
                          </div>
                        </div>
                        <div id="performance-reports">
                          {slots["performance-reports"] ?? <></>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {tab === "analysis" && (
        <div
          id="view-analysis"
          className={"view-section" + (tab === "analysis" ? " active" : "")}
        >
          {slots["view-analysis"] ?? (
            <>
              <div className="analysis-shell">
                <div className="flex-between mb-16">
                  <div>
                    <h3
                      className="page-title"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                      </svg>
                      {" Portfolio Analysis"}
                    </h3>
                    <p className="page-subtitle">
                      {"Deep performance insights for your class"}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={(e) => {
                      onAction("exportAnalysis()", e);
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    {" Export Report"}
                  </button>
                </div>
                <div id="analysis-content">
                  {slots["analysis-content"] ?? <></>}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {tab === "earnings" && (
        <div
          id="view-earnings"
          className={"view-section" + (tab === "earnings" ? " active" : "")}
        >
          {slots["view-earnings"] ?? (
            <>
              <div className="flex-between mb-16">
                <div>
                  <h3 className="page-title">{"Instructor Earnings"}</h3>
                  <p className="page-subtitle">
                    {
                      "Monthly compensation is calculated per assigned active student, with skill-growth bonuses controlled by Payment Admin"
                    }
                  </p>
                </div>
              </div>
              <div id="instructor-earnings-stats" className="stat-grid">
                {slots["instructor-earnings-stats"] ?? <></>}
              </div>
              <div className="grid-2 mt-16">
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{"Monthly Calculation"}</div>
                      <div className="card-subtitle">
                        {"Transparent compensation breakdown"}
                      </div>
                    </div>
                  </div>
                  <div id="instructor-earning-breakdown">
                    {slots["instructor-earning-breakdown"] ?? <></>}
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">
                        {"Bonus & Payout History"}
                      </div>
                      <div className="card-subtitle">
                        {"Performance incentives sanctioned by Payment Admin"}
                      </div>
                    </div>
                  </div>
                  <div id="instructor-payout-history">
                    {slots["instructor-payout-history"] ?? <></>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {tab === "history" && (
        <div
          id="view-history"
          className={"view-section" + (tab === "history" ? " active" : "")}
        >
          {slots["view-history"] ?? (
            <>
              <div className="analysis-shell">
                <div className="flex-between mb-16">
                  <div>
                    <h3
                      className="page-title"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      {" Trade History"}
                    </h3>
                    <p className="page-subtitle">
                      {"Complete record of all student trades"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      id="history-search"
                      className="form-input"
                      style={{ width: "200px" }}
                      placeholder="Search symbol or student\u2026"
                      value={form["history-search"] ?? ""}
                      onChange={(e) =>
                        onField("history-search", e.target.value)
                      }
                    />
                    <select
                      id="history-type"
                      className="form-select"
                      style={{ width: "120px" }}
                      value={form["history-type"] ?? ""}
                      onChange={(e) => onField("history-type", e.target.value)}
                    >
                      {slots["history-type"] ?? (
                        <>
                          <option value="">{"All Types"}</option>
                          <option value="BUY">{"BUY"}</option>
                          <option value="SELL">{"SELL"}</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{"Student"}</th>
                          <th>{"Symbol"}</th>
                          <th>{"Type"}</th>
                          <th>{"Qty"}</th>
                          <th>{"Price"}</th>
                          <th>{"Total"}</th>
                          <th>{"Date"}</th>
                          <th>{"Status"}</th>
                        </tr>
                      </thead>
                      <tbody id="history-tbody">
                        {slots["history-tbody"] ?? <></>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
