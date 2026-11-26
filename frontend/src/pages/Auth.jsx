import { ThemeToggle } from "../components/ThemeToggle.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  registerUser,
  verifyEmail,
  resendVerification,
  requestRecovery,
  resetPassword,
} from "../redux/slices/authSlice.js";
import { prepareRequest } from "../redux/utilities/requests.js";
import { useResource } from "../hooks/api.js";
import { Form } from "../components/Common.jsx";
import { DemoLogins } from "../components/DemoLogins.jsx";
import "../styles/auth.css";
import { Brand, Icon } from "../components/Icon.jsx";

const credentials = [
  { name: "email", label: "Email address", type: "email", max: 254 },
  { name: "password", label: "Password", type: "password", min: 12, max: 128 },
];
const confirmation = {
  name: "confirmation",
  label: "Confirm password",
  type: "password",
  min: 12,
  max: 128,
};
const codeField = {
  name: "code",
  label: "Verification code",
  min: 6,
  max: 6,
  pattern: { value: /^\d{6}$/, message: "Enter six digits." },
};
export function Auth({ mode }) {
  const config = useResource("/config");
  const [pendingEmail, setPendingEmail] = useState(null);
  const response = useSelector(
    (state) => state.auth.operations["auth-form"]?.data,
  );
  const pending = pendingEmail ? { email: pendingEmail, ...response } : null;
  const setPending = (value) => setPendingEmail(value?.email || null);
  const [mfa, setMfa] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const operations = {
    login: loginUser,
    register: registerUser,
    verify: verifyEmail,
    resend: resendVerification,
    recovery: requestRecovery,
    reset: resetPassword,
  };
  const mutation = async (path, body) => {
    // Dispatch the named thunk; unwrap lets the existing form show backend errors.
    const result = await dispatch(
      operations[path](
        prepareRequest({
          path: "/auth/" + path,
          body,
          operationKey: "auth-form",
        }),
      ),
    ).unwrap();
    return result.data;
  };
  const enter = async () => {
    navigate("/overview", { replace: true });
  };
  const register = mode === "register";
  const recovery = mode === "recovery";
  const heading = pending
    ? recovery
      ? "Choose a new password"
      : "Verify your email"
    : register
      ? "Apply for access"
      : recovery
        ? "Recover your account"
        : "Sign in to IndAI";
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Link to="/" aria-label="IndAI home">
          <Brand />
        </Link>
        <div className="auth-editorial">
          <div className="eyebrow">TRADING PRACTICE & LEARNING</div>
          <h2>
            Learn the market.
            <br />
            Build your process.
          </h2>
          <p>
            Practice with a simulated portfolio, work through structured
            lessons, and review your decisions.
          </p>
          <div className="auth-accent" aria-hidden="true">
            <Icon name="trade" size={160} />
          </div>
        </div>
        <div className="auth-foot">Paper trading · NSE equities · INR</div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="theme-position">
            <ThemeToggle />
          </div>
          <Link className="auth-back" to="/">
            ← Back to home
          </Link>
          <div className="mobile-brand">
            <Link to="/" aria-label="IndAI home">
              <Brand />
            </Link>
          </div>
          <h1>{heading}</h1>
          {pending ? (
            <>
              <p>
                {pending.demoCode
                  ? "Use the demo code below to continue."
                  : "If this address is eligible, check its inbox for your six-digit code."}
              </p>
              {pending.demoCode && (
                <div className="notice">
                  Demo verification code <strong>{pending.demoCode}</strong>
                </div>
              )}
              <Form
                key="verify"
                fields={
                  recovery
                    ? [codeField, credentials[1], confirmation]
                    : [codeField]
                }
                submit={recovery ? "Reset password" : "Verify and continue"}
                onSubmit={async (values) => {
                  await mutation(recovery ? "reset" : "verify", {
                    email: pending.email,
                    ...values,
                  });
                  if (recovery) navigate("/login");
                  else await enter();
                }}
                secondary={
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setPending(null)}
                  >
                    Back
                  </button>
                }
              />
            </>
          ) : register ? (
            <>
              <p>
                Verify your email and wait for an administrator to approve your
                Free workspace.
              </p>
              <Form
                key="register"
                fields={[
                  {
                    name: "name",
                    label: "Full name",
                    max: 90,
                    min: 2,
                    pattern: {
                      value: /^[\p{L}\p{M} .’'-]+$/u,
                      message: "Use letters, spaces, apostrophes or hyphens.",
                    },
                  },
                  ...credentials,
                  confirmation,
                ]}
                submit="Submit application"
                onSubmit={async (values) => {
                  if (values.password !== values.confirmation)
                    throw Error("The passwords must match.");
                  setPending({
                    email: values.email,
                    ...(await mutation("register", values)),
                  });
                }}
              />
              <details className="auth-extra">
                <summary>Already registered but need another code?</summary>
                <Form
                  fields={credentials}
                  submit="Resend code"
                  onSubmit={async (values) =>
                    setPending({
                      email: values.email,
                      ...(await mutation("resend", values)),
                    })
                  }
                />
              </details>
            </>
          ) : recovery ? (
            <Form
              key="recovery"
              fields={[credentials[0]]}
              submit="Send recovery code"
              onSubmit={async (values) =>
                setPending({
                  email: values.email,
                  ...(await mutation("recovery", values)),
                })
              }
            />
          ) : (
            <>
              <p>Continue to your paper-trading and learning workspace.</p>
              <Form
                key="login"
                fields={
                  mfa
                    ? [
                        ...credentials,
                        {
                          ...codeField,
                          name: "mfa",
                          label: "Staff authenticator code",
                        },
                      ]
                    : credentials
                }
                submit="Sign in"
                onSubmit={async (values) => {
                  try {
                    await mutation("login", values);
                    await enter();
                  } catch (error) {
                    if (error.code === "MFA_REQUIRED") setMfa(true);
                    throw error;
                  }
                }}
              />
              <div className="auth-links">
                <Link to="/recovery">Forgot password?</Link>
                <Link to="/register">Apply for access</Link>
              </div>
              {config.data?.demo && <DemoLogins onSuccess={enter} />}
            </>
          )}
          {(register || recovery) && (
            <div className="auth-links">
              <Link to="/login">Back to sign in</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
