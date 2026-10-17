import React from "react";
export default function ProviderDashboard({
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
              background: "var(--orange)",
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
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "1rem" }}>{"IndAI"}</div>
            <div style={{ fontSize: "11px", color: "var(--gray-500)" }}>
              {"Course Provider Portal"}
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
                stroke="var(--blue)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
            <span style={{ fontSize: "12px", color: "var(--gray-600)" }}>
              {"Total Students"}
            </span>
            <span
              id="total-students"
              style={{ fontWeight: "800", color: "var(--orange)" }}
            >
              {slots["total-students"] ?? <>{"115"}</>}
            </span>
          </div>
          <span id="provider-verification" className="badge badge-gray">
            {slots["provider-verification"] ?? <>{"Verification"}</>}
          </span>
          <div
            className="notif-btn"
            title="Notifications"
            onClick={(e) => {
              onAction("openProviderNotifModal()", e);
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
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "2px solid var(--gray-200)",
              background: "var(--orange-light)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Profile"
            onClick={(e) => {
              onAction("openProviderProfileModal()", e);
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
        <div className="stat-grid" id="provider-stats">
          {slots["provider-stats"] ?? <></>}
        </div>
        <div className="tab-bar tabs-7">
          <button
            id="tab-courses"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            className={"tab-btn" + (tab === "courses" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('courses')", e);
            }}
          >
            {slots["tab-courses"] ?? (
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
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                {" Courses"}
              </>
            )}
          </button>
          <button
            id="tab-videos"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            className={"tab-btn" + (tab === "videos" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('videos')", e);
            }}
          >
            {slots["tab-videos"] ?? (
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
                  <rect x="3" y="6" width="13" height="12" rx="2"></rect>
                  <path d="m16 10 5-3v10l-5-3z"></path>
                </svg>
                {" Videos"}
              </>
            )}
          </button>
          <button
            id="tab-quizzes"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            className={"tab-btn" + (tab === "quizzes" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('quizzes')", e);
            }}
          >
            {slots["tab-quizzes"] ?? (
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                {" Quizzes"}
              </>
            )}
          </button>
          <button
            id="tab-schedule"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            className={"tab-btn" + (tab === "schedule" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('schedule')", e);
            }}
          >
            {slots["tab-schedule"] ?? (
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {" Schedule"}
              </>
            )}
          </button>
          <button
            id="tab-materials"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            className={"tab-btn" + (tab === "materials" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('materials')", e);
            }}
          >
            {slots["tab-materials"] ?? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                {" Materials"}
              </>
            )}
          </button>
          <button
            id="tab-earnings"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            className={"tab-btn" + (tab === "earnings" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('earnings')", e);
            }}
          >
            {slots["tab-earnings"] ?? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M8 8h8M8 12h6M12 8c0 5-2 7-5 8"></path>
                </svg>
                {" Earnings"}
              </>
            )}
          </button>
          <button
            id="tab-analytics"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            className={"tab-btn" + (tab === "analytics" ? " active" : "")}
            onClick={(e) => {
              onAction("switchTab('analytics')", e);
            }}
          >
            {slots["tab-analytics"] ?? (
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
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                {" Analytics"}
              </>
            )}
          </button>
        </div>
        {tab === "courses" && (
          <div
            id="view-courses"
            className={"view-section" + (tab === "courses" ? " active" : "")}
          >
            {slots["view-courses"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Course Management"}</h3>
                    <p className="page-subtitle">
                      {"Create and manage your trading courses"}
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        onAction("openProviderAssignmentModal()", e);
                      }}
                    >
                      {"+ Create Assignment"}
                    </button>
                    <button
                      className="btn btn-orange"
                      onClick={(e) => {
                        onAction("openNewCourseModal()", e);
                      }}
                    >
                      {"+ Create New Course"}
                    </button>
                  </div>
                </div>
                <div id="courses-list">{slots["courses-list"] ?? <></>}</div>
                <div className="card mt-16">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{"Assignment Library"}</div>
                      <div className="card-subtitle">
                        {"Assignments created by this provider"}
                      </div>
                    </div>
                  </div>
                  <div id="provider-assignments-list">
                    {slots["provider-assignments-list"] ?? <></>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "videos" && (
          <div
            id="view-videos"
            className={"view-section" + (tab === "videos" ? " active" : "")}
          >
            {slots["view-videos"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Video Content Library"}</h3>
                    <p className="page-subtitle">
                      {"Upload and manage video lessons for your courses"}
                    </p>
                  </div>
                  <button
                    className="btn btn-orange"
                    onClick={(e) => {
                      onAction("openVideoPicker()", e);
                    }}
                  >
                    {"+ Upload Video"}
                  </button>
                </div>
                <div className="card" style={{ marginBottom: "20px" }}>
                  <div
                    id="video-upload-zone"
                    style={{
                      border: "2px dashed var(--gray-200)",
                      borderRadius: "20px",
                      padding: "56px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      onAction("openVideoPicker()", e);
                    }}
                  >
                    {slots["video-upload-zone"] ?? (
                      <>
                        <div
                          style={{
                            width: "54px",
                            height: "54px",
                            borderRadius: "16px",
                            border: "2px solid var(--gray-300)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "14px",
                            color: "var(--gray-400)",
                          }}
                        >
                          <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="6"
                              width="13"
                              height="12"
                              rx="2"
                            ></rect>
                            <path d="m16 10 5-3v10l-5-3z"></path>
                          </svg>
                        </div>
                        <div
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: "800",
                            color: "var(--dark)",
                            marginBottom: "6px",
                          }}
                        >
                          {"Click to Upload or Drag & Drop"}
                        </div>
                        <div
                          style={{ fontSize: "13px", color: "var(--gray-400)" }}
                        >
                          {"MP4, MOV, AVI, MKV \u2014 Max 500MB"}
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    id="video-file-input"
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.mov,.avi,.mkv"
                    style={{ display: "none" }}
                    onChange={(e) => onAction("uploadFile", e)}
                  />
                </div>
                <div id="provider-videos-list" className="grid-3">
                  {slots["provider-videos-list"] ?? <></>}
                </div>
              </>
            )}
          </div>
        )}
        {tab === "quizzes" && (
          <div
            id="view-quizzes"
            className={"view-section" + (tab === "quizzes" ? " active" : "")}
          >
            {slots["view-quizzes"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Quizzes & Assessments"}</h3>
                    <p className="page-subtitle">
                      {"Design knowledge checks for your courses"}
                    </p>
                  </div>
                  <button
                    className="btn btn-orange"
                    onClick={(e) => {
                      onAction("openNewQuizModal()", e);
                    }}
                  >
                    {"+ Create Quiz"}
                  </button>
                </div>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{"Quiz Title"}</th>
                          <th>{"Course"}</th>
                          <th>{"Questions"}</th>
                          <th>{"Attempts"}</th>
                          <th>{"Avg Score"}</th>
                          <th>{"Pass Rate"}</th>
                          <th>{"Status"}</th>
                          <th>{"Actions"}</th>
                        </tr>
                      </thead>
                      <tbody id="quizzes-tbody">
                        {slots["quizzes-tbody"] ?? <></>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "schedule" && (
          <div
            id="view-schedule"
            className={"view-section" + (tab === "schedule" ? " active" : "")}
          >
            {slots["view-schedule"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"Content Schedule"}</h3>
                    <p className="page-subtitle">
                      {"Plan course releases and learning sessions"}
                    </p>
                  </div>
                  <button
                    className="btn btn-orange"
                    onClick={(e) => {
                      onAction("openNewModuleModal()", e);
                    }}
                  >
                    {"+ Add Module Release"}
                  </button>
                </div>
                <div className="card">
                  <div id="schedule-list">
                    {slots["schedule-list"] ?? <></>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "materials" && (
          <div
            id="view-materials"
            className={"view-section" + (tab === "materials" ? " active" : "")}
          >
            {slots["view-materials"] ?? (
              <>
                <div className="flex-between mb-16">
                  <div>
                    <h3 className="page-title">{"PDF Learning Materials"}</h3>
                    <p className="page-subtitle">
                      {
                        "Attach professional PDF notes, workbooks and premium resources to course modules"
                      }
                    </p>
                  </div>
                  <button
                    className="btn btn-orange"
                    onClick={(e) => {
                      onAction("openPdfPicker()", e);
                    }}
                  >
                    {"+ Upload PDF"}
                  </button>
                </div>
                <div className="card" style={{ marginBottom: "20px" }}>
                  <div
                    id="pdf-upload-zone"
                    style={{
                      border: "2px dashed var(--gray-200)",
                      borderRadius: "20px",
                      padding: "48px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      onAction("openPdfPicker()", e);
                    }}
                  >
                    {slots["pdf-upload-zone"] ?? (
                      <>
                        <div
                          style={{
                            fontWeight: "800",
                            fontSize: "1.05rem",
                            marginBottom: "6px",
                          }}
                        >
                          {"Upload Course Material"}
                        </div>
                        <div
                          style={{ fontSize: "13px", color: "var(--gray-400)" }}
                        >
                          {
                            "PDF only \u2014 Max 25MB \u2014 can be Free or Pro-only material"
                          }
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    id="pdf-file-input"
                    type="file"
                    accept="application/pdf,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => onAction("uploadFile", e)}
                  />
                </div>
                <div id="provider-pdf-list">
                  {slots["provider-pdf-list"] ?? <></>}
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
                    <h3 className="page-title">
                      {"Course Revenue & Settlements"}
                    </h3>
                    <p className="page-subtitle">
                      {
                        "Track quoted prices, admin negotiations, sanctioned course payments and settled earnings"
                      }
                    </p>
                  </div>
                </div>
                <div id="provider-earnings-summary" className="stat-grid">
                  {slots["provider-earnings-summary"] ?? <></>}
                </div>
                <div className="card mt-16">
                  <div className="card-header">
                    <div>
                      <div className="card-title">
                        {"Commercial Course Pipeline"}
                      </div>
                      <div className="card-subtitle">
                        {
                          "Draft \u2192 Admin Review \u2192 Bargaining \u2192 Approval \u2192 Publication & Payout"
                        }
                      </div>
                    </div>
                  </div>
                  <div id="provider-commercial-courses">
                    {slots["provider-commercial-courses"] ?? <></>}
                  </div>
                </div>
                <div className="card mt-16">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{"Payment History"}</div>
                      <div className="card-subtitle">
                        {"Course payments sanctioned by Payment Admin"}
                      </div>
                    </div>
                  </div>
                  <div id="provider-payment-history">
                    {slots["provider-payment-history"] ?? <></>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "analytics" && (
          <div
            id="view-analytics"
            className={"view-section" + (tab === "analytics" ? " active" : "")}
          >
            {slots["view-analytics"] ?? (
              <>
                <div className="grid-2">
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{"Course Performance"}</div>
                        <div className="card-subtitle">
                          {"Student engagement across your courses"}
                        </div>
                      </div>
                    </div>
                    <div id="course-performance">
                      {slots["course-performance"] ?? <></>}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{"Student Feedback"}</div>
                        <div className="card-subtitle">
                          {"Recent reviews and ratings"}
                        </div>
                      </div>
                    </div>
                    <div id="student-feedback">
                      {slots["student-feedback"] ?? <></>}
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
