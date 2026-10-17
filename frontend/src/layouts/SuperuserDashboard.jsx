import React from "react";
export default function SuperuserDashboard({
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
      <nav className="super-nav">
        <div className="super-brand">
          <div className="super-brand-logo">
            <svg viewBox="0 0 24 24">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          {"\n      IndAI "}
          <span className="sub">{"Super Admin Portal"}</span>
        </div>
        <div className="super-nav-right">
          <div className="super-badge">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            {"\n        Platform Owner\n      "}
          </div>
          <span className="super-nav-name" id="nav-name">
            {slots["nav-name"] ?? <></>}
          </span>
          <div
            className="notif-btn"
            title="Notifications"
            onClick={(e) => {
              onAction("openSuperNotifModal()", e);
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
            className="super-profile-btn"
            title="Profile"
            onClick={(e) => {
              onAction("openSuperProfileModal()", e);
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          <button
            className="super-logout-btn"
            onClick={(e) => {
              onAction("Auth.logout()", e);
            }}
          >
            {"Logout"}
          </button>
        </div>
      </nav>
      <div className="content">
        <div className="stat-grid" id="super-stats">
          {slots["super-stats"] ?? <></>}
        </div>
        <div className="tab-nav">
          <button
            className={"tab-nav-btn" + (tab === "users" ? " active" : "")}
            onClick={(e) => {
              onAction("showView('users',this)", e);
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {"\n        All Users\n      "}
          </button>
          <button
            className={"tab-nav-btn" + (tab === "adminteam" ? " active" : "")}
            onClick={(e) => {
              onAction("showView('adminteam',this)", e);
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M19 8v6M22 11h-6"></path>
            </svg>
            {"\n        Admin Team\n      "}
          </button>
          <button
            className={"tab-nav-btn" + (tab === "courses" ? " active" : "")}
            onClick={(e) => {
              onAction("showView('courses',this)", e);
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            {"\n        Courses\n      "}
          </button>
          <button
            className={"tab-nav-btn" + (tab === "assignments" ? " active" : "")}
            onClick={(e) => {
              onAction("showView('assignments',this)", e);
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {"\n        Assignments\n      "}
          </button>
          <button
            className={"tab-nav-btn" + (tab === "sessions" ? " active" : "")}
            onClick={(e) => {
              onAction("showView('sessions',this)", e);
            }}
          >
            <svg viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {"\n        Sessions\n      "}
          </button>
          <button
            className={"tab-nav-btn" + (tab === "config" ? " active" : "")}
            onClick={(e) => {
              onAction("showView('config',this)", e);
            }}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"></path>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"></path>
            </svg>
            {"\n        System Config\n      "}
          </button>
          <button
            className={"tab-nav-btn" + (tab === "approvals" ? " active" : "")}
            id="tab-approvals"
            onClick={(e) => {
              onAction("showView('approvals',this)", e);
            }}
          >
            {slots["tab-approvals"] ?? (
              <>
                <svg viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {"\n        Approvals\n        "}
                <span
                  id="approval-badge"
                  className="notif-badge"
                  style={{
                    position: "static",
                    marginLeft: "2px",
                    display: "none",
                  }}
                >
                  {slots["approval-badge"] ?? <>{"0"}</>}
                </span>
              </>
            )}
          </button>
        </div>
        {tab === "users" && (
          <div
            id="view-users"
            className={"view-section" + (tab === "users" ? " active" : "")}
          >
            {slots["view-users"] ?? (
              <>
                <div className="section-header">
                  <div className="section-header-info">
                    <h3>{"User Management"}</h3>
                    <p>{"Full CRUD access to all platform users"}</p>
                  </div>
                  <div className="filter-bar">
                    <div className="search-box">
                      <svg viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="text"
                        id="user-search"
                        className="form-input"
                        style={{ width: "220px" }}
                        placeholder="Search users\u2026"
                        value={form["user-search"] ?? ""}
                        onChange={(e) => onField("user-search", e.target.value)}
                      />
                    </div>
                    <select
                      id="role-filter"
                      className="filter-select"
                      value={form["role-filter"] ?? ""}
                      onChange={(e) => onField("role-filter", e.target.value)}
                    >
                      {slots["role-filter"] ?? (
                        <>
                          <option value="">{"All Roles"}</option>
                          <option value="superuser">{"Super User"}</option>
                          <option value="admin">{"Admin"}</option>
                          <option value="instructor">{"Instructor"}</option>
                          <option value="provider">{"Provider"}</option>
                          <option value="learner">{"Learner"}</option>
                        </>
                      )}
                    </select>
                    <select
                      id="status-filter"
                      className="filter-select"
                      value={form["status-filter"] ?? ""}
                      onChange={(e) => onField("status-filter", e.target.value)}
                    >
                      {slots["status-filter"] ?? (
                        <>
                          <option value="">{"All Status"}</option>
                          <option value="active">{"Active"}</option>
                          <option value="pending">{"Pending"}</option>
                        </>
                      )}
                    </select>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        onAction("openAddUserModal()", e);
                      }}
                    >
                      {"+ Add User"}
                    </button>
                  </div>
                </div>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{"Name"}</th>
                          <th>{"Email"}</th>
                          <th>{"Role"}</th>
                          <th>{"Status"}</th>
                          <th>{"Skill Points"}</th>
                          <th>{"Created"}</th>
                          <th>{"Actions"}</th>
                        </tr>
                      </thead>
                      <tbody id="users-tbody">
                        {slots["users-tbody"] ?? <></>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "adminteam" && (
          <div
            id="view-adminteam"
            className={"view-section" + (tab === "adminteam" ? " active" : "")}
          >
            {slots["view-adminteam"] ?? (
              <>
                <div className="section-header">
                  <div className="section-header-info">
                    <h3>{"Admin Team"}</h3>
                    <p>
                      {
                        "Create, approve and manage the User Admin and Payment Admin divisions. IndAI keeps exactly one protected Super Admin."
                      }
                    </p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      onAction("openCreateAdminModal()", e);
                    }}
                  >
                    {"+ Create Admin"}
                  </button>
                </div>
                <div id="admin-team-content">
                  {slots["admin-team-content"] ?? <></>}
                </div>
              </>
            )}
          </div>
        )}
        {tab === "courses" && (
          <div
            id="view-courses"
            className={"view-section" + (tab === "courses" ? " active" : "")}
          >
            {slots["view-courses"] ?? (
              <>
                <div className="section-header">
                  <div className="section-header-info">
                    <h3>{"Course Management"}</h3>
                    <p>{"Manage all platform courses"}</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      onAction("openAddCourseModal()", e);
                    }}
                  >
                    {"+ Add Course"}
                  </button>
                </div>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{"Title"}</th>
                          <th>{"Provider"}</th>
                          <th>{"Lessons"}</th>
                          <th>{"Skill Pts"}</th>
                          <th>{"Enrolled"}</th>
                          <th>{"Completion"}</th>
                          <th>{"Status"}</th>
                          <th>{"Actions"}</th>
                        </tr>
                      </thead>
                      <tbody id="courses-tbody">
                        {slots["courses-tbody"] ?? <></>}
                      </tbody>
                    </table>
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
                <div className="section-header">
                  <div className="section-header-info">
                    <h3>{"Assignments"}</h3>
                    <p>{"All assignments across the platform"}</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      onAction("openAddAssignmentModal()", e);
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
                          <th>{"Status"}</th>
                          <th>{"Actions"}</th>
                        </tr>
                      </thead>
                      <tbody id="assignments-tbody">
                        {slots["assignments-tbody"] ?? <></>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "sessions" && (
          <div
            id="view-sessions"
            className={"view-section" + (tab === "sessions" ? " active" : "")}
          >
            {slots["view-sessions"] ?? (
              <>
                <div className="section-header">
                  <div className="section-header-info">
                    <h3>{"Trading Sessions"}</h3>
                    <p>{"All scheduled sessions across the platform"}</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      onAction("openAddSessionModal()", e);
                    }}
                  >
                    {"+ Add Session"}
                  </button>
                </div>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{"Title"}</th>
                          <th>{"Instructor"}</th>
                          <th>{"Date"}</th>
                          <th>{"Time"}</th>
                          <th>{"Duration"}</th>
                          <th>{"Type"}</th>
                          <th>{"Status"}</th>
                          <th>{"Actions"}</th>
                        </tr>
                      </thead>
                      <tbody id="sessions-tbody">
                        {slots["sessions-tbody"] ?? <></>}
                      </tbody>
                    </table>
                  </div>
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
                <div className="section-header">
                  <div className="section-header-info">
                    <h3>{"System Configuration"}</h3>
                    <p>
                      {"Platform-wide trading rules and feature management"}
                    </p>
                  </div>
                </div>
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
                    <div id="config-form">
                      {slots["config-form"] ?? (
                        <>
                          <p className="config-section-title">
                            {"Virtual Trading Limits"}
                          </p>
                          <div className="form-group">
                            <label className="form-label">
                              {"Max Trading Limit (\u20b9)"}
                            </label>
                            <input
                              type="number"
                              id="cfg-maxlimit"
                              min="1000"
                              max="100000000"
                              step="1000"
                              className="form-input"
                              value={form["cfg-maxlimit"] ?? ""}
                              onChange={(e) =>
                                onField("cfg-maxlimit", e.target.value)
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
                              id="cfg-maxpts"
                              min="1"
                              max="10000"
                              step="1"
                              className="form-input"
                              value={form["cfg-maxpts"] ?? ""}
                              onChange={(e) =>
                                onField("cfg-maxpts", e.target.value)
                              }
                            />
                          </div>
                          <p
                            className="config-section-title"
                            style={{ marginTop: "8px" }}
                          >
                            {"Trading Rules"}
                          </p>
                          <div className="form-group">
                            <label className="form-label">
                              {"Min Skill Points for Margin Trading"}
                            </label>
                            <input
                              type="number"
                              id="cfg-minmargin"
                              min="0"
                              max="10000"
                              step="1"
                              className="form-input"
                              value={form["cfg-minmargin"] ?? ""}
                              onChange={(e) =>
                                onField("cfg-minmargin", e.target.value)
                              }
                            />
                            <span className="form-hint">
                              {"Skill points required to unlock margin trading"}
                            </span>
                          </div>
                          <div className="form-group">
                            <label className="form-label">
                              {"Max Daily Trades"}
                            </label>
                            <input
                              type="number"
                              id="cfg-maxtrades"
                              min="1"
                              max="10000"
                              step="1"
                              className="form-input"
                              value={form["cfg-maxtrades"] ?? ""}
                              onChange={(e) =>
                                onField("cfg-maxtrades", e.target.value)
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
                              id="cfg-cooldown"
                              min="1"
                              max="1440"
                              step="1"
                              className="form-input"
                              value={form["cfg-cooldown"] ?? ""}
                              onChange={(e) =>
                                onField("cfg-cooldown", e.target.value)
                              }
                            />
                            <span className="form-hint">
                              {"Time between consecutive trades"}
                            </span>
                          </div>
                          <button
                            className="btn btn-purple btn-block"
                            onClick={(e) => {
                              onAction("saveConfig()", e);
                            }}
                          >
                            {"Save Configuration"}
                          </button>
                        </>
                      )}
                    </div>
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
                    <div id="feature-toggles">
                      {slots["feature-toggles"] ?? <></>}
                    </div>
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "16px",
                        background: "var(--gray-50)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--gray-200)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "var(--dark)",
                          marginBottom: "10px",
                        }}
                      >
                        {"Feature Status"}
                      </div>
                      <div id="feature-status">
                        {slots["feature-status"] ?? <></>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "approvals" && (
          <div
            id="view-approvals"
            className={"view-section" + (tab === "approvals" ? " active" : "")}
          >
            {slots["view-approvals"] ?? (
              <>
                <div className="section-header">
                  <div className="section-header-info">
                    <h3>{"Account Approval Requests"}</h3>
                    <p>
                      {
                        "Approve or reject new Instructor, Course Provider, User Admin and Payment Admin account requests"
                      }
                    </p>
                  </div>
                </div>
                <div className="card">
                  <div id="approvals-list">
                    {slots["approvals-list"] ?? <></>}
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
