import { useEffect, useState } from "react";
import LearnerLayout from "../layouts/LearnerDashboard";
import InstructorLayout from "../layouts/InstructorDashboard";
import ProviderLayout from "../layouts/ProviderDashboard";
import AdminLayout from "../layouts/AdminDashboard";
import SuperLayout from "../layouts/SuperuserDashboard";
import { PlatformAnalytics, SystemActivity } from "../components/PlatformReports";
import NotificationComposer from "../components/NotificationComposer";
import TradingWorkspace from "../components/TradingWorkspace";
import {
  UserManager,
  Approvals,
  Assignments,
  Sessions,
  Configuration,
} from "../components/Management";
import { Courses, Quizzes, Uploads } from "../components/Learning";
import Institutes from "../components/Institutes";
import { Subscription, Revenue, Earnings } from "../components/Commerce";
import {
  Card,
  Stats,
  Table,
  Modal,
  Editor,
  Holdings,
  Empty,
  Notice,
} from "../components/Common";
import { useResource } from "../hooks/useResource";
import { api, setToken, money, download, csv } from "../services/api";
const defaults = {
  learner: "portfolio",
  instructor: "overview",
  provider: "courses",
  admin: "dashboard",
  superuser: "users",
};
export default function Dashboard({ user, onUser }) {
  const [tab, setTab] = useState(defaults[user.role]),
    [form, setForm] = useState({}),
    [notice, setNotice] = useState(""),
    [modal, setModal] = useState(""),
    [subtab, setSubtab] = useState("students"),
    [signals, setSignals] = useState({
      user: 0,
      assignment: 0,
      session: 0,
      course: 0,
      quiz: 0,
    }),
    [paused, setPaused] = useState(false), [tradeRequest,setTradeRequest]=useState({symbol:"RELIANCE",side:"BUY",instrument:null,id:0});
  function openTrade(position, side = "BUY") {
    const symbol=typeof position==="string"?position:position?.symbol || "RELIANCE";
    const instrument=position?.instrument_key?{instrument_key:position.instrument_key,trading_symbol:position.symbol,exchange:position.exchange || (position.instrument_key.startsWith("DEMO|")?"DEMO":"NSE")}:null;
    setTradeRequest(previous=>({symbol,side,instrument,id:previous.id+1}));
    setTab("trading");
  }
  const isPayment = user.role === "admin" && user.adminTeam === "PAYMENT_ADMIN",
    canUsers =
      ["superuser", "instructor"].includes(user.role) ||
      (user.role === "admin" && !isPayment);
  const users = useResource(canUsers ? "/users" : null),
    notifications = useResource("/notifications/user/" + user.id, [], 30000),
    portfolio = useResource(
      ["learner", "instructor"].includes(user.role) ? "/algo/portfolio" : null,
      {},
      5000,
    ),
    tick = useResource(
      user.role === "learner" ? "/algo/pulse" : null,
      {},
      10000,
    );
  useEffect(() => {
    document.body.dataset.team = user.adminTeam || "";
    document.body.dataset.role = user.role;
    return () => {
      delete document.body.dataset.team;
      delete document.body.dataset.role;
    };
  }, [user.adminTeam]);
  useEffect(() => {
    if (tab === "portfolio") portfolio.reload();
  }, [tab]);
  const notify = (m) => setNotice(m);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 8000);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    setForm((f) => ({
      ...f,
      "set-first": user.firstName,
      "set-last": user.lastName,
      "set-email": user.email,
      "set-inst": user.institution || "",
      "set-major": user.major || "",
    }));
  }, [user]);
  const platform = useResource(["admin","superuser"].includes(user.role) ? "/reports/platform" : null, {}, 5000);
  const freshUser = useResource("/auth/me", user, 15000);
  useEffect(() => { if (freshUser.data?.id && JSON.stringify(freshUser.data) !== JSON.stringify(user)) onUser(freshUser.data); }, [freshUser.data]);
  const providerCourses = useResource(user.role === "provider" ? "/courses/provider/" + user.id : null);
  const providerQuizzes = useResource(user.role === "provider" ? "/quizzes" : null);
  const activeLearners = users.data.filter(
      (u) =>
        u.role === "learner" &&
        (user.role !== "instructor" || u.instructorId === user.id),
    ),
    instructors = users.data.filter((u) => u.role === "instructor"),
    providers = users.data.filter((u) => u.role === "provider");
  const stats =
    user.role === "learner"
      ? [
          [
            "Portfolio Value",
            money(portfolio.data.netWorth),
            "Virtual research wallet",
          ],
          [
            "Available Balance",
            money(portfolio.data.cash),
            "Virtual buying power",
            "green",
          ],
          [
            "Total Returns",
            money(
              (portfolio.data.netWorth || 0) -
                (portfolio.data.startingCash || 0),
            ),
            "Research performance",
            "purple",
          ],
          ["Skill Points", user.skillPoints, "Learning achievements", "orange"],
        ]
      : user.role === "provider"
        ? [
          ["Total Courses",providerCourses.data.length,`${providerCourses.data.filter(c=>c.status==="published").length} published`],
          ["Total Enrollments",providerCourses.data.reduce((n,c)=>n+Number(c.enrolledCount||0),0),"Across all courses","orange"],
          ["Avg Completion Rate",`${providerCourses.data.reduce((n,c)=>n+Number(c.enrolledCount||0),0) ? Math.round(providerCourses.data.reduce((n,c)=>n+Number(c.completedCount||0),0)/providerCourses.data.reduce((n,c)=>n+Number(c.enrolledCount||0),0)*100) : 0}%`,"Course completion","green"],
          ["Active Quizzes",providerQuizzes.data.filter(q=>q.status!=="inactive").length,`${providerQuizzes.data.reduce((n,q)=>n+(q.attempts?.length||0),0)} total attempts`],
        ]
        : [
            ["Learners", platform.data.roles?.learner ?? activeLearners.length, "Registered learners"],
            ["Instructors", platform.data.roles?.instructor ?? instructors.length, "Teaching staff", "green"],
            ["Providers", platform.data.roles?.provider ?? providers.length, "Course creators", "purple"],
            [
              "Pending Approvals",
              platform.data.pendingApprovals ?? users.data.filter((u) => u.status === "pending").length,
              "Accounts awaiting approval",
              "orange",
            ],
          ];
  const props = { user, notify, onUser };
  const userManager = (
    <UserManager
      {...props}
      openSignal={signals.user}
      kind={
        user.role === "admin"
          ? subtab === "students"
            ? "learner"
            : "instructor"
          : user.role === "superuser" && tab === "adminteam" ? "admin" : undefined
      }
      search={form["user-search"] || form["student-search"] || ""}
      roleFilter={form["role-filter"]}
      statusFilter={form["status-filter"]}
    />
  );
  const assignmentView = (
    <Assignments {...props} openSignal={signals.assignment} />
  );
  const sessionView = <Sessions {...props} openSignal={signals.session} />;
  const courseView = <Courses {...props} openSignal={signals.course} />;
  const leaderboard = (
    <Table
      heads={["Rank", "Learner", "Skill Points", "Portfolio"]}
      rows={[...activeLearners]
        .sort((a, b) => b.skillPoints - a.skillPoints)
        .map((u, i) => [
          i + 1,
          u.firstName + " " + u.lastName,
          u.skillPoints,
          money(u.portfolioValue),
        ])}
    />
  );
  const p = portfolio.data;
  const slots = {
    "api-status": platform.error ? "Unavailable" : platform.loading ? "Connecting" : "Online",
    "subscription-nav":
      user.subscriptionTier === "PRO" ? "Pro Plan" : "Free Plan · Upgrade",
    "nav-name": user.firstName + " " + user.lastName,
    "nav-admin-name": user.firstName + " " + user.lastName,
    "nav-admin-team": user.adminTeam?.replaceAll("_", " ") || "Super Admin",
    "student-count": activeLearners.length,
    "total-students": providerCourses.data.reduce((n,c)=>n+Number(c.enrolledCount||0),0),
    "skill-pts": user.skillPoints,
    "notif-count": notifications.data.filter((n) => !n.read).length,
    "learner-stats": <Stats items={stats} />,
    "instr-stats": <Stats items={stats} />,
    "provider-stats": <Stats items={stats} />,
    "admin-stats": <Stats items={stats} />,
    "super-stats": <Stats items={stats} />,
    "approval-badge": users.data.filter((u) => u.status === "pending").length,
    "view-trading": <TradingWorkspace key={tradeRequest.id} user={user} initialSymbol={tradeRequest.symbol} initialSide={tradeRequest.side} initialInstrument={tradeRequest.instrument} />,
    "port-val": money(p.netWorth),
    "port-ret": money((p.netWorth || 0) - (p.startingCash || 0)),
    "portfolio-chart": <></>,
    "holdings-list": <Holdings positions={p.positions || []} onTrade={openTrade} />,
    "trade-history": <TradeRows orders={p.orders || []} />,
    "view-portfolio": (
      <Portfolio
        data={p}
        error={portfolio.error}
        onTrade={openTrade}
      />
    ),
    "view-watchlist": (
      <Watchlist {...props} onTrade={openTrade} />
    ),
    "view-users": (
      <>
        <div className="flex-between mb-16">
          <div>
            <h3 className="page-title">User Management</h3>
            <p className="page-subtitle">
              Manage learners, instructors and platform users
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setSignals((s) => ({ ...s, user: s.user + 1 }))}
          >
            + Add User
          </button>
        </div>
        {user.role === "admin" && (
          <div className="mb-16">
            <button
              className="btn btn-secondary"
              onClick={() => setSubtab("students")}
            >
              Learners
            </button>{" "}
            <button
              className="btn btn-secondary"
              onClick={() => setSubtab("instructors")}
            >
              Instructors
            </button>
          </div>
        )}
        <input
          className="form-input mb-16"
          aria-label="Search users"
          placeholder="Search users…"
          value={form["user-search"] || ""}
          onChange={(e) => setForm({ ...form, "user-search": e.target.value })}
        />
        {user.role === "superuser" && <select className="form-select mb-16" aria-label="Filter users by actor" value={form["role-filter"]||"all"} onChange={e=>setForm({...form,"role-filter":e.target.value})}>{[["all","All actors"],["learner","Learners"],["instructor","Instructors"],["provider","Course Providers"],["admin","All Admins"],["USER_ADMIN","User Admins"],["PAYMENT_ADMIN","Payment Admins"],["superuser","Super Admin"]].map(([v,label])=><option key={v} value={v}>{label}</option>)}</select>}
        <Card title="Users">{userManager}</Card>
      </>
    ),
    "view-students": <Card title="My Students">{leaderboard}</Card>,
    "view-adminteam": (
      <>
        <Card
          title="Admin Team"
          actions={
            <button
              className="btn btn-purple"
              onClick={() => setSignals((s) => ({ ...s, user: s.user + 1 }))}
            >
              + Create Admin
            </button>
          }
        >
          {userManager}
        </Card>
        <Institutes notify={notify} />
      </>
    ),
    "view-approvals": <Approvals notify={notify} />,
    "view-courses": (
      <>
        <div className="flex-between mb-16">
          <div><h3 className="page-title">{user.role === "provider" ? "Course Management" : "Courses"}</h3>{user.role === "provider" && <p className="page-subtitle">Create and manage your trading courses</p>}</div>
          {user.role === "provider" && (
            <button
              className="btn btn-secondary"
              onClick={() =>
                setSignals((s) => ({ ...s, assignment: s.assignment + 1 }))
              }
            >
              + Create Assignment
            </button>
          )}
          {["provider", "superuser"].includes(user.role) && (
            <button
              className={"btn " + (user.role === "provider" ? "btn-orange" : "btn-purple")}
              onClick={() =>
                setSignals((s) => ({ ...s, course: s.course + 1 }))
              }
            >
              + New Course
            </button>
          )}
        </div>
        {courseView}
        {user.role === "provider" && (
          <Card title="Assignment Library">{assignmentView}</Card>
        )}
      </>
    ),
    "view-learning": (
      <>
        <h3 className="page-title mb-16">Learning Center</h3>
        {courseView}
        <Card title="Quizzes">
          <Quizzes {...props} />
        </Card>
        <Card title="Upcoming Sessions">{sessionView}</Card>
      </>
    ),
    "view-assignments": (
      <>
        <div className="flex-between mb-16">
          <h3 className="page-title">{user.role === "superuser" ? "Assignments" : "Assignments & Sessions"}</h3>
          <div>
            <button
              className="btn btn-primary"
              onClick={() =>
                setSignals((s) => ({ ...s, assignment: s.assignment + 1 }))
              }
            >
              + Create Assignment
            </button>{" "}
            {user.role !== "superuser" && <button
              className="btn btn-secondary"
              onClick={() =>
                setSignals((s) => ({ ...s, session: s.session + 1 }))
              }
            >
              + Schedule Session
            </button>}
          </div>
        </div>
        {assignmentView}
        {user.role !== "superuser" && <Card title="Sessions">{sessionView}</Card>}
      </>
    ),
    "view-sessions": (
      <>
        <button
          className="btn btn-primary mb-16"
          onClick={() => setSignals((s) => ({ ...s, session: s.session + 1 }))}
        >
          + Add Session
        </button>
        {sessionView}
      </>
    ),
    "view-challenges": (
      <>
        <h3 className="page-title mb-16">Trading Challenges</h3>
        {assignmentView}
      </>
    ),
    "view-subscription": <Subscription {...props} />,
    "view-videos": <Uploads {...props} type="video" />,
    "view-materials": <Uploads {...props} type="pdf" />,
    "view-quizzes": (
      <>
        <div className="flex-between mb-16"><div><h3 className="page-title">Quizzes & Assessments</h3><p className="page-subtitle">Design knowledge checks for your courses</p></div><button
          className="btn btn-orange"
          onClick={() => setSignals((s) => ({ ...s, quiz: s.quiz + 1 }))}
        >
          + Create Quiz
        </button></div>
        <Quizzes {...props} openSignal={signals.quiz} />
      </>
    ),
    "view-schedule": (
      <>
        <div className="flex-between mb-16"><div><h3 className="page-title">Content Schedule</h3><p className="page-subtitle">Select a course below to create and order its lesson releases</p></div></div>
        {courseView}
      </>
    ),
    "view-earnings": <Earnings user={user} />,
    "view-config": (
      <Card title="System Configuration">
        <Configuration />
      </Card>
    ),
    "view-commercial": isPayment ? (
      <Revenue {...props} />
    ) : (
      <Institutes notify={notify} />
    ),
    "view-notifications": (
      <NotificationList resource={notifications} notify={notify} />
    ),
    "leaderboard-list": leaderboard,
    "leaderboard-container": leaderboard,
    "students-list": leaderboard,
    "upcoming-sessions-overview": sessionView,
    "overview-assignments": assignmentView,
    "view-dashboard": <><div className="grid-2"><Card title="Platform Overview"><div className="overview-counts"><p>{platform.data.users||0} total accounts</p><p>{platform.data.publishedCourses||0} published courses · {platform.data.enrollments||0} enrollments</p><p>{platform.data.trades||0} filled paper trades · {platform.data.quizAttempts||0} quiz attempts</p></div><p className="card-subtitle">Live platform totals · refreshes every 5 seconds</p></Card><Card title="Recent System Activity"><SystemActivity report={platform}/></Card></div><Card title="Platform Analytics Report" subtitle="Recorded account, trading and learning events"><PlatformAnalytics report={platform}/></Card></>,
    "activity-list": <SystemActivity report={platform} />,
    "recent-activity": <Activity notifications={notifications.data} />,
    "platform-analytics": <PlatformAnalytics report={platform} />,
    "view-analysis": (
      <Card title="Learner Performance">
        {leaderboard}
        <button
          className="btn btn-secondary"
          onClick={() =>
            download(
              "learner-performance.csv",
              csv([
                ["Name", "Email", "Skill Points"],
                ...activeLearners.map((u) => [
                  u.firstName + " " + u.lastName,
                  u.email,
                  u.skillPoints,
                ]),
              ]),
            )
          }
        >
          Export CSV
        </button>
      </Card>
    ),
    "view-history": (
      <Card title="Trade History">
        <Table
          heads={["Symbol", "Side", "Qty", "Price", "Status", "Date"]}
          rows={(p.orders || []).map((o) => [
            o.symbol,
            o.side,
            o.qty,
            money(o.fill?.price),
            o.status,
            o.created_at?.slice(0, 10),
          ])}
        />
      </Card>
    ),
    "view-analytics": <ProviderAnalytics user={user} />,
    "settings-form": (
      <Editor
        fields={[
          { name: "firstName", label: "First name" },
          { name: "lastName", label: "Last name" },
          { name: "email", type: "email" },
          { name: "institution", required: false },
          { name: "major", required: false },
        ]}
        initial={user}
        onSubmit={async (v) => {
          const updated = await api(
            "/account/profile",
            "PATCH",
            Object.fromEntries(
              ["firstName", "lastName", "email", "institution", "major"]
                .filter((k) => v[k])
                .map((k) => [k, v[k]]),
            ),
          );
          onUser(updated);
          notify("Profile updated.");
        }}
      />
    ),
    "market-pulse-source": tick.error
      ? "MARKET FEED ERROR"
      : tick.data.source || "CONNECTING",
    "market-pulse-breadth":
      tick.error ||
      (tick.data.mode === "REPLAY"
        ? "Previous completed session · " + (tick.data.stocks?.[0]?.asof || "")
        : tick.data.mode === "LIVE"
          ? "Upstox live quotes"
          : "Synthetic demonstration prices"),
    "market-pulse-toggle": paused ? "▶" : "Ⅱ",
    "ticker-track": (
      <div
        style={{
          display: "flex",
          gap: 28,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {(tick.data.stocks || []).slice(0, 15).map((s) => (
          <span key={s.symbol} style={{ whiteSpace: "nowrap" }}>
            {s.symbol} <strong>{money(s.price)}</strong>{" "}
            <span className={s.change >= 0 ? "gain" : "loss"}>{s.change}%</span>
          </span>
        ))}
      </div>
    ),
    "provider-verification": user.providerVerified
      ? "Verified Provider"
      : "Verification Pending",
    "account-info": (
      <p>
        {user.email} · {user.role} · {user.institution || "Individual account"}
      </p>
    ),
  };
  async function action(code) {
    try {
      const match = code.match(/(?:switchTab|showView)\('([^']+)'/);
      if (match) {
        setTab(match[1]);
        return;
      }
      if (code.includes("Auth.logout")) {
        await api("/auth/logout", "POST", {});
        setToken("");
        location.assign("/login.html");
        return;
      }
      if (code.includes("Profile")) {
        setModal("profile");
        return;
      }
      if (code.includes("SendNotification")) {setModal("send");return;}
      if (code.includes("Notif") || code === "toggleNotifs()") {
        setModal("notifications");
        return;
      }
      if (code.includes("showSubTab")) {
        setSubtab(code.includes("instructors") ? "instructors" : "students");
        return;
      }
      if (/open.*(?:User|Student|Instructor|Admin)Modal/.test(code)) {
        setSignals((s) => ({ ...s, user: s.user + 1 }));
        return;
      }
      if (/open.*Assignment/.test(code)) {
        setSignals((s) => ({ ...s, assignment: s.assignment + 1 }));
        return;
      }
      if (/open.*Session/.test(code)) {
        setSignals((s) => ({ ...s, session: s.session + 1 }));
        return;
      }
      if (/open.*CourseModal/.test(code)) { setSignals(s => ({...s, course:s.course+1})); return; }
      if (code === "openNewQuizModal()") { setSignals(s => ({...s, quiz:s.quiz+1})); return; }
      if (code === "exportAnalysis()") { download("learner-performance.csv", csv([["Name","Email","Skill Points"], ...activeLearners.map(u => [u.firstName+" "+u.lastName,u.email,u.skillPoints])])); return; }
      if (code.includes("AwardPoints")) {
        setModal("points");
        return;
      }
      if (code.includes("SendNotification")) {
        setModal("send");
        return;
      }
      if (code === "toggleMarketPulseMotion()") {
        setPaused((v) => !v);
        return;
      }
      if (code === "markAllRead()") {
        for (const n of notifications.data.filter((n) => !n.read))
          await api("/notifications/" + n.id + "/read", "PATCH", {});
        notifications.reload();
        return;
      }
      if (code === "changePassword()") {
        await api("/account/password", "POST", {
          currentPassword: form["pw-current"],
          newPassword: form["pw-new"],
          confirmPassword: form["pw-confirm"],
        });
        setForm((f) => ({
          ...f,
          "pw-current": "",
          "pw-new": "",
          "pw-confirm": "",
        }));
        notify("Password changed. Please sign in again.");
        setToken(""); location.assign("/login.html");
        return;
      }
      if (code === "saveSettings()") {
        notify("Use Save in the profile form above.");
        return;
      }

      notify("Use the controls inside the selected React panel.");
    } catch (e) {
      notify(e.message);
    }
  }
  const Layout = {
    learner: LearnerLayout,
    instructor: InstructorLayout,
    provider: ProviderLayout,
    admin: AdminLayout,
    superuser: SuperLayout,
  }[user.role];
  return (
    <>
      <Layout
        slots={slots}
        tab={tab}
        form={{ ...form, __paused: paused }}
        onField={(k, v) => setForm({ ...form, [k]: v })}
        onAction={action}
      />
      {notice && (
        <div
          role="status"
          className="toast"
          style={{
            display: "block",
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 20000,
            background: "var(--white,#fff)",
            color: "var(--dark)",
            padding: 18,
            borderRadius: 12,
            boxShadow: "0 4px 24px #0003",
            maxWidth: 520,
          }}
        >
          <span>{notice}</span>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 12 }}
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal === "profile"
              ? "My Profile"
              : modal === "points"
                ? "Award Skill Points"
                : modal === "send"
                  ? "Send Notification"
                  : "Notifications"
          }
          onClose={() => setModal("")}
        >
          {modal === "profile" ? (
            <>
              <p>
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
              </p>
              <p>{user.email}</p>
              <p>{user.adminTeam || user.role}</p>
              <p>{user.institution}</p>
              <Editor key={user.id} fields={[
                {name:"firstName",label:"First name"}, {name:"lastName",label:"Last name"},
                {name:"email",type:"email"}, {name:"institution",required:false}, {name:"major",required:false}
              ]} initial={user} submit="Save profile" onSubmit={async values => {
                const updated = await api("/account/profile", "PATCH", Object.fromEntries(["firstName","lastName","email","institution","major"].map(k => [k,values[k] || ""])));
                onUser(updated); notify("Profile updated.");
              }} />
              <h3 className="mt-16">Change password</h3>
              <Editor fields={[{name:"currentPassword",label:"Current password",type:"password"},{name:"newPassword",label:"New password",type:"password"},{name:"confirmPassword",label:"Confirm password",type:"password"}]} submit="Change password" onSubmit={async values => {
                await api("/account/password", "POST", values);
                notify("Password changed. Please sign in again."); setToken(""); location.assign("/login.html");
              }} />
            </>
          ) : modal === "send" ? (
            <NotificationComposer learners={activeLearners} onSent={count=>{setModal("");notify(`Notification sent to ${count} students.`);}} />
          ) : modal === "notifications" ? (
            <NotificationList resource={notifications} notify={notify} />
          ) : (
            <Editor
              fields={[
                {
                  name: "userId",
                  label: "Learner",
                  options: activeLearners.map((u) => ({
                    value: u.id,
                    label: u.firstName + " " + u.lastName,
                  })),
                },
                modal === "points"
                  ? { name: "points", type: "number", min: 1 }
                  : { name: "message", type: "textarea" },
              ]}
              onSubmit={async (b) => {
                if (modal === "points") {
                  const target = users.data.find((u) => u.id === b.userId);
                  await api("/users/" + b.userId, "PATCH", {
                    skillPoints:
                      Number(target.skillPoints || 0) + Number(b.points),
                  });
                } else
                  await api("/notifications", "POST", {
                    userId: b.userId,
                    message: b.message,
                    type: "info",
                  });
                setModal("");
                users.reload();
                notify("Saved.");
              }}
            />
          )}
        </Modal>
      )}
    </>
  );
}
function TradeRows({ orders }) {
  return (
    <>
      {orders.map((o) => (
        <tr key={o.id}>
          <td>{o.symbol}</td>
          <td>{o.side}</td>
          <td>{o.qty}</td>
          <td>{money(o.fill?.price)}</td>
          <td>{money((o.fill?.price || 0) * o.qty)}</td>
          <td>{o.created_at?.slice(0, 10)}</td>
          <td>{o.status}</td>
        </tr>
      ))}
    </>
  );
}
function Portfolio({ data: p, error, onTrade }) {
  return (
    <>
      <Notice error={error} />
      <div className="grid-2">
        <Card
          title="Portfolio Growth"
          subtitle="Your paper trading research account"
          actions={
            <button className="btn btn-primary btn-sm" onClick={() => onTrade()}>
              Open Trading
            </button>
          }
        >
          <div style={{ display: "flex", gap: 32, marginBottom: 16 }}>
            <div>
              <div className="card-subtitle">Current Value</div>
              <strong>{money(p.netWorth)}</strong>
            </div>
            <div>
              <div className="card-subtitle">Total Returns</div>
              <strong>
                {money((p.netWorth || 0) - (p.startingCash || 0))}
              </strong>
            </div>
          </div>
          <PortfolioChart
            history={p.equityHistory || []}
            current={p.netWorth}
            starting={p.startingCash || 100000}
          />
        </Card>
        <Card title="Holdings" subtitle="Your current paper positions">
          <Holdings positions={p.positions || []} onTrade={onTrade} />
        </Card>
      </div>
      <Card title="Trade History" subtitle="All paper research orders">
        <table>
          <thead>
            <tr>
              {[
                "Symbol",
                "Type",
                "Quantity",
                "Price",
                "Total",
                "Date",
                "Status",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TradeRows orders={p.orders || []} />
          </tbody>
        </table>
      </Card>
    </>
  );
}
function PortfolioChart({ history, current, starting }) {
  const [period,setPeriod]=useState("ALL");
  const days={"1D":1,"1W":7,"1M":30};
  const filtered=history.filter(point=>period==="ALL"||Date.parse(point.at)>=Date.now()-days[period]*86400000);
  const samples=filtered.length?filtered:history.slice(-1);
  const values=samples.map(p=>p.netWorth), min=Math.min(...values,Number(current||0)), max=Math.max(...values,Number(current||0));
  const range=Math.max(max-min,Math.max(1,Math.abs(max)*.0002)),y=v=>174-(v-min)/range*130;
  const first=Date.parse(samples[0]?.at)||0,last=Date.parse(samples.at(-1)?.at)||first;
  const x=(p,i)=>last>first?75+(Date.parse(p.at)-first)/(last-first)*590:370;
  const points=samples.map((p,i)=>`${x(p,i)},${y(p.netWorth)}`).join(" ");
  return <div className="equity-chart-panel"><div className="flex-between mb-16"><label>Period <select aria-label="Portfolio chart period" className="form-select" value={period} onChange={e=>setPeriod(e.target.value)}>{["ALL","1D","1W","1M"].map(p=><option key={p}>{p}</option>)}</select></label><strong data-testid="chart-current-value">{money(current)}</strong></div>
   {samples.length?<svg viewBox="0 0 720 240" width="100%" role="img" aria-label="Portfolio total value history" data-current-value={current}>
    {[0,1,2].map(i=>{const value=min+range*i/2;return <g key={i}><line x1="72" x2="680" y1={y(value)} y2={y(value)} stroke="var(--gray-200)"/><text x="3" y={y(value)+4} fontSize="10" fill="currentColor">{money(value)}</text></g>})}
    <polyline fill="none" stroke="var(--blue)" strokeWidth="3" points={points}/>
    {samples.map((p,i)=><circle key={p.at+i} cx={x(p,i)} cy={y(p.netWorth)} r={samples.length>150?1:3} fill="var(--blue)"><title>{new Date(p.at).toLocaleString()} · Total {money(p.netWorth)} · Cash {money(p.cash)} · Holdings {money(p.holdings)}</title></circle>)}
    <text x="75" y="210" fontSize="11" fill="currentColor">{new Date(samples[0].at).toLocaleString()}</text><text x="680" y="228" textAnchor="end" fontSize="11" fill="currentColor">{new Date(samples.at(-1).at).toLocaleString()}</text>
   </svg>:<Empty>Waiting for the first portfolio valuation.</Empty>}
   <p className="card-subtitle">Total value = available cash + current holdings. {samples.length} recorded valuations · refreshes every 5 seconds.</p><p className="card-subtitle">Starting balance {money(starting)}. History begins when valuations are recorded; earlier prices are not invented.</p>
  </div>;
}
function Watchlist({ user, notify, onTrade }) {
  const r = useResource("/watchlists/" + user.id),
    stocks = useResource("/stocks"),
    [search, setSearch] = useState("");
  const symbols = r.data.flatMap((w) => w.symbols || []);
  return (
    <>
      <div className="flex-between mb-16">
        <h3 className="page-title">Watchlist</h3>
        <input
          className="form-input"
          style={{ maxWidth: 300 }}
          placeholder="Search to add…"
          aria-label="Search watchlist stocks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {search && (
        <Card title="Search results">
          {stocks.data
            .filter((s) =>
              (s.symbol + " " + s.name)
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .slice(0, 12)
            .map((s) => (
              <button
                key={s.symbol}
                className="btn btn-secondary btn-sm"
                onClick={async () => {
                  try {
                    await api("/watchlists/" + user.id + "/items", "POST", {
                      symbol: s.symbol,
                    });
                    setSearch("");
                    r.reload();
                  } catch (e) {
                    notify(e.message);
                  }
                }}
              >
                + {s.symbol}
              </button>
            ))}
        </Card>
      )}
      <Card title="Stocks you're monitoring">
        <Notice error={r.error} />
        <Table
          heads={["Symbol", "Company", "Price", "Action"]}
          rows={symbols.map((sym) => {
            const s = stocks.data.find((s) => s.symbol === sym);
            return [
              sym,
              s?.name,
              money(s?.price),
              <>
                <button className="btn btn-primary btn-sm" onClick={()=>onTrade(sym)}>
                  Trade
                </button>{" "}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    try {
                      await api(
                        "/watchlists/" +
                          user.id +
                          "/items/" +
                          encodeURIComponent(sym),
                        "DELETE",
                      );
                      r.reload();
                    } catch (e) {
                      notify(e.message);
                    }
                  }}
                >
                  Remove
                </button>
              </>,
            ];
          })}
        />
        <p className="card-subtitle">
          Watchlist prices use the bundled CSV demonstration feed. Live and
          replay market data are available in the Trading workspace.
        </p>
      </Card>
    </>
  );
}
function NotificationList({ resource: r, notify }) {
  return (
    <>
      <Notice error={r.error} />
      {r.data.map((n) => (
        <div
          key={n.id}
          className="card"
          style={{ opacity: n.read ? 0.65 : 1, marginBottom: 10 }}
        >
          <p>{n.message}</p>
          <small>{n.createdAt}</small>
          {!n.read && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={async () => {
                try {
                  await api("/notifications/" + n.id + "/read", "PATCH", {});
                  r.reload();
                } catch (e) {
                  notify(e.message);
                }
              }}
            >
              Mark read
            </button>
          )}
        </div>
      ))}
      {!r.data.length && <Empty>No notifications.</Empty>}
    </>
  );
}
function Activity({ notifications }) {
  return (
    <>
      {notifications.slice(0, 6).map((n) => (
        <div className="activity-item" key={n.id}>
          <div className="activity-dot" style={{ background: "var(--blue)" }} />
          <div>
            <strong>{n.message}</strong>
            <p>{n.createdAt?.slice(0, 10)}</p>
          </div>
        </div>
      ))}
    </>
  );
}
function ProviderAnalytics({ user }) {
  const r = useResource("/courses/provider/" + user.id);
  return (
    <Card title="Course Performance">
      <Table
        heads={["Course", "Enrollment", "Completed", "Rating"]}
        rows={r.data.map((c) => [
          c.title,
          c.enrolledCount || 0,
          c.completedCount || 0,
          c.rating || "—",
        ])}
      />
    </Card>
  );
}
