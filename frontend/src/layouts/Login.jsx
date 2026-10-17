import React from "react";
import "../styles/Login.css";
export default function Login({
  slots = {},
  form = {},
  onField = () => {},
  onAction = () => {},
  tab = "",
  step = 1,
  busy = false,
  error = "",
  showPassword = false,
  demoEnabled = true,
}) {
  return (
    <>

      <div className="login-left">
        <div className="brand-left">
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
          <span>{"IndAI"}</span>
        </div>
        <div className="tagline">
          {"Welcome Back to Your"}
          <br />
          {"Trading Journey"}
        </div>
        <p className="tagline-sub">
          {
            "Sign in to access your paper trading account and continue learning."
          }
        </p>
        <div className="step-item">
          <div className="step-num s1">{"1"}</div>
          <div>
            <h4>{"Sign In Securely"}</h4>
            <p>{"Your credentials automatically open your dashboard"}</p>
          </div>
        </div>
        <div className="step-item">
          <div className="step-num s2">{"2"}</div>
          <div>
            <h4>{"Enter Credentials"}</h4>
            <p>{"Use your registered email and secure password"}</p>
          </div>
        </div>
        <div className="step-item">
          <div className="step-num s3">{"3"}</div>
          <div>
            <h4>{"Access Dashboard"}</h4>
            <p>{"Start trading, learning, or managing your platform"}</p>
          </div>
        </div>
        <div className="risk-banner">
          <h3>{"100% Risk-Free"}</h3>
          <p>
            {
              "Practice trading with virtual money in a safe, educational environment"
            }
          </p>
        </div>
      </div>
      <div className="login-right">
        <a href="/" className="back-link">
          {"\u2190 Back to Home"}
        </a>
        <div className="sign-in-title">{"Sign In"}</div>
        <p className="sign-in-sub">
          {"Enter your credentials to access your account"}
        </p>
        <div
          id="login-form"
          onKeyDown={(e) => {
            if (e.key === "Enter") onAction("doLogin()", e);
          }}
        >
          {slots["login-form"] ?? (
            <>
              <div className="form-group">
                <label className="form-label">{"Email Address *"}</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form["email"] ?? ""}
                  onChange={(e) => onField("email", e.target.value)}
                />
                <span className="field-error-span" id="err-email">
                  {slots["err-email"] ?? <></>}
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">{"Password *"}</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    style={{ paddingRight: "44px" }}
                    value={form["password"] ?? ""}
                    onChange={(e) => onField("password", e.target.value)}
                    type={showPassword ? "text" : "password"}
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
                    id="pw-eye"
                    onClick={(e) => {
                      onAction("togglePw()", e);
                    }}
                  >
                    {slots["pw-eye"] ?? <>{showPassword ? "Hide" : "Show"}</>}
                  </button>
                </div>
                <span className="field-error-span" id="err-password">
                  {slots["err-password"] ?? <></>}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={!!form["remember"]}
                    onChange={(e) => onField("remember", e.target.checked)}
                  />
                  {" Remember me"}
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--blue)",
                    textDecoration: "none",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    onAction("Modals.showForgotPassword();return false;", e);
                  }}
                >
                  {"Forgot password?"}
                </a>
              </div>
              <div
                id="login-error"
                className="alert alert-red"
                style={{ display: error ? "flex" : "none", marginBottom: 16 }}
              >
                {slots["login-error"] ?? <>{error}</>}
              </div>
              <button
                id="login-btn"
                className="btn btn-primary btn-block btn-lg"
                onClick={(e) => {
                  onAction("doLogin()", e);
                }}
                disabled={busy}
              >
                {slots["login-btn"] ?? (
                  <>{busy ? "Signing in…" : "Sign In →"}</>
                )}
              </button>
              <div className="divider-text">{"New to IndAI?"}</div>
              <a
                href="/register.html"
                className="btn btn-secondary btn-block"
                style={{ marginBottom: "0" }}
              >
                {"Create New Account"}
              </a>
              <div className="demo-section" hidden={!demoEnabled}>
                <div className="demo-label">
                  {"Go Quick Demo Access \u2013 click to auto-fill"}
                </div>
                <div className="demo-btns">
                  <button
                    className="demo-btn"
                    onClick={(e) => {
                      onAction(
                        "fillDemo(this,'superuser','superadmin@indai.com','Admin@1234')",
                        e,
                      );
                    }}
                  >
                    <div className="db-role">{"Super Admin"}</div>
                    <div className="db-cred">{"superadmin@indai.com"}</div>
                  </button>
                  <button
                    className="demo-btn"
                    onClick={(e) => {
                      onAction(
                        "fillDemo(this,'useradmin','admin@indai.com','Admin@1234')",
                        e,
                      );
                    }}
                  >
                    <div className="db-role">{"User Admin"}</div>
                    <div className="db-cred">{"admin@indai.com"}</div>
                  </button>
                  <button
                    className="demo-btn"
                    onClick={(e) => {
                      onAction(
                        "fillDemo(this,'paymentadmin','paymentadmin@indai.com','Pay@1234')",
                        e,
                      );
                    }}
                  >
                    <div className="db-role">{"Payment Admin"}</div>
                    <div className="db-cred">{"paymentadmin@indai.com"}</div>
                  </button>
                  <button
                    className="demo-btn"
                    onClick={(e) => {
                      onAction(
                        "fillDemo(this,'instructor','instructor@indai.com','Inst@1234')",
                        e,
                      );
                    }}
                  >
                    <div className="db-role">{"Instructor"}</div>
                    <div className="db-cred">{"instructor@indai.com"}</div>
                  </button>
                  <button
                    className="demo-btn"
                    onClick={(e) => {
                      onAction(
                        "fillDemo(this,'provider','provider@indai.com','Prov@1234')",
                        e,
                      );
                    }}
                  >
                    <div className="db-role">{"Course Provider"}</div>
                    <div className="db-cred">{"provider@indai.com"}</div>
                  </button>
                  <button
                    className="demo-btn"
                    onClick={(e) => {
                      onAction(
                        "fillDemo(this,'learner','learner@indai.com','Learn@1234')",
                        e,
                      );
                    }}
                  >
                    <div className="db-role">{"Learner"}</div>
                    <div className="db-cred">{"learner@indai.com"}</div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <p className="terms-line">
          {"By signing in, you agree to our\n    "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onAction("Modals.showTerms();return false;", e);
            }}
          >
            {"Terms of Service"}
          </a>
          {" and\n    "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onAction("Modals.showPrivacy();return false;", e);
            }}
          >
            {"Privacy Policy"}
          </a>
        </p>
      </div>
    </>
  );
}
