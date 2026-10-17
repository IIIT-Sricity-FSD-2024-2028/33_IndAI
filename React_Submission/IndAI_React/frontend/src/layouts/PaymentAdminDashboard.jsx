import React from "react";
export default function PaymentAdminDashboard({
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
      <nav className="admin-nav">
        <div className="flex-center gap-12">
          <div className="nav-brand-logo purple">
            <svg viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div>
            <div className="nav-brand-title">{"IndAI"}</div>
            <div className="nav-brand-sub">{"Payment Admin Portal"}</div>
          </div>
          <span
            id="nav-admin-name"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--gray-600)",
              marginLeft: "8px",
            }}
          >
            {slots["nav-admin-name"] ?? <></>}
          </span>
          <span
            id="nav-admin-team"
            className="badge badge-purple"
            style={{ marginLeft: "4px" }}
          >
            {slots["nav-admin-team"] ?? <>{"Admin Team"}</>}
          </span>
        </div>
        <div className="nav-right">
          <div className="nav-info purple-info">
            <svg viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <span className="nav-info-label">{"System Health"}</span>
            <span className="nav-info-value">{"98%"}</span>
          </div>
          <div
            className="notif-btn"
            title="Notifications"
            aria-label="Notifications"
            onClick={(e) => {
              onAction("openNotificationsModal()", e);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 17H9"></path>
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="notif-badge" id="notif-count">
              {slots["notif-count"] ?? <>{"0"}</>}
            </span>
          </div>
          <button
            className="profile-btn purple-profile"
            title="Profile"
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
            {"\n        Logout\n      "}
          </button>
        </div>
      </nav>
      <div className="content">
        <div className="stat-grid" id="admin-stats">
          {slots["admin-stats"] ?? <></>}
        </div>
        <div className="tab-bar tabs-5">
          <button
            id="tab-dashboard"
            className={"tab-btn" + (tab === "dashboard" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('dashboard')", e);
            }}
          >
            {slots["tab-dashboard"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                {"\n        Dashboard\n      "}
              </>
            )}
          </button>
          <button
            id="tab-users"
            className={"tab-btn" + (tab === "users" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('users')", e);
            }}
          >
            {slots["tab-users"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {"\n        User Management\n      "}
              </>
            )}
          </button>
          <button
            id="tab-config"
            className={"tab-btn" + (tab === "config" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('config')", e);
            }}
          >
            {slots["tab-config"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"></path>
                </svg>
                {"\n        Configuration\n      "}
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
                {"\n        Assignments\n      "}
              </>
            )}
          </button>
          <button
            id="tab-commercial"
            className={"tab-btn" + (tab === "commercial" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('commercial')", e);
            }}
          >
            {slots["tab-commercial"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                {"\n        Revenue & B2B\n      "}
              </>
            )}
          </button>
        </div>
        {tab === "dashboard" && (
          <div
            id="view-dashboard"
            className={"view-section" + (tab === "dashboard" ? " active" : "")}
          >
            {slots["view-dashboard"] ?? (
              <>
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          {"System Health Monitor"}
                        </div>
                        <div className="card-subtitle">
                          {"Real-time system performance metrics"}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div className="health-item green">
                        <div className="health-item-left">
                          <div className="health-icon green">
                            <svg viewBox="0 0 24 24">
                              <rect
                                x="2"
                                y="3"
                                width="20"
                                height="14"
                                rx="2"
                              ></rect>
                              <line x1="8" y1="21" x2="16" y2="21"></line>
                              <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                          </div>
                          <div>
                            <div className="health-title">
                              {"Server Status"}
                            </div>
                            <div className="health-sub">
                              {"All servers operational"}
                            </div>
                          </div>
                        </div>
                        <span className="badge badge-green">{"Online"}</span>
                      </div>
                      <div className="health-item blue">
                        <div className="health-item-left">
                          <div className="health-icon blue">
                            <svg viewBox="0 0 24 24">
                              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
                            </svg>
                          </div>
                          <div>
                            <div className="health-title">
                              {"API Response Time"}
                            </div>
                            <div className="health-sub">{"450ms average"}</div>
                          </div>
                        </div>
                        <span className="badge badge-blue">{"Good"}</span>
                      </div>
                      <div className="health-item purple">
                        <div className="health-item-left">
                          <div className="health-icon purple">
                            <svg viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="2"></circle>
                              <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>
                            </svg>
                          </div>
                          <div>
                            <div className="health-title">
                              {"Active Connections"}
                            </div>
                            <div className="health-sub">
                              {"89 users online"}
                            </div>
                          </div>
                        </div>
                        <span className="badge badge-purple">{"Normal"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          {"Recent System Activity"}
                        </div>
                        <div className="card-subtitle">
                          {"Latest platform events and updates"}
                        </div>
                      </div>
                    </div>
                    <div id="activity-list">
                      {slots["activity-list"] ?? <></>}
                    </div>
                  </div>
                </div>
                <div className="card mt-20">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{"User Growth Overview"}</div>
                      <div className="card-subtitle">
                        {"Platform adoption and engagement trends"}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: "16px",
                    }}
                    id="growth-stats"
                  >
                    {slots["growth-stats"] ?? <></>}
                  </div>
                </div>
                <div className="card mt-20">
                  <div className="card-header">
                    <div>
                      <div className="card-title">
                        {"Platform Analytics Report"}
                      </div>
                      <div className="card-subtitle">
                        {"Trade activity, returns and course metrics"}
                      </div>
                    </div>
                  </div>
                  <div id="platform-analytics">
                    {slots["platform-analytics"] ?? <></>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "users" && (
          <div
            id="view-users"
            className={"view-section" + (tab === "users" ? " active" : "")}
          >
            {slots["view-users"] ?? (
              <>
                <div className="section-header mb-16">
                  <div>
                    <h3>{"Student Management"}</h3>
                    <p style={{ fontSize: "13px", color: "var(--gray-500)" }}>
                      {"Manage learners and their permissions"}
                    </p>
                  </div>
                </div>
                <div className="sub-tab-row">
                  <button
                    className="btn btn-primary btn-sm"
                    id="sub-students"
                    onClick={(e) => {
                      onAction("showSubTab('students')", e);
                    }}
                  >
                    {slots["sub-students"] ?? <>{"Students"}</>}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    id="sub-instructors"
                    onClick={(e) => {
                      onAction("showSubTab('instructors')", e);
                    }}
                  >
                    {slots["sub-instructors"] ?? <>{"Instructors"}</>}
                  </button>
                </div>
                <div id="panel-students">
                  {slots["panel-students"] ?? (
                    <>
                      <div className="flex-end-row">
                        <button
                          className="btn btn-purple btn-sm"
                          onClick={(e) => {
                            onAction("openAddStudentModal()", e);
                          }}
                        >
                          {"+ Add Student"}
                        </button>
                      </div>
                      <div className="card">
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>{"Name / Status"}</th>
                                <th>{"Instructor"}</th>
                                <th>{"Skill Points"}</th>
                                <th>{"Trading Limit"}</th>
                                <th>{"Actions"}</th>
                              </tr>
                            </thead>
                            <tbody id="students-tbody">
                              {slots["students-tbody"] ?? <></>}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div id="panel-instructors" style={{ display: "none" }}>
                  {slots["panel-instructors"] ?? <></>}
                </div>
              </>
            )}
          </div>
        )}
        {tab === "config" && (
          <div
            id="view-config"
            className={"view-section" + (tab === "config" ? " active" : "")}
          >
            {slots["view-config"] ?? (
              <>
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          {"Trading Rules Configuration"}
                        </div>
                        <div className="card-subtitle">
                          {"Set platform-wide trading parameters"}
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Max Trading Limit (\u20b9)"}
                      </label>
                      <input
                        type="number"
                        id="a-cfg-maxlimit"
                        min="1000"
                        max="100000000"
                        step="1000"
                        className="form-input"
                        value={form["a-cfg-maxlimit"] ?? ""}
                        onChange={(e) =>
                          onField("a-cfg-maxlimit", e.target.value)
                        }
                      />
                      <span className="form-hint">
                        {"Maximum virtual money a learner can trade with"}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Max Skill Points per Challenge"}
                      </label>
                      <input
                        type="number"
                        id="a-cfg-maxpts"
                        min="1"
                        max="10000"
                        step="1"
                        className="form-input"
                        value={form["a-cfg-maxpts"] ?? ""}
                        onChange={(e) =>
                          onField("a-cfg-maxpts", e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Min Skill Points for Margin Trading"}
                      </label>
                      <input
                        type="number"
                        id="a-cfg-minmargin"
                        min="0"
                        max="10000"
                        step="1"
                        className="form-input"
                        value={form["a-cfg-minmargin"] ?? ""}
                        onChange={(e) =>
                          onField("a-cfg-minmargin", e.target.value)
                        }
                      />
                      <span className="form-hint">
                        {"Skill points required to unlock margin trading"}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{"Max Daily Trades"}</label>
                      <input
                        type="number"
                        id="a-cfg-maxtrades"
                        min="1"
                        max="10000"
                        step="1"
                        className="form-input"
                        value={form["a-cfg-maxtrades"] ?? ""}
                        onChange={(e) =>
                          onField("a-cfg-maxtrades", e.target.value)
                        }
                      />
                      <span className="form-hint">
                        {"Maximum number of trades per day"}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Trade Cooldown Period (minutes)"}
                      </label>
                      <input
                        type="number"
                        id="a-cfg-cooldown"
                        min="1"
                        max="1440"
                        step="1"
                        className="form-input"
                        value={form["a-cfg-cooldown"] ?? ""}
                        onChange={(e) =>
                          onField("a-cfg-cooldown", e.target.value)
                        }
                      />
                    </div>
                    <button
                      className="btn btn-purple btn-block"
                      onClick={(e) => {
                        onAction("saveAdminConfig()", e);
                      }}
                    >
                      {"Save Configuration"}
                    </button>
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{"Feature Management"}</div>
                        <div className="card-subtitle">
                          {"Enable or disable platform features"}
                        </div>
                      </div>
                    </div>
                    <div id="admin-feature-toggles">
                      {slots["admin-feature-toggles"] ?? <></>}
                    </div>
                    <div className="feature-status-wrap">
                      <div className="feature-status-title">
                        {"Feature Status"}
                      </div>
                      <div id="admin-feature-status">
                        {slots["admin-feature-status"] ?? <></>}
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="section-header mb-16">
                  <div>
                    <h3>{"Assignments Management"}</h3>
                    <p style={{ fontSize: "13px", color: "var(--gray-500)" }}>
                      {"Monitor and manage all assignments"}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      onAction("openAddAssignmentAdmin()", e);
                    }}
                  >
                    {"+ Add Assignment"}
                  </button>
                </div>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{"Title"}</th>
                          <th>{"Instructor"}</th>
                          <th>{"Difficulty"}</th>
                          <th>{"Due Date"}</th>
                          <th>{"Assigned"}</th>
                          <th>{"Completed"}</th>
                          <th>{"Actions"}</th>
                        </tr>
                      </thead>
                      <tbody id="admin-assignments-tbody">
                        {slots["admin-assignments-tbody"] ?? <></>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "commercial" && (
          <div
            id="view-commercial"
            className={"view-section" + (tab === "commercial" ? " active" : "")}
          >
            {slots["view-commercial"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title" id="commercial-page-title">
                      {slots["commercial-page-title"] ?? (
                        <>{"Commercial Operations"}</>
                      )}
                    </h3>
                    <p className="page-subtitle" id="commercial-page-subtitle">
                      {slots["commercial-page-subtitle"] ?? (
                        <>
                          {
                            "Institution licensing, course settlements, instructor compensation and platform revenue"
                          }
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div id="commercial-admin-content">
                  {slots["commercial-admin-content"] ?? <></>}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
