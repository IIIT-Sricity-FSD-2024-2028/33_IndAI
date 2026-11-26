import { Link, useOutletContext } from "react-router-dom";
import { useResource, rupees, shortDate } from "../hooks/api.js";
import {
  Action,
  Empty,
  Heading,
  PrimaryLink,
  Result,
  Status,
} from "../components/Common.jsx";
import { Icon } from "../components/Icon.jsx";

const allTiles = [
  {
    to: "/trading",
    icon: "trade",
    title: "Paper trading",
    copy: "Explore NSE equities and practice order execution.",
  },
  {
    to: "/courses",
    icon: "book",
    title: "Learning center",
    copy: "Work through courses at your own pace.",
  },
  {
    to: "/guidance",
    icon: "people",
    title: "Guidance",
    copy: "Browse specialists and track your requests.",
  },
  {
    to: "/tasks",
    icon: "tasks",
    title: "Learning tasks",
    copy: "Review assignments, submissions, and milestones.",
  },
  {
    to: "/admin",
    icon: "admin",
    title: "Operations",
    copy: "Review the queue and manage platform activity.",
  },
];
function Tile({ tile }) {
  return (
    <Link className="tile" to={tile.to}>
      <span className="tile-icon">
        <Icon name={tile.icon} />
      </span>
      <span>
        <strong>{tile.title}</strong>
        <small>{tile.copy}</small>
      </span>
      <Icon name="arrow" size={18} />
    </Link>
  );
}
function LearnerOverview({ user }) {
  const rawAccount = useResource("/trading/account", { refetchInterval: 2000 });
  const account = rawAccount;
  const courses = useResource("/courses");
  const guide = useResource("/guidance");
  const a = account.data;
  const priced = a?.positions.every((position) =>
    ["live", "demo"].includes(position.quote?.status),
  );
  const value = priced
    ? a.cash + a.positions.reduce((sum, p) => sum + p.qty * p.quote.price, 0)
    : null;
  return (
    <>
      <div className="overview-banner">
        <div>
          <span className="eyebrow">PAPER TRADING ACCOUNT</span>
          <div className="hero-value">{rupees(value, 0)}</div>
          <p>
            {value == null && !account.isPending
              ? "Current equity needs fresh quotes."
              : "Estimated account equity"}
          </p>
        </div>
        <PrimaryLink to="/trading">Open trading workspace</PrimaryLink>
      </div>
      <div className="stats">
        <div>
          <small>Available paper cash</small>
          <strong>{rupees(a?.available, 0)}</strong>
        </div>
        <div>
          <small>Open positions</small>
          <strong>{a?.positions.length ?? "—"}</strong>
        </div>
        <div>
          <small>Courses enrolled</small>
          <strong>
            {courses.data ? courses.data.filter((c) => c.enrolled).length : "—"}
          </strong>
        </div>
        <div>
          <small>Current access</small>
          <strong className="capitalize">
            {user.plan === "basic" ? "Free" : user.plan}
          </strong>
        </div>
      </div>
      <div className="overview-grid">
        <section>
          <h2>Your workspace</h2>
          <div className="tile-list">
            {allTiles.slice(0, 4).map((tile) => (
              <Tile key={tile.to} tile={tile} />
            ))}
          </div>
        </section>
        <section>
          <h2>Guidance status</h2>
          <div className="panel inset">
            <Result query={guide}>
              {(rows) => (
                <>
                  {["instructor", "provider"].map((kind) => {
                    const row = rows.find((r) => r.kind === kind);
                    const locked =
                      kind === "instructor"
                        ? user.plan !== "plus"
                        : !["pro", "plus"].includes(user.plan);
                    return (
                      <div className="line-item" key={kind}>
                        <div>
                          <strong className="capitalize">{kind}</strong>
                          <p>
                            {row?.staff_name ||
                              (locked
                                ? kind === "instructor"
                                  ? "Included with Plus"
                                  : "Included with Pro and Plus"
                                : "Choose a specialist")}
                          </p>
                        </div>
                        <Status>
                          {row?.state || (locked ? "locked" : "available")}
                        </Status>
                      </div>
                    );
                  })}
                </>
              )}
            </Result>
            <Link className="text-link" to="/guidance">
              View guidance <Icon name="arrow" size={15} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
function InstructorSummary() {
  const query = useResource("/trading/account");
  const roster = useResource("/teaching/learners");
  return (
    <>
      <div className="overview-banner">
        <div>
          <span className="eyebrow">INSTRUCTOR PAPER ACCOUNT</span>
          <div className="hero-value">{rupees(query.data?.available, 0)}</div>
          <p>Available paper cash · initial funding ₹10,00,000</p>
        </div>
        <PrimaryLink to="/trading">Open trading workspace</PrimaryLink>
      </div>
      <div className="tile-list">
        <Tile
          tile={{
            to: "/learners",
            icon: "people",
            title: "My learners",
            copy: roster.data
              ? roster.data.length +
                " active learners · reviewed work and paper-fund awards"
              : "View your active roster and award paper funds.",
          }}
        />
        <Tile
          tile={{
            to: "/quizzes",
            icon: "tasks",
            title: "Quizzes",
            copy: "Create assessments and review learner responses.",
          }}
        />
      </div>
    </>
  );
}
export function Overview() {
  const user = useOutletContext();
  if (user.status !== "approved")
    return (
      <>
        <Heading
          title="Application status"
          detail={"Signed in as " + user.email}
        />
        <section className="panel inset narrow">
          <Status>{user.status}</Status>
          <h2>
            {user.status === "pending"
              ? "Awaiting administrator review"
              : user.status === "rejected"
                ? "Application declined"
                : "Account access suspended"}
          </h2>
          <p>
            {user.application?.note ||
              (user.status === "pending"
                ? "Your email is verified. An administrator will review your application before Basic access opens."
                : "Contact support if you need help with your account.")}
          </p>
          {user.application && (
            <p className="muted">
              Submitted {shortDate(user.application.created)}
            </p>
          )}
          {user.status === "rejected" && (
            <Action title="Resubmit application" path="/applications" />
          )}
        </section>
      </>
    );
  if (user.role === "provider")
    return (
      <>
        <Heading
          title={"Welcome, " + user.name.split(" ")[0]}
          detail="Your courses, learner guidance, and commercial workspace."
        />
        <div className="tile-list narrow">
          <Tile
            tile={{
              to: "/guidance",
              icon: "people",
              title: "Learner requests",
              copy: "Manage Pro and Plus learner relationships.",
            }}
          />
          <Tile
            tile={{
              to: "/tasks",
              icon: "tasks",
              title: "Learning plans",
              copy: "Plan courses and review milestones.",
            }}
          />
          <Tile
            tile={{
              to: "/provider",
              icon: "portfolio",
              title: "Provider workspace",
              copy: "Course proposals, engagement, and settlement records.",
            }}
          />
          <Tile
            tile={{
              to: "/courses",
              icon: "book",
              title: "My courses",
              copy: "Create lessons and attach videos and materials.",
            }}
          />
          <Tile
            tile={{
              to: "/quizzes",
              icon: "tasks",
              title: "Course quizzes",
              copy: "Create assessments and review responses.",
            }}
          />
        </div>
      </>
    );
  const learner = user.role === "student";
  return (
    <>
      <Heading
        title={"Welcome, " + user.name.split(" ")[0]}
        detail={
          learner
            ? "Review your account and continue your practice."
            : "Review your open work and recent updates."
        }
      />
      {learner ? (
        <LearnerOverview user={user} />
      ) : (
        <>
          {user.role === "instructor" && <InstructorSummary />}
          <div className="tile-list narrow">
            {allTiles
              .filter((tile) =>
                ["admin", "superadmin"].includes(user.role)
                  ? tile.to === "/admin"
                  : ["/guidance", "/tasks"].includes(tile.to) ||
                    (user.role === "instructor" && tile.to === "/trading") ||
                    (user.role === "instructor" && tile.to === "/courses"),
              )
              .map((tile) => (
                <Tile key={tile.to} tile={tile} />
              ))}
            <Empty>Open notifications for recent activity.</Empty>
          </div>
        </>
      )}
    </>
  );
}
