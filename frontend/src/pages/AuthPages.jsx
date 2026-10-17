import { useState } from "react";
import LoginLayout from "../layouts/Login";
import RegisterLayout from "../layouts/Register";
import { api, setToken } from "../services/api";
import { checkout } from "../services/payments";
import { useResource } from "../hooks/useResource";
import { Modal } from "../components/Common";
export function rolePath(user) {
  return (
    "/" +
    (user.role === "admin"
      ? user.adminTeam === "PAYMENT_ADMIN"
        ? "payment-admin"
        : "user-admin"
      : user.role) +
    "-dashboard.html"
  );
}
export function LoginPage() {
  const config = useResource("/public/config", { demoMode: true });
  const [form, setForm] = useState({
      email: localStorage.getItem("indai_remember_email") || "",
      remember: !!localStorage.getItem("indai_remember_email"),
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [showPassword, setShowPassword] = useState(false),
    [info, setInfo] = useState("");
  async function signIn() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await api("/auth/login", "POST", {
        email: form.email.trim(),
        password: form.password || "",
      });
      setToken(result.accessToken);
      if (form.remember)
        localStorage.setItem("indai_remember_email", form.email);
      else localStorage.removeItem("indai_remember_email");
      location.assign(rolePath(result.user));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function action(code) {
    if (code === "doLogin()") return signIn();
    if (code === "togglePw()") return setShowPassword((v) => !v);
    if (code.startsWith("fillDemo")) {
      const values = [...code.matchAll(/'([^']*)'/g)].map((m) => m[1]);
      setForm({ ...form, email: values[1], password: values[2] });
      setError("");
      return;
    }
    if (code.includes("Forgot"))
      setInfo("Contact your institution User Admin to reset your password.");
    else if (code.includes("Terms"))
      setInfo(
        "IndAI provides educational paper trading with virtual money. No live exchange orders are placed.",
      );
    else if (code.includes("Privacy"))
      setInfo(
        "Account and institution data are stored by your IndAI deployment. Contact the platform administrator for access or deletion requests.",
      );
  }
  return (
    <>
      <LoginLayout
        demoEnabled={config.data.demoMode}
        form={form}
        onField={(k, v) => {
          setForm({ ...form, [k]: v });
          setError("");
        }}
        onAction={action}
        busy={busy}
        error={error}
        showPassword={showPassword}
      />
      {info && (
        <Modal title="IndAI" onClose={() => setInfo("")}>
          {info}
        </Modal>
      )}
    </>
  );
}
export function RegisterPage() {
  const [form, setForm] = useState({
      role: "learner",
      "reg-admin-team": "USER_ADMIN",
      "reg-content-type": "Mixed",
      "reg-texp": "beginner",
      "reg-risk": "moderate",
      tier: "FREE",
      "reg-pro-plan": "pro_monthly",
    }),
    [step, setStep] = useState(1),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tier, setTier] = useState("FREE"),
    [created, setCreated] = useState(null),
    [show, setShow] = useState(false),
    [info, setInfo] = useState("");
  async function submit() {
    if (!form["reg-terms"] || !form["reg-understand"]) {
      setError("Accept the terms and paper trading acknowledgement.");
      return;
    }
    if (form["reg-pw"] !== form["reg-pw2"]) {
      setError("Passwords must match.");
      return;
    }
    setBusy(true);
    try {
      const b = {
        role: form.role,
        firstName: form["reg-first"],
        lastName: form["reg-last"],
        email: form["reg-email"],
        phone: form["reg-phone"],
        dateOfBirth: form["reg-dob"],
        password: form["reg-pw"],
        confirmPassword: form["reg-pw2"],
      };
      const put = (key, id) => {
        if (form[id]) b[key] = form[id];
      };
      if (form.role === "learner") {
        for (const [k, id] of Object.entries({
          institution: "reg-institution",
          studentId: "reg-studentid",
          grade: "reg-grade",
          major: "reg-major",
          tradingExperience: "reg-texp",
          riskTolerance: "reg-risk",
          goals: "reg-goals",
        }))
          put(k, id);
      }
      if (form.role === "instructor") {
        put("institution", "reg-inst-org");
        put("expertise", "reg-expertise");
        put("yearsExp", "reg-exp");
      }
      if (form.role === "provider") {
        put("organization", "reg-org");
        put("website", "reg-website");
        put("contentType", "reg-content-type");
      }
      if (form.role === "admin") {
        put("institution", "reg-admin-inst");
        put("adminTeam", "reg-admin-team");
        put("authCode", "reg-auth-code");
      }
      const result = await api("/auth/register", "POST", b);
      if (result.accessToken) setToken(result.accessToken);
      setCreated(result);
      setStep(6);
      if (tier === "PRO" && result.accessToken)
        await checkout({ user: result.user, planId: form["reg-pro-plan"] });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function next() {
    setError("");
    const needed =
      step === 2
        ? ["reg-first", "reg-last", "reg-email", "reg-phone", "reg-dob"]
        : step === 4
          ? ["reg-pw", "reg-pw2"]
          : [];
    if (needed.some((k) => !form[k])) {
      setError("Complete all required fields before continuing.");
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  }
  const slots = {
    "registration-plan-preview":
      tier === "PRO"
        ? "Secure Razorpay checkout follows registration."
        : "Free plan: no payment required.",
    eye1: show ? "Hide" : "Show",
    eye2: show ? "Hide" : "Show",
    "step-label": `Step ${Math.min(step, 5)} of 5`,
    "step-pct": `${Math.min(step, 5) * 20}%`,
    "step6-title": created?.pendingApproval
      ? "Registration submitted"
      : "Account created",
    "step6-sub": created?.pendingApproval
      ? "Your account needs Super Admin approval."
      : "You can sign in and start learning.",
    "step6-details": <p>{created?.user?.email}</p>,
    "step6-btn": (
      <a className="btn btn-primary" href="/login.html">
        Go to Sign In
      </a>
    ),
    "step-bar-fill": (
      <span style={{ display: "block", width: Math.min(step, 5) * 20 + "%" }} />
    ),
  };
  return (
    <>
      <RegisterLayout
        form={form}
        step={step}
        showPassword={show}
        busy={busy}
        slots={slots}
        onField={(k, v) => setForm({ ...form, [k]: v })}
        onAction={(code) => {
          if (code === "nextStep()") next();
          else if (code === "prevStep()") setStep((s) => Math.max(1, s - 1));
          else if (code === "submitRegistration()") submit();
          else if (code.startsWith("selectRole"))
            setForm({ ...form, role: code.match(/'([^']+)'/)[1] });
          else if (code.startsWith("selectLearnerTier")) {
            const t = code.includes("PRO") ? "PRO" : "FREE";
            setTier(t);
            setForm({ ...form, tier: t });
          }
          else if (code.includes("toggleRegPw")) setShow(!show);
          else if (code.includes("showTerms"))
            setInfo(
              "IndAI is an educational paper trading platform. All orders use virtual money. Account access and learning content are subject to platform rules.",
            );
          else if (code.includes("showPrivacy"))
            setInfo(
              "Account information is stored on the IndAI server. Configured payment and mail services receive the details needed for those actions. Contact your administrator for access/deletion requests.",
            );
        }}
      />
      {info && (
        <Modal title="IndAI" onClose={() => setInfo("")}>
          {info}
        </Modal>
      )}
      {error && (
        <div
          className="toast error"
          role="alert"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: "#fff",
            padding: 20,
            color: "#b91c1c",
            maxWidth: 500,
          }}
        >
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}
      {busy && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "#ffffffdd",
            display: "grid",
            placeItems: "center",
          }}
        >
          Creating your account…
        </div>
      )}
    </>
  );
}
