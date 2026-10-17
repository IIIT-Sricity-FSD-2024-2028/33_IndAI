import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import ThemeToggle from "./components/ThemeToggle";
import "./styles/theme.css";
import HomeLayout from "./layouts/Home";
import Dashboard from "./pages/Dashboard";
import { LoginPage, RegisterPage, rolePath } from "./pages/AuthPages";
import { InstituteIntake } from "./components/Institutes";
import { api } from "./services/api";
import "./styles/main.css";
import "./styles/dashboard.css";
import "./styles/components.css";
import "./styles/index.css";
import "./styles/superuser.css";
import "./styles/react.css";
class ErrorBoundary extends React.Component {
  state = { error: "" };
  static getDerivedStateFromError(e) {
    return { error: e.message };
  }
  render() {
    return this.state.error ? (
      <main style={{ padding: 40 }}>
        <h1>Unable to display this screen</h1>
        <p>{this.state.error}</p>
        <a href="/login.html">Return to sign in</a>
      </main>
    ) : (
      this.props.children
    );
  }
}
function App() {
  const path = location.pathname,
    [user, setUser] = useState(null),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false);
  const isLogin = /\/login(?:\.html)?$/.test(path),
    isRegister = /\/register(?:\.html)?$/.test(path),
    isIntake = path.startsWith("/institute-intake/"),
    isDashboard = path.includes("dashboard");
  const page = isLogin
    ? "Login"
    : isRegister
      ? "Register"
      : isDashboard
        ? "Dashboard"
        : "Home";
  useEffect(() => {
    document.body.dataset.page = page;
    if (!isDashboard) {
      setReady(true);
      return;
    }
    let active = true;
    (async () => {
      try {
        // Reuse a valid access token; api() performs one shared refresh on 401.
        const current = await api("/auth/me");
        if (active) {
          setUser(current);
          const actual = rolePath(current);
          if (path !== actual && path !== "/pages" + actual)
            location.replace(actual);
        }
      } catch (e) {
        if (active) {
          setError(e.message);
          location.replace("/login.html");
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  if (isIntake) return <InstituteIntake token={path.split("/").pop()} />;
  if (isLogin) return <LoginPage />;
  if (isRegister) return <RegisterPage />;
  if (isDashboard)
    return ready && user ? (
      <Dashboard user={user} onUser={setUser} />
    ) : (
      <div style={{ padding: 40 }}>{error || "Loading your workspace…"}</div>
    );
  return <Home />;
}
function Home() {
  const [faq, setFaq] = useState(null),
    [mobileOpen, setMobileOpen] = useState(false),
    [form, setForm] = useState({}),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [error, setError] = useState("");
  async function action(code) {
    if (code === "toggleMobileMenu()") return setMobileOpen((v) => !v);
    if (code === "closeMobileMenu()") return setMobileOpen(false);
    if (code.includes("toggleFaq")) {
      const n = Number(code.match(/\d+/)[0]);
      setFaq(faq === n ? null : n);
      return;
    }
    if (!code.includes("submitContact") || busy) return;
    setError("");
    setStatus("");
    if ((form["c-name"] || "").trim().length < 3) {
      setError("Enter your full name (at least 3 characters).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form["c-email"] || "")) {
      setError("Enter a valid email address.");
      return;
    }
    if ((form["c-message"] || "").trim().length < 10) {
      setError("Write a message of at least 10 characters.");
      return;
    }
    setBusy(true);
    try {
      await api("/contact", "POST", {
        name: form["c-name"].trim(),
        email: form["c-email"].trim(),
        message: form["c-message"].trim(),
      });
      setStatus("Thank you. Your message has been received.");
      setForm({});
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <HomeLayout
      faq={faq}
      mobileOpen={mobileOpen}
      busy={busy}
      form={form}
      onField={(k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        setError("");
        setStatus("");
      }}
      onAction={action}
      slots={{
        "contact-status": (
          <>
            {busy && <p role="status">Sending…</p>}
            {error && (
              <p role="alert" className="alert alert-red">
                {error}
              </p>
            )}
            {status && (
              <p role="status" className="alert alert-blue">
                {status}
              </p>
            )}
          </>
        ),
      }}
    />
  );
}
createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
    <ThemeToggle />
  </ErrorBoundary>,
);
