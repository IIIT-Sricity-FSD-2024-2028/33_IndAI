import React from "react";
import "../styles/Register.css";
export default function Register({
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

      <a href="/login.html" className="back-link">
        {"\u2190 Back to Login"}
      </a>
      <div className="reg-header">
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            textDecoration: "none",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "var(--blue)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "#fff",
            }}
          >
            {"\u2197"}
          </div>
          <span
            style={{
              fontSize: "1.4rem",
              fontWeight: "900",
              color: "var(--dark)",
            }}
          >
            {"IndAI"}
          </span>
        </a>
        <h2>{"Create Your Account"}</h2>
        <p>{"Join thousands learning paper trading risk-free"}</p>
      </div>
      <div className="reg-card">
        <div className="stepper" id="stepper-wrap">
          {slots["stepper-wrap"] ?? (
            <>
              <div className="step-progress">
                <span className="step-label" id="step-label">
                  {slots["step-label"] ?? <>{"Step 1 of 5"}</>}
                </span>
                <span className="step-pct" id="step-pct">
                  {slots["step-pct"] ?? <>{"20% Complete"}</>}
                </span>
              </div>
              <div className="step-bar">
                <div
                  className="step-bar-fill"
                  id="step-bar-fill"
                  style={{ width: Math.min(step, 5) * 20 + "%" }}
                >
                  {slots["step-bar-fill"] ?? <></>}
                </div>
              </div>
              <div className="step-circles">
                <div className="step-circle-item">
                  <div
                    className={
                      "step-circle" +
                      (step > 1 ? " done" : step === 1 ? " active" : "")
                    }
                    id="sc1"
                  >
                    {slots["sc1"] ?? <>{"1"}</>}
                  </div>
                  <span
                    className={
                      "step-name" +
                      (step > 1 ? " done" : step === 1 ? " active" : "")
                    }
                    id="sn1"
                  >
                    {slots["sn1"] ?? <>{"Role"}</>}
                  </span>
                </div>
                <div className="step-circle-item">
                  <div
                    className={
                      "step-circle" +
                      (step > 2 ? " done" : step === 2 ? " active" : "")
                    }
                    id="sc2"
                  >
                    {slots["sc2"] ?? <>{"2"}</>}
                  </div>
                  <span
                    className={
                      "step-name" +
                      (step > 2 ? " done" : step === 2 ? " active" : "")
                    }
                    id="sn2"
                  >
                    {slots["sn2"] ?? <>{"Personal"}</>}
                  </span>
                </div>
                <div className="step-circle-item">
                  <div
                    className={
                      "step-circle" +
                      (step > 3 ? " done" : step === 3 ? " active" : "")
                    }
                    id="sc3"
                  >
                    {slots["sc3"] ?? <>{"3"}</>}
                  </div>
                  <span
                    className={
                      "step-name" +
                      (step > 3 ? " done" : step === 3 ? " active" : "")
                    }
                    id="sn3"
                  >
                    {slots["sn3"] ?? <>{"Details"}</>}
                  </span>
                </div>
                <div className="step-circle-item">
                  <div
                    className={
                      "step-circle" +
                      (step > 4 ? " done" : step === 4 ? " active" : "")
                    }
                    id="sc4"
                  >
                    {slots["sc4"] ?? <>{"4"}</>}
                  </div>
                  <span
                    className={
                      "step-name" +
                      (step > 4 ? " done" : step === 4 ? " active" : "")
                    }
                    id="sn4"
                  >
                    {slots["sn4"] ?? <>{"Security"}</>}
                  </span>
                </div>
                <div className="step-circle-item">
                  <div
                    className={
                      "step-circle" +
                      (step > 5 ? " done" : step === 5 ? " active" : "")
                    }
                    id="sc5"
                  >
                    {slots["sc5"] ?? <>{"5"}</>}
                  </div>
                  <span
                    className={
                      "step-name" +
                      (step > 5 ? " done" : step === 5 ? " active" : "")
                    }
                    id="sn5"
                  >
                    {slots["sn5"] ?? <>{"Plan"}</>}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div
          className={"step-content" + (step === 1 ? " active" : "")}
          id="step-1"
          hidden={step !== 1}
        >
          {slots["step-1"] ?? (
            <>
              <h3>{"Choose Your Role"}</h3>
              <p style={{ fontSize: "13px", color: "var(--gray-500)" }}>
                {
                  "Select the role that best describes you. User Admin and Payment Admin applicants can request access here; the single Super Admin must approve every admin request."
                }
              </p>
              <div className="role-grid">
                <div
                  className={
                    "role-card" + (form.role === "learner" ? " selected" : "")
                  }
                  id="role-learner"
                  onClick={(e) => {
                    onAction("selectRole('learner')", e);
                  }}
                >
                  {slots["role-learner"] ?? (
                    <>
                      <div className="role-icon blue" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"></path>
                          <path d="M5 20a7 7 0 0 1 14 0"></path>
                        </svg>
                      </div>
                      <h4>{"Learner"}</h4>
                      <p className="desc">
                        {"Students who want to learn trading"}
                      </p>
                      <ul>
                        <li>{"Access learning modules"}</li>
                        <li>{"Simulate trades"}</li>
                        <li>{"Join challenges"}</li>
                        <li>{"Track portfolio"}</li>
                      </ul>
                      <div style={{ marginTop: "8px" }}>
                        <span
                          className="badge badge-green"
                          style={{ fontSize: "11px" }}
                        >
                          {"Done Instant Access"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div
                  className={
                    "role-card" +
                    (form.role === "instructor" ? " selected" : "")
                  }
                  id="role-instructor"
                  onClick={(e) => {
                    onAction("selectRole('instructor')", e);
                  }}
                >
                  {slots["role-instructor"] ?? (
                    <>
                      <div className="role-icon green" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M4 7h11"></path>
                          <path d="M4 12h11"></path>
                          <path d="M4 17h7"></path>
                          <path d="M18 8v8"></path>
                          <path d="M14 12h8"></path>
                        </svg>
                      </div>
                      <h4>{"Instructor"}</h4>
                      <p className="desc">{"Teachers who guide students"}</p>
                      <ul>
                        <li>{"Manage students"}</li>
                        <li>{"Award skill points"}</li>
                        <li>{"Create assignments"}</li>
                        <li>{"Track performance"}</li>
                      </ul>
                      <div style={{ marginTop: "8px" }}>
                        <span
                          className="badge badge-orange"
                          style={{ fontSize: "11px" }}
                        >
                          {"Pending Requires Approval"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div
                  className={
                    "role-card" + (form.role === "provider" ? " selected" : "")
                  }
                  id="role-provider"
                  onClick={(e) => {
                    onAction("selectRole('provider')", e);
                  }}
                >
                  {slots["role-provider"] ?? (
                    <>
                      <div className="role-icon orange" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <rect
                            x="4"
                            y="5"
                            width="16"
                            height="14"
                            rx="2"
                          ></rect>
                          <path d="M8 9h8"></path>
                          <path d="M8 13h5"></path>
                        </svg>
                      </div>
                      <h4>{"Course Provider"}</h4>
                      <p className="desc">{"Educators who create courses"}</p>
                      <ul>
                        <li>{"Create courses"}</li>
                        <li>{"Design quizzes"}</li>
                        <li>{"Set challenges"}</li>
                        <li>{"Publish content"}</li>
                      </ul>
                      <div style={{ marginTop: "8px" }}>
                        <span
                          className="badge badge-orange"
                          style={{ fontSize: "11px" }}
                        >
                          {"Pending Requires Approval"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div
                  className={
                    "role-card" + (form.role === "admin" ? " selected" : "")
                  }
                  id="role-admin"
                  onClick={(e) => {
                    onAction("selectRole('admin')", e);
                  }}
                >
                  {slots["role-admin"] ?? (
                    <>
                      <div className="role-icon blue" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 3 4 7v5c0 4.8 3.2 7.8 8 9 4.8-1.2 8-4.2 8-9V7l-8-4Z"></path>
                          <path d="M9 12l2 2 4-4"></path>
                        </svg>
                      </div>
                      <h4>{"Admin"}</h4>
                      <p className="desc">
                        {"Apply for an operational admin division"}
                      </p>
                      <ul>
                        <li>{"User Admin: people & institutions"}</li>
                        <li>{"Payment Admin: Razorpay & revenue"}</li>
                        <li>{"Super Admin approval required"}</li>
                        <li>{"No public Super Admin signup"}</li>
                      </ul>
                      <div style={{ marginTop: "8px" }}>
                        <span
                          className="badge badge-orange"
                          style={{ fontSize: "11px" }}
                        >
                          {"Pending Super Admin Approval"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <span
                className="field-error-span"
                id="err-role"
                style={{ marginTop: "12px", display: "block" }}
              >
                {slots["err-role"] ?? <></>}
              </span>
              <div className="nav-btns">
                <div></div>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    onAction("nextStep()", e);
                  }}
                >
                  {"Next Step \u2192"}
                </button>
              </div>
            </>
          )}
        </div>
        <div
          className={"step-content" + (step === 2 ? " active" : "")}
          id="step-2"
          hidden={step !== 2}
        >
          {slots["step-2"] ?? (
            <>
              <h3>{"Personal Information"}</h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--gray-500)",
                  marginBottom: "20px",
                }}
              >
                {"Tell us about yourself"}
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{"First Name *"}</label>
                  <input
                    type="text"
                    id="reg-first"
                    className="form-input"
                    placeholder="John"
                    value={form["reg-first"] ?? ""}
                    onChange={(e) => onField("reg-first", e.target.value)}
                  />
                  <span className="field-error-span" id="err-reg-first">
                    {slots["err-reg-first"] ?? <></>}
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">{"Last Name *"}</label>
                  <input
                    type="text"
                    id="reg-last"
                    className="form-input"
                    placeholder="Doe"
                    value={form["reg-last"] ?? ""}
                    onChange={(e) => onField("reg-last", e.target.value)}
                  />
                  <span className="field-error-span" id="err-reg-last">
                    {slots["err-reg-last"] ?? <></>}
                  </span>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{"Email Address *"}</label>
                  <input
                    type="email"
                    id="reg-email"
                    className="form-input"
                    placeholder="you@gmail.com"
                    value={form["reg-email"] ?? ""}
                    onChange={(e) => onField("reg-email", e.target.value)}
                  />
                  <span className="field-error-span" id="err-reg-email">
                    {slots["err-reg-email"] ?? <></>}
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">{"Phone Number *"}</label>
                  <input
                    type="tel"
                    id="reg-phone"
                    className="form-input"
                    placeholder="9876543210"
                    inputmode="numeric"
                    maxLength="10"
                    value={form["reg-phone"] ?? ""}
                    onChange={(e) => onField("reg-phone", e.target.value)}
                  />
                  <span className="field-error-span" id="err-reg-phone">
                    {slots["err-reg-phone"] ?? <></>}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{"Date of Birth *"}</label>
                <input
                  type="date"
                  id="reg-dob"
                  className="form-input"
                  min="1900-01-01"
                  value={form["reg-dob"] ?? ""}
                  onChange={(e) => onField("reg-dob", e.target.value)}
                />
                <span className="field-error-span" id="err-reg-dob">
                  {slots["err-reg-dob"] ?? <></>}
                </span>
              </div>
              <div
                className="alert alert-blue register-info-box"
                style={{ marginTop: "4px" }}
              >
                <div className="register-info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="11" width="16" height="9" rx="2"></rect>
                    <path d="M8 11V8a4 4 0 1 1 8 0v3"></path>
                  </svg>
                </div>
                <div>
                  <strong>{"Privacy First"}</strong>
                  <br />
                  <span style={{ fontSize: "12px" }}>
                    {
                      "Your account is stored on the IndAI server. Payment and email details go to the configured services when you use them."
                    }
                  </span>
                </div>
              </div>
              <div className="nav-btns">
                <button
                  className="btn btn-secondary"
                  onClick={(e) => {
                    onAction("prevStep()", e);
                  }}
                >
                  {"\u2190 Previous"}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    onAction("nextStep()", e);
                  }}
                >
                  {"Next Step \u2192"}
                </button>
              </div>
            </>
          )}
        </div>
        <div
          className={"step-content" + (step === 3 ? " active" : "")}
          id="step-3"
          hidden={step !== 3}
        >
          {slots["step-3"] ?? (
            <>
              <h3>{"Role Details"}</h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--gray-500)",
                  marginBottom: "20px",
                }}
              >
                {"Additional information for your role"}
              </p>
              <div id="step3-learner" hidden={form.role !== "learner"}>
                {slots["step3-learner"] ?? (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        {"Institution / School Name"}
                      </label>
                      <input
                        type="text"
                        id="reg-institution"
                        className="form-input"
                        placeholder="IIIT Sri City"
                        value={form["reg-institution"] ?? ""}
                        onChange={(e) =>
                          onField("reg-institution", e.target.value)
                        }
                      />
                      <span
                        className="field-error-span"
                        id="err-reg-institution"
                      >
                        {slots["err-reg-institution"] ?? <></>}
                      </span>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">{"Student ID"}</label>
                        <input
                          type="text"
                          id="reg-studentid"
                          className="form-input"
                          placeholder="STU12345"
                          value={form["reg-studentid"] ?? ""}
                          onChange={(e) =>
                            onField("reg-studentid", e.target.value)
                          }
                        />
                        <span
                          className="field-error-span"
                          id="err-reg-studentid"
                        >
                          {slots["err-reg-studentid"] ?? <></>}
                        </span>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{"Grade / Level"}</label>
                        <input
                          type="text"
                          id="reg-grade"
                          className="form-input"
                          placeholder="e.g. 2nd Year, 10th Grade, Professor\u2026"
                          value={form["reg-grade"] ?? ""}
                          onChange={(e) => onField("reg-grade", e.target.value)}
                        />
                        <span className="form-hint">
                          {
                            "Enter your current grade, year, or professional level"
                          }
                        </span>
                        <span className="field-error-span" id="err-reg-grade">
                          {slots["err-reg-grade"] ?? <></>}
                        </span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{"Course / Major"}</label>
                      <input
                        type="text"
                        id="reg-major"
                        className="form-input"
                        placeholder="Computer Science"
                        maxLength="80"
                        value={form["reg-major"] ?? ""}
                        onChange={(e) => onField("reg-major", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
              <div id="step3-instructor" hidden={form.role !== "instructor"}>
                {slots["step3-instructor"] ?? (
                  <>
                    <div
                      className="alert alert-orange register-info-box"
                      style={{ marginBottom: "16px" }}
                    >
                      <div className="register-info-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9"></circle>
                          <path d="M12 8v4"></path>
                          <path d="M12 16h.01"></path>
                        </svg>
                      </div>
                      <div>
                        <strong>{"Approval Required"}</strong>
                        <br />
                        <span style={{ fontSize: "12px" }}>
                          {
                            "Instructor accounts require Super Admin approval. You'll be notified once approved."
                          }
                        </span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Institution / Organization *"}
                      </label>
                      <input
                        type="text"
                        id="reg-inst-org"
                        className="form-input"
                        placeholder="IIIT Sri City"
                        value={form["reg-inst-org"] ?? ""}
                        onChange={(e) =>
                          onField("reg-inst-org", e.target.value)
                        }
                      />
                      <span className="field-error-span" id="err-reg-inst-org">
                        {slots["err-reg-inst-org"] ?? <></>}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Expertise / Specialization *"}
                      </label>
                      <input
                        type="text"
                        id="reg-expertise"
                        className="form-input"
                        placeholder="Equity Markets, Technical Analysis"
                        value={form["reg-expertise"] ?? ""}
                        onChange={(e) =>
                          onField("reg-expertise", e.target.value)
                        }
                      />
                      <span className="field-error-span" id="err-reg-expertise">
                        {slots["err-reg-expertise"] ?? <></>}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Years of Experience *"}
                      </label>
                      <select
                        id="reg-exp"
                        className="form-select"
                        value={form["reg-exp"] ?? ""}
                        onChange={(e) => onField("reg-exp", e.target.value)}
                      >
                        {slots["reg-exp"] ?? (
                          <>
                            <option value="">{"Select experience"}</option>
                            <option>{"Less than 1 year"}</option>
                            <option>{"1-3 years"}</option>
                            <option>{"3-5 years"}</option>
                            <option>{"5-10 years"}</option>
                            <option>{"10+ years"}</option>
                          </>
                        )}
                      </select>
                      <span className="field-error-span" id="err-reg-exp">
                        {slots["err-reg-exp"] ?? <></>}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div id="step3-provider" hidden={form.role !== "provider"}>
                {slots["step3-provider"] ?? (
                  <>
                    <div
                      className="alert alert-orange register-info-box"
                      style={{ marginBottom: "16px" }}
                    >
                      <div className="register-info-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9"></circle>
                          <path d="M12 8v4"></path>
                          <path d="M12 16h.01"></path>
                        </svg>
                      </div>
                      <div>
                        <strong>{"Approval Required"}</strong>
                        <br />
                        <span style={{ fontSize: "12px" }}>
                          {
                            "Course Provider accounts require Super Admin approval before you can publish content."
                          }
                        </span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Organization Name *"}
                      </label>
                      <input
                        type="text"
                        id="reg-org"
                        className="form-input"
                        placeholder="TradingPro Academy"
                        value={form["reg-org"] ?? ""}
                        onChange={(e) => onField("reg-org", e.target.value)}
                      />
                      <span className="field-error-span" id="err-reg-org">
                        {slots["err-reg-org"] ?? <></>}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Website / LinkedIn"}
                      </label>
                      <input
                        type="text"
                        id="reg-website"
                        className="form-input"
                        placeholder="https://..."
                        maxLength="200"
                        value={form["reg-website"] ?? ""}
                        onChange={(e) => onField("reg-website", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{"Content Type"}</label>
                      <select
                        id="reg-content-type"
                        className="form-select"
                        value={form["reg-content-type"] ?? ""}
                        onChange={(e) =>
                          onField("reg-content-type", e.target.value)
                        }
                      >
                        {slots["reg-content-type"] ?? (
                          <>
                            <option value="">{"Select type"}</option>
                            <option>{"Video Courses"}</option>
                            <option>{"Text Modules"}</option>
                            <option>{"Mixed"}</option>
                          </>
                        )}
                      </select>
                      <span
                        className="field-error-span"
                        id="err-reg-content-type"
                      >
                        {slots["err-reg-content-type"] ?? <></>}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div id="step3-admin" hidden={form.role !== "admin"}>
                {slots["step3-admin"] ?? (
                  <>
                    <div
                      className="alert alert-orange register-info-box"
                      style={{ marginBottom: "16px" }}
                    >
                      <div className="register-info-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <rect
                            x="4"
                            y="11"
                            width="16"
                            height="9"
                            rx="2"
                          ></rect>
                          <path d="M8 11V8a4 4 0 1 1 8 0v3"></path>
                        </svg>
                      </div>
                      <div>
                        <strong>{"Super Admin Approval Required"}</strong>
                        <br />
                        <span style={{ fontSize: "12px" }}>
                          {
                            "Choose one admin division. Your request stays Pending until the single Super Admin approves it."
                          }
                        </span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Institution / Organization *"}
                      </label>
                      <input
                        type="text"
                        id="reg-admin-inst"
                        className="form-input"
                        placeholder="IIIT Sri City"
                        value={form["reg-admin-inst"] ?? ""}
                        onChange={(e) =>
                          onField("reg-admin-inst", e.target.value)
                        }
                      />
                      <span
                        className="field-error-span"
                        id="err-reg-admin-inst"
                      >
                        {slots["err-reg-admin-inst"] ?? <></>}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{"Admin Division *"}</label>
                      <select
                        id="reg-admin-team"
                        className="form-select"
                        value={form["reg-admin-team"] ?? ""}
                        onChange={(e) =>
                          onField("reg-admin-team", e.target.value)
                        }
                      >
                        {slots["reg-admin-team"] ?? (
                          <>
                            <option value="">{"Select admin division"}</option>
                            <option value="USER_ADMIN">
                              {
                                "User Admin \u2014 users, institutions & instructor mapping"
                              }
                            </option>
                            <option value="PAYMENT_ADMIN">
                              {
                                "Payment Admin \u2014 Razorpay, subscriptions & revenue"
                              }
                            </option>
                          </>
                        )}
                      </select>
                      <span className="form-hint">
                        {
                          "Super Admin is protected and cannot be selected during registration."
                        }
                      </span>
                      <span
                        className="field-error-span"
                        id="err-reg-admin-team"
                      >
                        {slots["err-reg-admin-team"] ?? <></>}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Authorization Code *"}
                      </label>
                      <input
                        type="text"
                        id="reg-auth-code"
                        className="form-input"
                        placeholder="Enter admin authorization code"
                        value={form["reg-auth-code"] ?? ""}
                        onChange={(e) =>
                          onField("reg-auth-code", e.target.value)
                        }
                      />
                      <span className="form-hint">
                        {"Demo default code: "}
                        <strong>{"ADMIN2024"}</strong>
                        {
                          ". The backend validates it, and it can be changed through ADMIN_REGISTRATION_CODE; Super Admin approval is still required."
                        }
                      </span>
                      <span className="field-error-span" id="err-reg-auth-code">
                        {slots["err-reg-auth-code"] ?? <></>}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="nav-btns">
                <button
                  className="btn btn-secondary"
                  onClick={(e) => {
                    onAction("prevStep()", e);
                  }}
                >
                  {"\u2190 Previous"}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    onAction("nextStep()", e);
                  }}
                >
                  {"Next Step \u2192"}
                </button>
              </div>
            </>
          )}
        </div>
        <div
          className={"step-content" + (step === 4 ? " active" : "")}
          id="step-4"
          hidden={step !== 4}
        >
          {slots["step-4"] ?? (
            <>
              <h3>{"Account Security"}</h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--gray-500)",
                  marginBottom: "20px",
                }}
              >
                {"Create a strong password for your account"}
              </p>
              <div className="form-group">
                <label className="form-label">{"Password *"}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="reg-pw"
                    className="form-input"
                    placeholder="Enter a strong password"
                    style={{ paddingRight: "44px" }}
                    value={form["reg-pw"] ?? ""}
                    onChange={(e) => onField("reg-pw", e.target.value)}
                  />
                  <button
                    type="button"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--gray-400)",
                      fontSize: "16px",
                    }}
                    id="eye1"
                    onClick={(e) => {
                      onAction("toggleRegPw('reg-pw','eye1')", e);
                    }}
                  >
                    {slots["eye1"] ?? <>{"Show"}</>}
                  </button>
                </div>
                <span className="field-error-span" id="err-reg-pw">
                  {slots["err-reg-pw"] ?? <></>}
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">{"Confirm Password *"}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="reg-pw2"
                    className="form-input"
                    placeholder="Re-enter your password"
                    style={{ paddingRight: "44px" }}
                    value={form["reg-pw2"] ?? ""}
                    onChange={(e) => onField("reg-pw2", e.target.value)}
                  />
                  <button
                    type="button"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--gray-400)",
                      fontSize: "16px",
                    }}
                    id="eye2"
                    onClick={(e) => {
                      onAction("toggleRegPw('reg-pw2','eye2')", e);
                    }}
                  >
                    {slots["eye2"] ?? <>{"Show"}</>}
                  </button>
                </div>
                <span className="field-error-span" id="err-reg-pw2">
                  {slots["err-reg-pw2"] ?? <></>}
                </span>
              </div>
              <div className="pw-req">
                <div className="pw-req-title">{"Password Requirements:"}</div>
                <div
                  className={
                    "pw-rule" +
                    ((form["reg-pw"] || "").length >= 8 ? " met" : "")
                  }
                  id="pw-len"
                >
                  {slots["pw-len"] ?? <>{"At least 8 characters"}</>}
                </div>
                <div
                  className={
                    "pw-rule" +
                    (/[A-Z]/.test(form["reg-pw"] || "") ? " met" : "")
                  }
                  id="pw-upper"
                >
                  {slots["pw-upper"] ?? <>{"One uppercase letter (A-Z)"}</>}
                </div>
                <div
                  className={
                    "pw-rule" +
                    (/[a-z]/.test(form["reg-pw"] || "") ? " met" : "")
                  }
                  id="pw-lower"
                >
                  {slots["pw-lower"] ?? <>{"One lowercase letter (a-z)"}</>}
                </div>
                <div
                  className={
                    "pw-rule" + (/\d/.test(form["reg-pw"] || "") ? " met" : "")
                  }
                  id="pw-num"
                >
                  {slots["pw-num"] ?? <>{"One number (0-9)"}</>}
                </div>
                <div
                  className={
                    "pw-rule" +
                    (/[!@#$%^&*]/.test(form["reg-pw"] || "") ? " met" : "")
                  }
                  id="pw-special"
                >
                  {slots["pw-special"] ?? (
                    <>{"One special character (!@#$%^&*)"}</>
                  )}
                </div>
              </div>
              <div className="nav-btns">
                <button
                  className="btn btn-secondary"
                  onClick={(e) => {
                    onAction("prevStep()", e);
                  }}
                >
                  {"\u2190 Previous"}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    onAction("nextStep()", e);
                  }}
                >
                  {"Next Step \u2192"}
                </button>
              </div>
            </>
          )}
        </div>
        <div
          className={"step-content" + (step === 5 ? " active" : "")}
          id="step-5"
          hidden={step !== 5}
        >
          {slots["step-5"] ?? (
            <>
              <h3>{"Trading Preferences"}</h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--gray-500)",
                  marginBottom: "20px",
                }}
              >
                {"Help us personalise your experience"}
              </p>
              <div
                id="learner-plan-section"
                hidden={form.role !== "learner"}
                style={{ display: "none", marginBottom: "22px" }}
              >
                {slots["learner-plan-section"] ?? (
                  <>
                    <div style={{ fontWeight: "800", fontSize: "1.02rem" }}>
                      {"Choose your learner plan *"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--gray-500)",
                        marginTop: "4px",
                      }}
                    >
                      {
                        "Start free, or activate Pro during registration using secure Razorpay Checkout."
                      }
                    </div>
                    <div className="tier-choice-grid">
                      <div
                        className={
                          "tier-choice" +
                          (form.tier !== "PRO" ? " selected" : "")
                        }
                        id="tier-free"
                        onClick={(e) => {
                          onAction("selectLearnerTier('FREE')", e);
                        }}
                      >
                        {slots["tier-free"] ?? (
                          <>
                            <div className="flex-between">
                              <strong>{"Free"}</strong>
                              <span className="badge badge-green">
                                {"\u20b90"}
                              </span>
                            </div>
                            <div className="tier-price">
                              {"\u20b90 "}
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  color: "var(--gray-400)",
                                }}
                              >
                                {"forever"}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                lineHeight: "1.7",
                                color: "var(--gray-600)",
                              }}
                            >
                              {
                                "Core courses \u2022 Standard quizzes \u2022 Paper trading \u2022 Basic learning materials"
                              }
                            </div>
                          </>
                        )}
                      </div>
                      <div
                        className={
                          "tier-choice pro" +
                          (form.tier === "PRO" ? " selected" : "")
                        }
                        id="tier-pro"
                        onClick={(e) => {
                          onAction("selectLearnerTier('PRO')", e);
                        }}
                      >
                        {slots["tier-pro"] ?? (
                          <>
                            <div className="flex-between">
                              <strong>{"IndAI Pro"}</strong>
                              <span className="badge badge-orange">
                                {"Premium"}
                              </span>
                            </div>
                            <div className="tier-price">
                              {"From \u20b9299 "}
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  color: "var(--gray-400)",
                                }}
                              >
                                {"/month"}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                lineHeight: "1.7",
                                color: "var(--gray-600)",
                              }}
                            >
                              {
                                "Advanced courses \u2022 Enhanced quizzes \u2022 Premium video/PDF material \u2022 Priority learning paths"
                              }
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div id="pro-plan-options" hidden={form.tier !== "PRO"}>
                      {slots["pro-plan-options"] ?? (
                        <>
                          <div
                            className="form-group"
                            style={{ marginBottom: "8px" }}
                          >
                            <label className="form-label">
                              {"Pro Billing Plan *"}
                            </label>
                            <select
                              id="reg-pro-plan"
                              className="form-select"
                              value={form["reg-pro-plan"] ?? ""}
                              onChange={(e) =>
                                onField("reg-pro-plan", e.target.value)
                              }
                            >
                              {slots["reg-pro-plan"] ?? (
                                <>
                                  <option value="">
                                    {"Select a Pro plan"}
                                  </option>
                                  <option value="pro_monthly">
                                    {"Pro Monthly \u2014 \u20b9299 / month"}
                                  </option>
                                  <option value="pro_quarterly">
                                    {
                                      "Pro Quarterly \u2014 \u20b9799 / 3 months"
                                    }
                                  </option>
                                  <option value="pro_annual">
                                    {"Pro Annual \u2014 \u20b92,499 / year"}
                                  </option>
                                </>
                              )}
                            </select>
                            <span
                              className="field-error-span"
                              id="err-reg-pro-plan"
                            >
                              {slots["err-reg-pro-plan"] ?? <></>}
                            </span>
                          </div>
                          <div
                            id="registration-plan-preview"
                            className="plan-preview"
                          >
                            {slots["registration-plan-preview"] ?? <></>}
                          </div>
                        </>
                      )}
                    </div>
                    <span className="field-error-span" id="err-learner-tier">
                      {slots["err-learner-tier"] ?? <></>}
                    </span>
                  </>
                )}
              </div>
              <div
                id="learner-preferences-section"
                hidden={form.role !== "learner"}
              >
                {slots["learner-preferences-section"] ?? (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        {"Trading Experience *"}
                      </label>
                      <select
                        id="reg-texp"
                        className="form-select"
                        value={form["reg-texp"] ?? ""}
                        onChange={(e) => onField("reg-texp", e.target.value)}
                      >
                        {slots["reg-texp"] ?? (
                          <>
                            <option value="">
                              {"Select your experience level"}
                            </option>
                            <option value="beginner">
                              {"Beginner \u2013 No prior trading knowledge"}
                            </option>
                            <option value="intermediate">
                              {
                                "Intermediate \u2013 Some understanding of markets"
                              }
                            </option>
                            <option value="advanced">
                              {"Advanced \u2013 Active trader with experience"}
                            </option>
                          </>
                        )}
                      </select>
                      <span className="field-error-span" id="err-reg-texp">
                        {slots["err-reg-texp"] ?? <></>}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{"Risk Tolerance *"}</label>
                      <select
                        id="reg-risk"
                        className="form-select"
                        value={form["reg-risk"] ?? ""}
                        onChange={(e) => onField("reg-risk", e.target.value)}
                      >
                        {slots["reg-risk"] ?? (
                          <>
                            <option value="">
                              {"Select your risk tolerance"}
                            </option>
                            <option value="low">
                              {"Low \u2013 Prefer stable, low-risk investments"}
                            </option>
                            <option value="moderate">
                              {"Moderate \u2013 Balance of risk and reward"}
                            </option>
                            <option value="high">
                              {"High \u2013 Comfortable with higher volatility"}
                            </option>
                          </>
                        )}
                      </select>
                      <span className="field-error-span" id="err-reg-risk">
                        {slots["err-reg-risk"] ?? <></>}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {"Learning Goals (Optional)"}
                      </label>
                      <textarea
                        id="reg-goals"
                        className="form-textarea"
                        maxLength="500"
                        placeholder="What do you want to achieve with IndAI?"
                        value={form["reg-goals"] ?? ""}
                        onChange={(e) => onField("reg-goals", e.target.value)}
                      >
                        {slots["reg-goals"] ?? <></>}
                      </textarea>
                      <span className="field-error-span" id="err-reg-goals">
                        {slots["err-reg-goals"] ?? <></>}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div
                id="learner-welcome-bonus"
                hidden={form.role !== "learner"}
                className="alert alert-blue register-info-box"
                style={{ marginBottom: "16px" }}
              >
                {slots["learner-welcome-bonus"] ?? (
                  <>
                    <div className="register-info-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9"></circle>
                        <path d="M12 7v10"></path>
                        <path d="M8.5 10.5c0-1.4 1.3-2.5 3.5-2.5s3.5 1.1 3.5 2.5-1 2.1-3.5 2.5-3.5 1.1-3.5 2.5S9.8 18 12 18s3.5-1.1 3.5-2.5"></path>
                      </svg>
                    </div>
                    <div>
                      <strong>{"Welcome Bonus!"}</strong>
                      <br />
                      <span style={{ fontSize: "12px" }}>
                        {
                          "Learners start with \u20b91,00,000 virtual money + 50 skill points."
                        }
                      </span>
                    </div>
                  </>
                )}
              </div>
              <label className="checkbox-row" style={{ marginBottom: "8px" }}>
                <input
                  type="checkbox"
                  id="reg-terms"
                  checked={!!form["reg-terms"]}
                  onChange={(e) => onField("reg-terms", e.target.checked)}
                />
                {"\n      I agree to the "}
                <a
                  href="#"
                  style={{ color: "var(--blue)" }}
                  onClick={(e) => {
                    e.preventDefault();
                    onAction("Modals.showTerms();return false;", e);
                  }}
                >
                  {"Terms of Service"}
                </a>
                {" and "}
                <a
                  href="#"
                  style={{ color: "var(--blue)" }}
                  onClick={(e) => {
                    e.preventDefault();
                    onAction("Modals.showPrivacy();return false;", e);
                  }}
                >
                  {"Privacy Policy"}
                </a>
              </label>
              <label className="checkbox-row" style={{ marginBottom: "16px" }}>
                <input
                  type="checkbox"
                  id="reg-understand"
                  checked={!!form["reg-understand"]}
                  onChange={(e) => onField("reg-understand", e.target.checked)}
                />
                {
                  " I understand this is paper trading \u2014 no real money is involved.\n    "
                }
              </label>
              <span className="field-error-span" id="err-terms">
                {slots["err-terms"] ?? <></>}
              </span>
              <div className="nav-btns">
                <button
                  className="btn btn-secondary"
                  onClick={(e) => {
                    onAction("prevStep()", e);
                  }}
                >
                  {"\u2190 Previous"}
                </button>
                <button
                  className="btn btn-green"
                  id="submit-btn"
                  onClick={(e) => {
                    onAction("submitRegistration()", e);
                  }}
                >
                  {slots["submit-btn"] ?? <>{"Done Create Account"}</>}
                </button>
              </div>
            </>
          )}
        </div>
        <div
          className={"step-content" + (step === 6 ? " active" : "")}
          id="step-6"
          hidden={step !== 6}
        >
          {slots["step-6"] ?? (
            <>
              <div className="success-wrap">
                <div id="step6-icon">{slots["step6-icon"] ?? <></>}</div>
                <h2 id="step6-title" style={{ marginBottom: "10px" }}>
                  {slots["step6-title"] ?? <></>}
                </h2>
                <p id="step6-sub">{slots["step6-sub"] ?? <></>}</p>
                <div
                  id="step6-details"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    margin: "24px 0",
                    textAlign: "left",
                  }}
                >
                  {slots["step6-details"] ?? <></>}
                </div>
                <a
                  href="/login.html"
                  className="btn btn-primary btn-lg"
                  id="step6-btn"
                >
                  {slots["step6-btn"] ?? <>{"Go to Sign In \u2192"}</>}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="footer-trust">
        <span>{"Secure & Encrypted"}</span>
        <span>{"100% Risk-Free"}</span>
        <span>{"10,000+ Students"}</span>
      </div>
    </>
  );
}
