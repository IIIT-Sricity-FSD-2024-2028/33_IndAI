import { Resources } from "../components/Resources.jsx";
import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { date, rupees, useAction, useResource } from "../hooks/api.js";
import {
  Action,
  Empty,
  ErrorText,
  Form,
  Heading,
  Pager,
  Result,
  Status,
  select,
} from "../components/Common.jsx";

const roleLabels = {
  student: "Learner",
  instructor: "Instructor",
  provider: "Course provider",
  admin: "Admin",
  superadmin: "Super admin",
};
const planName = (value) => (value === "basic" ? "Free" : value?.toUpperCase());
export function Members() {
  const user = useOutletContext();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [create, setCreate] = useState(false);
  const mutation = useAction();
  const query = useResource(
    "/members?page=" +
      page +
      "&role=" +
      role +
      "&status=" +
      status +
      "&search=" +
      encodeURIComponent(search),
  );
  return (
    <>
      <Heading
        title="All members"
        detail="Search the platform directory and open a member’s complete activity record."
      >
        <button className="button" onClick={() => setCreate(!create)}>
          {create ? "Close" : "Add staff member"}
        </button>
      </Heading>
      {create && (
        <section className="panel inset narrow">
          <h2>Create staff account</h2>
          <Form
            reset
            fields={[
              { name: "name", label: "Full name", min: 2, max: 90 },
              {
                name: "email",
                label: "Email address",
                type: "email",
                max: 254,
              },
              {
                name: "password",
                label: "Initial password",
                type: "password",
                min: 16,
                max: 128,
              },
              {
                name: "role",
                label: "Role",
                options: select(
                  user.role === "superadmin"
                    ? ["instructor", "provider", "admin"]
                    : ["instructor", "provider"],
                ),
              },
              {
                name: "mfa",
                label:
                  "Staff authenticator secret (required for production staff sign-in)",
                required: false,
                max: 128,
              },
              { name: "reason", label: "Creation reason", min: 5, max: 400 },
            ]}
            submit="Create pending account"
            onSubmit={async (values) => {
              const { mfa, ...body } = values;
              await mutation.mutateAsync({
                path: "/members",
                body: { ...body, ...(mfa ? { mfa } : {}) },
              });
              setCreate(false);
            }}
          />
        </section>
      )}
      <div className="member-filters">
        <label>
          Search
          <input
            value={search}
            maxLength="90"
            placeholder="Name or email"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <label>
          Role
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All roles</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            {select([
              "all",
              "approved",
              "pending",
              "rejected",
              "suspended",
              "archived",
              "unverified",
            ]).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Result query={query}>
        {(data) => (
          <section className="panel">
            <div className="panel-head">
              <h2>{data.total} members</h2>
              <small>
                {data.counts
                  .map((c) => roleLabels[c.role] + " " + c.count)
                  .join(" · ")}
              </small>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Plan / roster</th>
                  </tr>
                </thead>
                <tbody>
                  {data.members.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link className="text-link" to={"/members/" + row.id}>
                          {row.name}
                        </Link>
                        <small>{row.email}</small>
                      </td>
                      <td>{roleLabels[row.role]}</td>
                      <td>
                        <Status>{row.status}</Status>
                      </td>
                      <td>
                        {row.plan
                          ? planName(row.plan)
                          : ["instructor", "provider"].includes(row.role)
                            ? row.activeLearners + " active learners"
                            : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.members.length && <Empty>No matching members.</Empty>}
            <Pager
              page={page}
              setPage={setPage}
              more={(page + 1) * 25 < data.total}
            />
          </section>
        )}
      </Result>
    </>
  );
}
function Records({ items, children, empty = "No records." }) {
  return items?.length ? <>{items.map(children)}</> : <Empty>{empty}</Empty>;
}
function MemberActions({ data }) {
  const actor = useOutletContext();
  const user = data.user;
  const canEdit =
    actor.role === "superadmin" || !["admin", "superadmin"].includes(user.role);
  const mutation = useAction();
  const recoveryAction = useAction();
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const recovery = recoveryRequested
    ? recoveryAction.data?.demoCode
      ? "Demo recovery code: " + recoveryAction.data.demoCode
      : "A recovery code was sent through configured email."
    : null;
  if (!canEdit)
    return (
      <p className="muted">Privileged account changes require a super admin.</p>
    );
  return (
    <div className="member-actions">
      <details className="panel inset">
        <summary>Edit profile</summary>
        <Form
          key={user.id + user.email + user.name}
          fields={[
            { name: "name", label: "Full name", min: 2, max: 90 },
            { name: "email", label: "Email address", type: "email", max: 254 },
            ...(data.profile
              ? [
                  {
                    name: "capacity",
                    label: "Learner capacity",
                    type: "number",
                    min: 1,
                    max: 50,
                  },
                  { name: "expertise", label: "Expertise", max: 120 },
                  { name: "languages", label: "Languages", max: 100 },
                ]
              : []),
            { name: "reason", label: "Reason for changes", min: 5, max: 400 },
          ]}
          initial={{
            name: user.name,
            email: user.email,
            ...(data.profile
              ? {
                  capacity: data.profile.capacity,
                  expertise: data.profile.expertise,
                  languages: data.profile.languages,
                }
              : {}),
          }}
          submit="Save profile"
          onSubmit={(body) =>
            mutation.mutateAsync({
              path: "/members/" + user.id + "/profile",
              method: "PUT",
              body: {
                ...body,
                ...(data.profile ? { capacity: Number(body.capacity) } : {}),
              },
            })
          }
        />
      </details>
      {user.id !== actor.id && user.status !== "unverified" && (
        <details className="panel inset">
          <summary>Manage account status</summary>
          <Form
            fields={[
              {
                name: "status",
                label: "New status",
                options: select(
                  ["approved", "rejected", "suspended", "archived"].filter(
                    (s) => s !== user.status,
                  ),
                ),
              },
              { name: "reason", label: "Reason", min: 5, max: 400 },
            ]}
            submit="Update status"
            onSubmit={(body) => {
              if (
                window.confirm(
                  "Change " + user.name + " to " + body.status + "?",
                )
              )
                return mutation.mutateAsync({
                  path: "/members/" + user.id + "/status",
                  body,
                });
            }}
          />
        </details>
      )}
      {actor.role === "superadmin" && (
        <details className="panel inset">
          <summary>Role & permissions</summary>
          <Form
            fields={[
              {
                name: "role",
                label: "Role",
                options: Object.entries(roleLabels).map(([value, label]) => ({
                  value,
                  label,
                })),
              },
              {
                name: "reason",
                label: "Permission change reason",
                min: 5,
                max: 400,
              },
            ]}
            initial={{ role: user.role }}
            submit="Update permissions"
            onSubmit={(body) => {
              if (
                window.confirm(
                  "Apply these role permissions and revoke existing sessions?",
                )
              )
                return mutation.mutateAsync({
                  path: "/members/" + user.id + "/permissions",
                  body,
                });
            }}
          />
        </details>
      )}
      <details className="panel inset">
        <summary>Sessions & password recovery</summary>
        <Form
          fields={[{ name: "reason", label: "Reason", min: 5, max: 400 }]}
          submit="Revoke all sessions"
          onSubmit={(body) =>
            mutation.mutateAsync({
              path: "/members/" + user.id + "/revoke-sessions",
              body,
            })
          }
        />
        <Form
          fields={[
            { name: "reason", label: "Recovery reason", min: 5, max: 400 },
          ]}
          submit="Start password recovery"
          onSubmit={async (body) => {
            await recoveryAction.mutateAsync({
              path: "/members/" + user.id + "/reset-password",
              body,
            });
            setRecoveryRequested(true);
          }}
        />
        {recovery && (
          <div className="notice" role="status">
            {recovery}
          </div>
        )}
      </details>
    </div>
  );
}
export function Member() {
  const actor = useOutletContext();
  const courseTitle = (course) =>
    actor.role === "superadmin" ? (
      <Link className="text-link" to={"/courses/" + course.id}>
        {course.title}
      </Link>
    ) : (
      <strong>{course.title}</strong>
    );
  const { id } = useParams();
  const [tab, setTab] = useState("overview");
  const [page, setPage] = useState(0);
  const query = useResource("/members/" + id + "?page=" + page);
  const mutation = useAction();
  const tabs = [
    "overview",
    "portfolio",
    "learning",
    "relationships",
    "activity",
    "administration",
  ];
  return (
    <Result query={query}>
      {(data) => (
        <>
          <Heading title={data.user.name} detail={data.user.email}>
            <Link className="button secondary" to="/members">
              All members
            </Link>
          </Heading>
          <div className="actions">
            <Status>{roleLabels[data.user.role]}</Status>
            <Status>{data.user.status}</Status>
            {data.user.role === "student" && (
              <Status>{planName(data.subscription?.plan || "basic")}</Status>
            )}
          </div>
          <nav className="segments" aria-label="Member details">
            {tabs.map((t) => (
              <button
                key={t}
                className="capitalize"
                aria-pressed={tab === t}
                onClick={() => {
                  setTab(t);
                  setPage(0);
                }}
              >
                {t}
              </button>
            ))}
          </nav>
          {tab === "overview" && (
            <div className="overview-grid">
              <section className="panel inset">
                <h2>Profile & access</h2>
                <div className="line-item">
                  <span>Member number</span>
                  <strong>#{data.user.id}</strong>
                </div>
                <div className="line-item">
                  <span>Role</span>
                  <strong>{roleLabels[data.user.role]}</strong>
                </div>
                {data.profile && (
                  <>
                    <div className="line-item">
                      <span>Expertise</span>
                      <strong>{data.profile.expertise}</strong>
                    </div>
                    <div className="line-item">
                      <span>Languages</span>
                      <strong>{data.profile.languages}</strong>
                    </div>
                    <div className="line-item">
                      <span>Learner capacity</span>
                      <strong>{data.profile.capacity}</strong>
                    </div>
                  </>
                )}
                {data.subscription && (
                  <p>Paid through {date(data.subscription.ends)} IST</p>
                )}
                <Records items={data.applications}>
                  {(a) => (
                    <div className="record" key={a.id}>
                      <Status>{a.state}</Status>
                      <small>{date(a.created)}</small>
                      <p>{a.note}</p>
                    </div>
                  )}
                </Records>
              </section>
              <section className="panel inset">
                <h2>Learning & teaching snapshot</h2>
                <div className="line-item">
                  <span>Enrolled courses on this page</span>
                  <strong>{data.learning.length}</strong>
                </div>
                <div className="line-item">
                  <span>Assignments on this page</span>
                  <strong>{data.assignments.length}</strong>
                </div>
                <div className="line-item">
                  <span>Active relationships on this page</span>
                  <strong>
                    {
                      data.relationships.filter((r) => r.state === "active")
                        .length
                    }
                  </strong>
                </div>
                <div className="line-item">
                  <span>Authored courses on this page</span>
                  <strong>{data.courses.length}</strong>
                </div>
                <div className="line-item">
                  <span>Quiz attempts on this page</span>
                  <strong>{data.quizAttempts.length}</strong>
                </div>
              </section>
            </div>
          )}
          {tab === "portfolio" && (
            <>
              {data.account ? (
                <>
                  <div className="stats">
                    <div>
                      <small>Paper cash</small>
                      <strong>{rupees(data.account.cash)}</strong>
                    </div>
                    <div>
                      <small>Reserved</small>
                      <strong>{rupees(data.account.reservedCash)}</strong>
                    </div>
                    <div>
                      <small>Available</small>
                      <strong>
                        {rupees(data.account.cash - data.account.reservedCash)}
                      </strong>
                    </div>
                    <div>
                      <small>Initial plan funding</small>
                      <strong>{rupees(data.account.funded)}</strong>
                    </div>
                  </div>
                  <section className="panel inset">
                    <h2>Positions</h2>
                    <Records items={data.account.positions}>
                      {(p) => (
                        <div className="line-item" key={p.symbol}>
                          <div>
                            <strong>{p.symbol}</strong>
                            <small>
                              {p.qty} shares · {p.sellable} sellable · cost{" "}
                              {rupees(p.cost)}
                            </small>
                          </div>
                          <span>
                            {rupees(p.quote?.price)}{" "}
                            <Status>{p.quote?.status || "unavailable"}</Status>
                          </span>
                        </div>
                      )}
                    </Records>
                  </section>
                  <section className="panel inset">
                    <h2>Orders</h2>
                    <Records items={data.orders}>
                      {(o) => (
                        <div className="line-item" key={o.id}>
                          <div>
                            <strong>
                              #{o.id} · {o.symbol} · {o.side} {o.qty}
                            </strong>
                            <small>
                              {o.type} · {date(o.created)} · fill{" "}
                              {rupees(o.fill_price)}
                            </small>
                          </div>
                          <Status>{o.state}</Status>
                        </div>
                      )}
                    </Records>
                  </section>
                  <section className="panel inset">
                    <h2>Cash ledger</h2>
                    <Records items={data.ledger}>
                      {(l) => (
                        <div className="line-item" key={l.id}>
                          <div>
                            {l.reason}
                            <small>{date(l.created)}</small>
                          </div>
                          <span>
                            {rupees(l.delta)} · balance {rupees(l.balance)}
                          </span>
                        </div>
                      )}
                    </Records>
                  </section>
                  <section className="panel inset">
                    <h2>Watchlists</h2>
                    <Records items={data.watchlists}>
                      {(w) => (
                        <div className="record" key={w.id}>
                          <strong>{w.name}</strong>
                          <p>{w.symbols.join(" · ")}</p>
                        </div>
                      )}
                    </Records>
                  </section>
                  <section className="panel inset">
                    <h2>Trading journal</h2>
                    <Records items={data.journal}>
                      {(j) => (
                        <div className="record" key={j.id}>
                          <Status>{j.tag}</Status>
                          <small>{date(j.created)}</small>
                          <p className="prose">{j.body}</p>
                        </div>
                      )}
                    </Records>
                  </section>
                  <section className="panel inset">
                    <h2>Instructor funding awards</h2>
                    <Records items={data.awards}>
                      {(a) => (
                        <div className="record" key={a.id}>
                          <strong>{rupees(a.amount)}</strong>
                          <p>{a.reason}</p>
                          <small>{date(a.created)}</small>
                        </div>
                      )}
                    </Records>
                  </section>
                </>
              ) : (
                <Empty>This member has no paper account.</Empty>
              )}
            </>
          )}
          {tab === "learning" && (
            <>
              <section className="panel inset">
                <h2>Course progress & levels</h2>
                <Records items={data.learning}>
                  {(c) => (
                    <div className="line-item" key={c.id}>
                      <div>
                        {courseTitle(c)}
                        <small>
                          {c.difficulty} · {planName(c.policy)}
                        </small>
                      </div>
                      <strong>
                        {c.completed}/{c.lessons} lessons
                      </strong>
                    </div>
                  )}
                </Records>
              </section>
              <section className="panel inset">
                <h2>Assignments & feedback</h2>
                <Records items={data.assignments}>
                  {(a) => (
                    <details key={a.id} className="record">
                      <summary>
                        {a.title} · {a.student_name}
                      </summary>
                      <small>
                        Instructor {a.instructor_name} · due {date(a.due)}
                      </small>
                      <p className="prose">{a.body}</p>
                      <Resources kind="assignment" target={a.id} />
                      {a.submissions.map((s) => (
                        <div className="record" key={s.id}>
                          <small>
                            Submission #{s.id} · {date(s.created)}
                            {s.created > a.due ? " · Late" : ""}
                          </small>
                          <p className="prose">{s.body}</p>
                          <Resources kind="submission" target={s.id} />
                          <p className="prose">
                            {s.feedback || "Awaiting review"}
                          </p>
                        </div>
                      ))}
                    </details>
                  )}
                </Records>
              </section>
              <section className="panel inset">
                <h2>Quiz results</h2>
                <Records items={data.quizAttempts}>
                  {(a) => (
                    <div className="line-item" key={a.id}>
                      <Link className="text-link" to={"/quizzes/" + a.quiz}>
                        {a.title}
                      </Link>
                      <span>
                        {a.score}/{a.maximum} <Status>{a.state}</Status>
                      </span>
                    </div>
                  )}
                </Records>
              </section>
              <section className="panel inset">
                <h2>Authored courses</h2>
                <Records items={data.courses}>
                  {(c) => (
                    <div className="line-item" key={c.id}>
                      {courseTitle(c)}
                      <Status>{c.state}</Status>
                    </div>
                  )}
                </Records>
              </section>
              <section className="panel inset">
                <h2>Authored quizzes</h2>
                <Records items={data.authoredQuizzes}>
                  {(q) => (
                    <div className="line-item" key={q.id}>
                      <Link className="text-link" to={"/quizzes/" + q.id}>
                        {q.title}
                      </Link>
                      <Status>{q.state}</Status>
                    </div>
                  )}
                </Records>
              </section>
              <section className="panel inset">
                <h2>Learning plans & milestones</h2>
                {[...data.plans, ...data.milestones].map((p, i) => (
                  <div className="record" key={i}>
                    <strong>{p.title}</strong>
                    <p className="prose">{p.body}</p>
                    {p.state && <Status>{p.state}</Status>}
                  </div>
                ))}
              </section>
            </>
          )}
          {tab === "relationships" && (
            <section className="panel inset">
              <h2>Learners & specialists</h2>
              <Records items={data.relationships}>
                {(r) => (
                  <div className="record" key={r.id}>
                    <div className="line-item">
                      <div>
                        <Link
                          className="text-link"
                          to={"/members/" + r.student}
                        >
                          {r.student_name}
                        </Link>
                        <small>{r.student_email}</small>
                        <span> ↔ </span>
                        <Link className="text-link" to={"/members/" + r.staff}>
                          {r.staff_name}
                        </Link>
                        <small>
                          {r.staff_email} · {r.kind}
                        </small>
                      </div>
                      <Status>{r.state}</Status>
                    </div>
                    <p>{r.goal}</p>
                    {["pending", "active"].includes(r.state) && (
                      <Form
                        fields={[
                          {
                            name: "reason",
                            label: "Intervention reason",
                            min: 5,
                            max: 400,
                          },
                        ]}
                        submit="End relationship"
                        onSubmit={(body) =>
                          mutation.mutateAsync({
                            path: "/guidance/" + r.id + "/decision",
                            body: { ...body, action: "intervene" },
                          })
                        }
                      />
                    )}
                  </div>
                )}
              </Records>
            </section>
          )}
          {tab === "activity" && (
            <section className="panel inset">
              <h2>Activity log</h2>
              <Records items={data.activity}>
                {(a) => (
                  <div className="record" key={a.id}>
                    <strong>{a.action}</strong>
                    <small>
                      {a.actor_name || "System"} · {date(a.created)}
                    </small>
                    <p className="prose">
                      {a.target} · {a.detail}
                    </p>
                  </div>
                )}
              </Records>
            </section>
          )}
          {tab === "administration" && (
            <>
              <MemberActions data={data} />
              <section className="panel inset">
                <h2>Administrative notes</h2>
                <Form
                  reset
                  fields={[
                    {
                      name: "body",
                      label: "Internal note",
                      type: "textarea",
                      min: 5,
                      max: 4000,
                    },
                  ]}
                  submit="Add note"
                  onSubmit={(body) =>
                    mutation.mutateAsync({
                      path: "/members/" + id + "/notes",
                      body,
                    })
                  }
                />
                <Records items={data.notes}>
                  {(n) => (
                    <div className="record" key={n.id}>
                      <strong>{n.author_name}</strong>
                      <small>{date(n.created)}</small>
                      <p className="prose">{n.body}</p>
                    </div>
                  )}
                </Records>
              </section>
              <section className="panel inset">
                <h2>Payments & provider settlements</h2>
                {data.payments.map((p) => (
                  <div className="line-item" key={"p" + p.id}>
                    <span>
                      {p.plan} · {rupees(p.amount)}
                    </span>
                    <Status>{p.status}</Status>
                  </div>
                ))}
                {data.settlements.map((s) => (
                  <div className="line-item" key={"s" + s.id}>
                    <span>
                      {rupees(s.amount)} ·{" "}
                      {s.reference || "Awaiting settlement"}
                    </span>
                    <Status>{s.state}</Status>
                  </div>
                ))}
              </section>
            </>
          )}
          <Pager
            page={page}
            setPage={setPage}
            more={[
              data.relationships,
              data.assignments,
              data.activity,
              data.learning,
              data.orders,
              data.ledger,
              data.notes,
              data.courses,
              data.quizAttempts,
            ].some((rows) => rows.length === 25)}
          />
        </>
      )}
    </Result>
  );
}
