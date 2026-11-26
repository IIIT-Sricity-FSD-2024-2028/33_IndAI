import { useEffect } from "react";
import { useDemoLogin } from "../hooks/useDemoLogin.js";
import { ErrorText } from "./Common.jsx";
import { Icon } from "./Icon.jsx";

const groups = [
  {
    title: "Learners",
    accounts: [
      { label: "Free learner", email: "student1@indai.test", icon: "trade" },
      { label: "Pro learner", email: "student201@indai.test", icon: "book" },
      { label: "Plus learner", email: "student261@indai.test", icon: "people" },
    ],
  },
  {
    title: "Teaching & operations",
    accounts: [
      { label: "Course provider", email: "provider1@indai.test", icon: "book" },
      { label: "Instructor", email: "instructor1@indai.test", icon: "book" },
      { label: "Admin", email: "users@indai.test", icon: "people" },
      { label: "Super admin", email: "super@indai.test", icon: "admin" },
    ],
  },
];

export function DemoLogins({ onSuccess }) {
  const { signIn, pending, error } = useDemoLogin(onSuccess);
  useEffect(() => {
    if (window.location.hash === "#demo-login-title") {
      document
        .getElementById("demo-login-title")
        ?.scrollIntoView({ block: "start" });
    }
  }, []);
  return (
    <section
      className="demo-logins"
      aria-labelledby="demo-login-title"
      aria-busy={Boolean(pending)}
    >
      <div className="demo-login-heading">
        <h2 id="demo-login-title">Explore a demo workspace</h2>
        <span className="status">Demo only</span>
      </div>
      <p>Choose a role to sign in instantly with a sample account.</p>
      {groups.map((group) => (
        <div className="demo-login-group" key={group.title}>
          <h3>{group.title}</h3>
          <div className="demo-login-grid">
            {group.accounts.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={Boolean(pending)}
                className="demo-login-button"
                onClick={() => signIn(account)}
                aria-label={"Quick login as " + account.label}
              >
                <Icon name={account.icon} size={17} />
                <span>
                  {pending === account.email ? "Signing in…" : account.label}
                </span>
                <Icon name="arrow" size={14} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <div role="status" className="sr-only">
        {pending ? "Signing in to the selected demo workspace." : ""}
      </div>
      <ErrorText error={error} />
    </section>
  );
}
