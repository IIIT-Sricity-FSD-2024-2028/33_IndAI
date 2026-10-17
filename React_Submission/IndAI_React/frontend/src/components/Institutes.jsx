import { useState } from "react";
import { api, download, csv } from "../services/api";
import { useResource } from "../hooks/useResource";
import { Card, Editor, Modal, Table, Notice } from "./Common";
const template =
  "firstName,lastName,email,role,studentId,expertise,yearsExp\r\nJessie,Reddy,jessie@example.in,learner,STU001,,\r\n";
export default function Institutes({ notify }) {
  const orgs = useResource("/commercial/organizations"),
    [org, setOrg] = useState(null),
    [newOrg, setNewOrg] = useState(false),
    [text, setText] = useState(""),
    [preview, setPreview] = useState(null),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [url, setUrl] = useState(""),
    [busy, setBusy] = useState(false);
  const submissions=useResource(org?"/institutes/"+org.id+"/requests":null);
  const requests=submissions.data;
  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Card
        title="Institutions & Mapping"
        subtitle="Institution intake, CSV review and mass account provisioning"
        actions={
          <button className="btn btn-primary" onClick={() => setNewOrg(true)}>
            + Create Institution
          </button>
        }
      >
        <Notice error={orgs.error} />
        <Table
          heads={["Institution", "License", "Seats", "Actions"]}
          rows={orgs.data.map((o) => [
            o.name,
            o.licenseStatus,
            o.seats,
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setOrg(o);
                setText("");
                setResult(null);
                setPreview(null);
                setUrl("");
                setError("");
              }}
            >
              Manage intake
            </button>,
          ])}
        />
      </Card>
      {newOrg && (
        <Modal title="Create Institution" onClose={() => setNewOrg(false)}>
          <Editor
            fields={[
              { name: "name", label: "Institution name" },
              { name: "code", label: "Institution code (uppercase)" },
              { name: "billingEmail", label: "Institute email", type: "email" },
              { name: "seats", type: "number" },
              {
                name: "annualPrice",
                label: "Annual license (₹)",
                type: "number",
              },
            ]}
            initial={{ seats: 500, annualPrice: 150000 }}
            onSubmit={async (values) => {
              await api("/commercial/organizations", "POST", values);
              orgs.reload();
              setNewOrg(false);
            }}
          />
        </Modal>
      )}
      {org && (
        <Modal
          title={org.name + " — Account Intake"}
          onClose={() => setOrg(null)}
        >
          <Notice error={error} />
          <Editor
            fields={[
              {
                name: "email",
                label: "Institute coordinator email",
                type: "email",
              },
            ]}
            initial={{ email: org.billingEmail }}
            submit="Create link & email invitation"
            onSubmit={async (b) => {
              const r = await api(
                "/institutes/" + org.id + "/invite",
                "POST",
                b,
              );
              setUrl(r.url);
              notify(r.sent ? "Invitation sent." : r.message);
            }}
          />
          {url && (
            <p style={{ overflowWrap: "anywhere" }}>
              Private intake link: <a href={url}>{url}</a>
            </p>
          )}
          <div className="divider" />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => download("institute-intake-template.csv", template)}
          >
            Download CSV template
          </button>{" "}
          <button
            className="btn btn-secondary btn-sm"
            disabled={busy}
            onClick={()=>submissions.reload()}
          >
            Refresh institute submissions
          </button>
          <p className="card-subtitle mt-16">Intake requests and rosters returned through the private invitation link appear here. Refresh to check for new submissions, then choose Review submitted CSV.</p>
          <Notice error={submissions.error}/>
          {submissions.loading?<p role="status">Loading institute submissions…</p>:!requests.length&&<p role="status">No institute submissions yet. Create an invitation link above, or upload a CSV directly below.</p>}

          {requests.map((r) => (
            <div key={r.id} className="flex-between" style={{ padding: 8 }}>
              <span>
                {r.email} · {r.status}
              </span>
              {r.csv && r.status !== "IMPORTED" && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setText(r.csv);
                    setPreview(null);
                    setResult(null);
                  }}
                >
                  Review submitted CSV
                </button>
              )}
            </div>
          ))}
          <label className="form-label">Upload CSV from institute</label>
          <input
            aria-label="Upload institute CSV"
            type="file"
            accept=".csv,text/csv"
            onChange={async (e) => {
              const f = e.target.files[0];
              if (f) {
                setText(await f.text());
                setPreview(null);
                setResult(null);
              }
            }}
          />
          <textarea
            className="form-textarea"
            aria-label="CSV contents"
            rows="7"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setPreview(null);
            }}
          />
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              disabled={!text || busy}
              onClick={() =>
                run(async () =>
                  setPreview(
                    await api("/institutes/" + org.id + "/preview", "POST", {
                      csv: text,
                    }),
                  ),
                )
              }
            >
              Validate & preview
            </button>
            <button
              className="btn btn-primary"
              disabled={!preview || !!result || busy}
              onClick={() =>
                run(async () => {
                  setResult(
                    await api("/institutes/" + org.id + "/import", "POST", {
                      csv: text,
                    }),
                  );
                  orgs.reload();
                  notify("Accounts created. Download credentials now.");
                })
              }
            >
              Create {preview?.count || ""} Accounts
            </button>
          </div>
          {preview && (
            <Table
              heads={["Name", "Email", "Role"]}
              rows={preview.rows.map((r) => [
                r.firstName + " " + r.lastName,
                r.email,
                r.role,
              ])}
            />
          )}
          <p className="card-subtitle">
            Accounts can be created after Payment Admin activates this
            institution's license.
          </p>
          {result && (
            <div className="alert alert-blue">
              <p>
                {result.count} accounts created. Generated credentials are
                available once in this session.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => download("indai-credentials.csv", result.csv)}
              >
                Download credentials CSV
              </button>{" "}
              <button
                className="btn btn-secondary"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await api(
                      "/institutes/" + org.id + "/email-credentials",
                      "POST",
                      { userIds: result.userIds },
                    );
                    setResult(null);
                    notify(
                      "New credentials emailed to " +
                        org.billingEmail +
                        ". Earlier exported passwords have been replaced.",
                    );
                  })
                }
              >
                Generate fresh credentials & email institute
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
export function InstituteIntake({ token }) {
  const info = useResource("/institutes/intake/" + token, {});
  const [mode, setMode] = useState("form"),
    [people, setPeople] = useState([]),
    [text, setText] = useState(""),
    [done, setDone] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const headers = [
    "firstName",
    "lastName",
    "email",
    "role",
    "studentId",
    "expertise",
    "yearsExp",
  ];
  const roster =
    mode === "form"
      ? csv([headers, ...people.map((p) => headers.map((k) => p[k] || ""))])
      : text;
  return (
    <main style={{ maxWidth: 900, margin: "48px auto", padding: 24 }}>
      <h1>IndAI · {info.data.name || "Institution intake"}</h1>
      <Card
        title="Submit institution account details"
        subtitle="Fill the form for each person, or upload a CSV roster."
      >
        <Notice error={info.error || error} />
        {done ? (
          <p className="alert alert-blue">
            Submitted. Your User Admin will review the roster and provision
            accounts.
          </p>
        ) : (
          <>
            <p>
              No passwords are needed. IndAI generates credentials after account
              approval.
            </p>
            <div className="mb-16">
              <button
                className={
                  "btn " + (mode === "form" ? "btn-primary" : "btn-secondary")
                }
                onClick={() => setMode("form")}
              >
                Fill form
              </button>{" "}
              <button
                className={
                  "btn " + (mode === "csv" ? "btn-primary" : "btn-secondary")
                }
                onClick={() => setMode("csv")}
              >
                Upload CSV
              </button>
            </div>
            {mode === "form" ? (
              <>
                <Editor
                  key={people.length}
                  fields={[
                    { name: "firstName", label: "First name" },
                    { name: "lastName", label: "Last name" },
                    { name: "email", type: "email" },
                    {
                      name: "role",
                      options: ["learner", "instructor", "provider"],
                    },
                    {
                      name: "studentId",
                      label: "Student ID (learners)",
                      required: false,
                    },
                    {
                      name: "expertise",
                      label: "Expertise (instructors)",
                      required: false,
                    },
                    {
                      name: "yearsExp",
                      label: "Years experience (instructors)",
                      required: false,
                    },
                  ]}
                  initial={{ role: "learner" }}
                  submit="Add person to roster"
                  onSubmit={async (p) => {
                    if (
                      people.some(
                        (x) => x.email.toLowerCase() === p.email.toLowerCase(),
                      )
                    )
                      throw Error("Email already in roster.");
                    if (p.role === "learner" && !p.studentId)
                      throw Error("Student ID is required for learners.");
                    if (
                      p.role === "instructor" &&
                      (!p.expertise || !p.yearsExp)
                    )
                      throw Error(
                        "Add expertise and years of experience for instructors.",
                      );
                    setPeople([...people, p]);
                  }}
                />
                <Table
                  heads={["Name", "Email", "Role", "Action"]}
                  rows={people.map((p, i) => [
                    p.firstName + " " + p.lastName,
                    p.email,
                    p.role,
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        setPeople(people.filter((_, j) => j !== i))
                      }
                    >
                      Remove
                    </button>,
                  ])}
                />
              </>
            ) : (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => download("institute-template.csv", template)}
                >
                  Download template
                </button>
                <input
                  type="file"
                  aria-label="CSV upload"
                  accept=".csv"
                  onChange={async (e) => {
                    if (e.target.files[0])
                      setText(await e.target.files[0].text());
                  }}
                />
                <textarea
                  className="form-textarea"
                  rows="12"
                  aria-label="CSV details"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </>
            )}
            <button
              className="btn btn-primary mt-16"
              disabled={
                busy ||
                !!info.error ||
                (mode === "form" ? !people.length : !text)
              }
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await api("/institutes/intake/" + token, "POST", {
                    csv: roster,
                  });
                  setDone(true);
                } catch (e) {
                  setError(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Submit details
            </button>
          </>
        )}
      </Card>
    </main>
  );
}
