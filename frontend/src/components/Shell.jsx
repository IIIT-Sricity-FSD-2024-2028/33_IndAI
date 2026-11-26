import { ThemeToggle } from "./ThemeToggle.jsx";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAction } from "../hooks/api.js";
import { logoutUser } from "../redux/slices/authSlice.js";
import { useResource } from "../hooks/api.js";
import { Brand, Icon } from "./Icon.jsx";
import { Status } from "./Common.jsx";
import { initials, ProfileDialog, roleLabels } from "./ProfileDialog.jsx";

const student = [
  ["/overview", "Overview", "home"],
  ["/trading", "Paper trading", "trade"],
  ["/portfolio", "Portfolio", "portfolio"],
  ["/journal", "Trading journal", "journal"],
  ["/courses", "Learning center", "book"],
  ["/guidance", "Guidance", "people"],
  ["/tasks", "Assignments", "tasks"],
  ["/quizzes", "Quizzes", "tasks"],
  ["/plans", "Plans & billing", "plan"],
];
const staff = [
  ["/overview", "Overview", "home"],
  ["/guidance", "Learner requests", "people"],
  ["/tasks", "Learning tasks", "tasks"],
];
const common = [
  ["/notifications", "Notifications", "bell"],
  ["/support", "Help & support", "support"],
];
export function Shell({ user }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const action = useAction();
  const unread = useResource("/notifications/unread", {
    refetchInterval: 15000,
  });
  const unreadCount = unread.data?.count ?? 0;
  const approved = user.status === "approved";
  const admin = ["admin", "superadmin"].includes(user.role);
  const adminMenu = [
    ["/overview", "Overview", "home"],
    ["/admin", "Operations", "admin"],
    ["/members", "All members", "people"],
    ...(user.role === "superadmin"
      ? [["/courses", "Course review", "book"]]
      : []),
    ["/commerce", "Course commerce", "plan"],
  ];
  const instructorMenu = [
    ...staff,
    ["/learners", "My learners", "people"],
    ["/trading", "Paper trading", "trade"],
    ["/portfolio", "Portfolio", "portfolio"],
    ["/journal", "Trading journal", "journal"],
    ["/courses", "My courses", "book"],
    ["/quizzes", "Quizzes", "tasks"],
  ];
  const providerMenu = [
    ["/overview", "Overview", "home"],
    ["/provider", "Provider workspace", "portfolio"],
    ["/guidance", "Learner requests", "people"],
    ["/tasks", "Learning plans", "tasks"],
    ["/courses", "My courses", "book"],
    ["/quizzes", "Course quizzes", "tasks"],
  ];
  const menu = approved
    ? admin
      ? adminMenu
      : user.role === "student"
        ? student
        : user.role === "provider"
          ? providerMenu
          : user.role === "instructor"
            ? instructorMenu
            : staff
    : [["/overview", "Application status", "home"]];
  const accountMenu = common.filter(([path]) => path !== "/support" || !admin);

  const current = [...menu, ...accountMenu].find(([path]) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path),
  );
  async function logout() {
    await action.mutateAsync({ path: "/auth/logout", thunk: logoutUser });
    window.location.assign("/login");
  }
  const nav = (entries) =>
    entries.map(([path, label, icon]) => (
      <NavLink
        end={path === "/"}
        to={path}
        key={path}
        onClick={() => setOpen(false)}
      >
        <Icon name={icon} />
        {label}
      </NavLink>
    ));
  return (
    <div className="shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className={"sidebar " + (open ? "is-open" : "")} id="navigation">
        <Link to="/" aria-label="IndAI home">
          <Brand />
        </Link>
        <div className="workspace-label">Workspace</div>
        <nav aria-label="Workspace">
          {nav(menu)}
          <div className="workspace-label">Account</div>
          {nav(accountMenu)}
        </nav>
        <div className="sidebar-footer">
          <button
            className="identity profile-trigger"
            aria-label="Open account profile"
            aria-haspopup="dialog"
            onClick={() => setProfileOpen(true)}
          >
            <span className="avatar" aria-hidden="true">
              {initials(user.name)}
            </span>
            <span>
              <strong>{user.name}</strong>
              <small>{roleLabels[user.role]}</small>
            </span>
          </button>
          <button
            className="icon-button"
            aria-label="Sign out"
            onClick={logout}
          >
            <Icon name="exit" />
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="icon-button mobile-menu"
              aria-label="Toggle navigation"
              aria-controls="navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <Icon name="menu" />
            </button>
            <span>{current?.[1] || "Workspace"}</span>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            {user.demo && (
              <span className="demo-label">
                <i /> Demo environment
              </span>
            )}
            {user.plan && (
              <Status>{user.plan === "basic" ? "Free" : user.plan}</Status>
            )}
            <NavLink
              className="icon-button notification-bell"
              to="/notifications"
              aria-label={
                unreadCount
                  ? "Notifications, " + unreadCount + " unread"
                  : "Notifications"
              }
            >
              <Icon name="bell" />
              {unreadCount > 0 && (
                <span className="notification-badge" aria-hidden="true">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
            <button
              className="icon-button"
              aria-label="Open profile"
              aria-haspopup="dialog"
              onClick={() => setProfileOpen(true)}
            >
              <Icon name="profile" />
            </button>
          </div>
        </header>
        <main id="main" className="content">
          <Outlet context={user} />
        </main>
      </div>
      {profileOpen && (
        <ProfileDialog user={user} onClose={() => setProfileOpen(false)} />
      )}
    </div>
  );
}
