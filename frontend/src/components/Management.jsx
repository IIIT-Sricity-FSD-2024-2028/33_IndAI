import { useState } from "react";
import { api, money } from "../services/api";
import { useResource } from "../hooks/useResource";
import { Card, Editor, Modal, Table, Empty, Notice } from "./Common";
const names = [
  { name: "firstName", label: "First name" },
  { name: "lastName", label: "Last name" },
  { name: "email", type: "email" },
];
export function UserManager({
  user,
  kind,
  search = "",
  roleFilter = "",
  statusFilter = "",
  openSignal = 0,
  notify,
}) {
  const users = useResource(
      user.adminTeam === "PAYMENT_ADMIN" ? null : "/users",
    ),
    [edit, setEdit] = useState(null),
    [seen, setSeen] = useState(openSignal),
    [error, setError] = useState("");
  if (openSignal !== seen) {
    setSeen(openSignal);
    setEdit({});
  }
  const items = users.data.filter(
    (u) =>
      (!kind || u.role === kind) &&
      (!roleFilter || roleFilter === "all" || (u.role === roleFilter || u.adminTeam === roleFilter)) &&
      (!statusFilter || statusFilter === "all" || u.status === statusFilter) &&
      `${u.firstName} ${u.lastName} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const options = users.data
    .filter((u) => u.role === "instructor")
    .map((u) => ({ value: u.id, label: u.firstName + " " + u.lastName }));
  async function run(fn) {
    try {
      await fn();
      users.reload();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <Notice error={users.error || error} />
      <Table
        heads={["Name / Status", "Role", "Email", "Actions"]}
        rows={items.map((u) => [
          <>
            <strong>
              {u.firstName} {u.lastName}
            </strong>
            <br />
            <span className="badge badge-blue">{u.status}</span>
          </>,
          u.adminTeam || u.role,
          u.email,
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEdit(u)}
            >
              Edit
            </button>
            {u.role === "provider" && !u.providerVerified && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  run(() =>
                    api("/users/" + u.id, "PATCH", { providerVerified: true }),
                  )
                }
              >
                Verify
              </button>
            )}
            {u.role !== "superuser" && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (confirm("Delete " + u.email + "?"))
                    run(() => api("/users/" + u.id, "DELETE"));
                }}
              >
                Delete
              </button>
            )}
          </div>,
        ])}
      />
      {edit && (
        <Modal
          title={edit.id ? "Edit Account" : "Create Account"}
          onClose={() => setEdit(null)}
        >
          <AccountForm user={user} edit={edit} kind={kind} instructors={options}
            onSubmit={async (values) => {
              let b = Object.fromEntries(
                Object.entries(values).filter(
                  ([k, v]) => v !== "" && v !== undefined,
                ),
              );
              const allowed = edit.id
                ? [
                    "firstName",
                    "lastName",
                    "email",
                    "status",
                    "institution",
                    "instructorId",
                    "adminTeam",
                    "organization", "expertise", "yearsExp", "studentId",
                  ]
                : [
                    "firstName",
                    "lastName",
                    "email",
                    "role",
                    "password",
                    "status",
                    "institution",
                    "studentId",
                    "organization",
                    "expertise",
                    "yearsExp",
                    "adminTeam",
                    "instructorId",
                  ];
              b = Object.fromEntries(
                Object.entries(b).filter(([k]) => allowed.includes(k)),
              );
              await api(
                "/users" + (edit.id ? "/" + edit.id : ""),
                edit.id ? "PATCH" : "POST",
                b,
              );
              setEdit(null);
              users.reload();
              notify("Account saved.");
            }}
          />
        </Modal>
      )}
    </>
  );
}
export function Approvals({ notify }) {
  const r = useResource("/superuser/pending-approvals");
  return (
    <>
      <Notice error={r.error} />
      {r.data.map((u) => (
        <Card
          key={u.id}
          title={`${u.firstName} ${u.lastName}`}
          subtitle={u.email + " · " + (u.adminTeam || u.role)}
        >
          <button
            className="btn btn-green"
            onClick={async () => {
              try {
                await api(
                  "/superuser/approvals/" + u.id + "/approve",
                  "POST",
                  {},
                );
                r.reload();
                notify("Approved.");
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            Approve
          </button>{" "}
          <button
            className="btn btn-secondary"
            onClick={async () => {
              try {
                await api(
                  "/superuser/approvals/" + u.id + "/reject",
                  "POST",
                  {},
                );
                r.reload();
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            Reject
          </button>
        </Card>
      ))}
      {!r.data.length && <Empty>No pending approvals.</Empty>}
    </>
  );
}
export function Assignments({ user, openSignal = 0, notify }) {
  const r = useResource(
      user.role === "learner"
        ? "/assignments/learner/" + user.id
        : "/assignments",
    ),
    u = useResource(
      ["admin", "superuser", "instructor"].includes(user.role)
        ? "/users"
        : null,
    ),
    courses = useResource(
      user.role === "provider" ? "/courses/provider/" + user.id : null,
    ),
    [edit, setEdit] = useState(null),
    [seen, setSeen] = useState(openSignal),
    [submit, setSubmit] = useState(null);
  if (openSignal !== seen) {
    setSeen(openSignal);
    setEdit({});
  }
  const learners = u.data.filter(
    (x) =>
      x.role === "learner" &&
      (user.role !== "instructor" || x.instructorId === user.id),
  );
  const instructors = u.data.filter((x) => x.role === "instructor");
  return (
    <>
      <Notice error={r.error} />
      {r.data
        .filter((a) => user.role === "provider" ? a.providerId === user.id : user.role === "instructor" ? a.instructorId === user.id : true)
        .map((a) => (
          <Card
            key={a.id}
            title={a.title}
            subtitle={`${a.dueDate} · ${a.skillPoints} skill points · ${a.status}`}
          >
            <p>{a.description}</p>
            {user.role === "learner" ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSubmit(a)}
              >
                Submit work
              </button>
            ) : (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEdit(a)}
                >
                  Edit
                </button>{" "}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    if (confirm("Delete assignment?"))
                      try {
                        await api("/assignments/" + a.id, "DELETE");
                        r.reload();
                      } catch (e) {
                        notify(e.message);
                      }
                  }}
                >
                  Delete
                </button>
                {(a.submissions || []).map((s) => (
                  <p key={s.learnerId}>
                    {s.learnerId}: {s.submissionText || s.text}{" "}
                    <button
                      className="btn btn-green btn-sm"
                      onClick={async () => {
                        try {
                          await api(
                            "/assignments/" + a.id + "/approve/" + s.learnerId,
                            "POST",
                            {},
                          );
                          notify("Completion approved.");
                          r.reload();
                        } catch (e) {
                          notify(e.message);
                        }
                      }}
                    >
                      Approve completion
                    </button>
                  </p>
                ))}
              </>
            )}
          </Card>
        ))}
      {!r.data.length && <Empty />}
      {edit && (
        <Modal title="Assignment" onClose={() => setEdit(null)}>
          <Editor
            fields={[
              { name: "title" },
              { name: "description", type: "textarea" },
              { name: "dueDate", type: "date" },
              { name: "skillPoints", type: "number", min: 1 },
              { name: "difficulty", options: ["Easy", "Medium", "Hard"] },
              ...(user.role === "provider"
                ? [
                    {
                      name: "courseId",
                      options: courses.data.map((c) => ({
                        value: c.id,
                        label: c.title,
                      })),
                    },
                  ]
                : user.role !== "instructor"
                  ? [
                      {
                        name: "instructorId",
                        options: instructors.map((i) => ({
                          value: i.id,
                          label: i.firstName + " " + i.lastName,
                        })),
                      },
                    ]
                  : []),
            ]}
            initial={{ skillPoints: 50, difficulty: "Medium", ...edit }}
            onSubmit={async (v) => {
              const b = {
                title: v.title,
                description: v.description,
                dueDate: v.dueDate,
                skillPoints: Number(v.skillPoints),
                difficulty: v.difficulty,
                ...(user.role === "provider"
                  ? { providerId: user.id, courseId: v.courseId }
                  : {
                      instructorId:
                        user.role === "instructor" ? user.id : v.instructorId,
                      studentIds: edit.studentIds || learners.map((x) => x.id),
                    }),
              };
              await api(
                "/assignments" + (edit.id ? "/" + edit.id : ""),
                edit.id ? "PATCH" : "POST",
                b,
              );
              setEdit(null);
              r.reload();
              notify("Assignment saved.");
            }}
          />
        </Modal>
      )}
      {submit && (
        <Modal title={submit.title} onClose={() => setSubmit(null)}>
          <Editor
            fields={[
              {
                name: "submissionText",
                label: "Your solution",
                type: "textarea",
              },
            ]}
            onSubmit={async (v) => {
              await api("/assignments/" + submit.id + "/submit", "POST", {
                learnerId: user.id,
                ...v,
              });
              setSubmit(null);
              r.reload();
              notify("Submitted for review.");
            }}
          />
        </Modal>
      )}
    </>
  );
}
export function Sessions({ user, openSignal = 0, notify }) {
  const r = useResource(
      user.role === "learner" ? "/sessions/learner/" + user.id : "/sessions",
    ),
    u = useResource(
      ["admin", "superuser", "instructor"].includes(user.role)
        ? "/users"
        : null,
    ),
    [edit, setEdit] = useState(null),
    [seen, setSeen] = useState(openSignal);
  if (openSignal !== seen) {
    setSeen(openSignal);
    setEdit({});
  }
  return (
    <>
      <Notice error={r.error} />
      {r.data.filter(s=>user.role!=="instructor" || s.instructorId===user.id).map((s) => (
        <Card
          key={s.id}
          title={s.title}
          subtitle={`${s.date} ${s.time} · ${s.status}`}
        >
          <p>{s.description}</p>
          {["instructor", "admin", "superuser"].includes(user.role) && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEdit(s)}
              >
                Edit
              </button>{" "}
              <button
                className="btn btn-secondary btn-sm"
                onClick={async () => {
                  if (confirm("Delete session?"))
                    try {
                      await api("/sessions/" + s.id, "DELETE");
                      r.reload();
                    } catch (e) {
                      notify(e.message);
                    }
                }}
              >
                Delete
              </button>
            </>
          )}
        </Card>
      ))}
      {!r.data.length && <Empty />}
      {edit && (
        <Modal title="Schedule Session" onClose={() => setEdit(null)}>
          <Editor
            fields={[
              { name: "title" },
              { name: "description", type: "textarea" },
              { name: "date", type: "date" },
              { name: "time", type: "time" },
              { name: "duration", type: "number" },
              ...(user.role !== "instructor"
                ? [
                    {
                      name: "instructorId",
                      options: u.data
                        .filter((x) => x.role === "instructor")
                        .map((x) => ({ value: x.id, label: x.firstName })),
                    },
                  ]
                : []),
            ]}
            initial={{ duration: 60, ...edit }}
            onSubmit={async (v) => {
              await api(
                "/sessions" + (edit.id ? "/" + edit.id : ""),
                edit.id ? "PATCH" : "POST",
                {
                  title: v.title,
                  description: v.description,
                  date: v.date,
                  time: v.time,
                  duration: Number(v.duration),
                  instructorId:
                    user.role === "instructor" ? user.id : v.instructorId,
                  studentIds:
                    edit.studentIds ||
                    u.data
                      .filter(
                        (x) =>
                          x.role === "learner" &&
                          (user.role !== "instructor" ||
                            x.instructorId === user.id),
                      )
                      .map((x) => x.id),
                },
              );
              setEdit(null);
              r.reload();
              notify("Session saved.");
            }}
          />
        </Modal>
      )}
    </>
  );
}
export function Configuration() {
  const r = useResource("/admin/config", {});
  return (
    <>
      <Notice error={r.error} />
      {!r.loading && (
        <Editor
          key={JSON.stringify(r.data)}
          fields={[
            { name: "platformName", label: "Platform name" },
            {
              name: "maxDailyTrades",
              label: "Max daily trades",
              type: "number",
              min: 1,
            },
            {
              name: "defaultTradingLimit",
              label: "Default trading limit",
              type: "number",
              min: 1,
            },
            {
              name: "cooldown",
              label: "Cooldown (seconds)",
              type: "number",
              min: 0,
            },
          ]}
          initial={r.data}
          onSubmit={async (v) => {
            await api(
              "/admin/config",
              "PATCH",
              Object.fromEntries(
                [
                  "platformName",
                  "maxDailyTrades",
                  "defaultTradingLimit",
                  "cooldown",
                ]
                  .filter((k) => v[k] !== undefined)
                  .map((k) => [k, v[k]]),
              ),
            );
            r.reload();
          }}
        />
      )}
    </>
  );
}

function AccountForm({user,edit,kind,instructors,onSubmit}){
 const [actor,setActor]=useState(edit.role||kind||"");
 const fields=[...names,...(!edit.id?[{name:"password",type:"password"}]:[]),{name:"status",options:["active","pending","suspended"]}];
 if(actor==="learner")fields.push({name:"institution",label:"Institution",required:false},{name:"studentId",label:"Student ID",required:false},{name:"instructorId",label:"Assigned instructor",options:instructors,required:false});
 if(actor==="instructor")fields.push({name:"institution",label:"Institution"},{name:"expertise",label:"Specialization"},{name:"yearsExp",label:"Years experience",options:["0-1","1-3","3-5","5+"]});
 if(actor==="provider")fields.push({name:"organization",label:"Organization"});
 if(actor==="admin")fields.push({name:"adminTeam",label:"Admin division",options:[{value:"USER_ADMIN",label:"User Admin"},{value:"PAYMENT_ADMIN",label:"Payment Admin"}]});
 return <><label className="form-label" htmlFor="account-actor">Actor</label><select id="account-actor" className="form-select mb-16" value={actor} disabled={!!edit.id} onChange={e=>setActor(e.target.value)}><option value="">Choose actor first</option>{(edit.role==='superuser'?['superuser']:user.role==='superuser'?['learner','instructor','provider','admin']:['learner','instructor','provider']).map(v=><option key={v} value={v}>{{learner:'Learner',instructor:'Instructor',provider:'Course Provider',admin:'Admin',superuser:'Super Admin'}[v]}</option>)}</select>
 {actor&&<Editor key={actor} fields={fields} initial={{status:"active",...edit}} onSubmit={v=>onSubmit({...v,...(!edit.id?{role:actor}:{})})}/>}
 </>;
}
