import { useState } from "react";
import { api, money } from "../services/api";
import { checkout } from "../services/payments";
import { useResource } from "../hooks/useResource";
import { Card, Stats, Editor, Modal, Table, Notice } from "./Common";
export function Subscription({ user, notify, onUser }) {
  const plans = useResource("/commercial/plans"),
    sub = useResource("/commercial/subscriptions/user/" + user.id, {});
  return (
    <>
      <Card title="Your Subscription" subtitle="Free and Pro learning access">
        <Notice error={sub.error} />
        <GatewayStatus />
        <span className="badge badge-blue">{sub.data.tier || "FREE"}</span>
        <p>{sub.data.plan?.name || "Free learning plan"}</p>
      </Card>
      <div className="grid-3">
        {plans.data
          .filter((p) => p.audience === "B2C")
          .map((p) => (
            <Card
              key={p.id}
              title={p.name}
              subtitle={money(p.price) + " · " + p.billing}
            >
              <ul>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {p.price > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await checkout({ user, planId: p.id });
                      sub.reload();
                      onUser?.(await api("/auth/me"));
                      notify("Payment verified. Pro is active.");
                    } catch (e) {
                      notify(e.message);
                    }
                  }}
                >
                  Pay with Razorpay
                </button>
              )}
            </Card>
          ))}
      </div>
    </>
  );
}
export function Revenue({ user, notify }) {
  const r = useResource("/commercial/revenue/summary", {}),
    orgs = useResource("/commercial/organizations"),
    pending = useResource("/commercial/courses/pending-review"),
    users = useResource(user.role === "superuser" ? "/users" : null),
    [review, setReview] = useState(null),
    [payOrg, setPayOrg] = useState(null);
  return (
    <>
      <Notice error={r.error} />
      <GatewayStatus />
      <div className="stat-grid">
        <Stats
          items={[
            [
              "B2C Pro",
              money(r.data.b2cProRevenue),
              "Verified subscriptions",
              "green",
            ],
            [
              "B2B Institutions",
              money(r.data.b2bInstitutionRevenue),
              "Institution licenses",
              "purple",
            ],
            [
              "Provider settlements",
              money(r.data.providerPayouts),
              "Internal settlements",
              "orange",
            ],
            [
              "Instructor settlements",
              money(r.data.instructorPayouts),
              "Compensation",
            ],
          ]}
        />
      </div>
      <div className="grid-2">
        <Card
          title="Course Pricing & Approval Queue"
          subtitle="Counter-offer or sanction provider production quotes"
        >
          <Notice error={pending.error} />
          {pending.data.map((c) => (
            <div
              className="flex-between"
              style={{ padding: "14px 0" }}
              key={c.id}
            >
              <div>
                <strong>{c.title}</strong>
                <p>
                  {money(c.quotedPrice)} · {c.reviewStatus}
                </p>
              </div>
              <button
                className="btn btn-purple btn-sm"
                onClick={() => setReview(c)}
              >
                Review
              </button>
            </div>
          ))}
        </Card>
        <Card
          title="Institution Billing"
          subtitle="Activate institution licenses with verified Razorpay payments"
        >
          {orgs.data.map((o) => (
            <div
              className="flex-between"
              style={{ padding: "14px 0" }}
              key={o.id}
            >
              <div>
                <strong>{o.name}</strong>
                <p>
                  {o.licenseStatus} · {money(o.annualPrice)}
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPayOrg(o)}
              >
                {o.licenseStatus === "ACTIVE" ? "Renew" : "Activate"}
              </button>
            </div>
          ))}
        </Card>
      </div>
      <Card title="Recent Payment Ledger">
        <Table
          heads={["Type", "Amount", "Gateway", "Status"]}
          rows={(r.data.transactions || []).map((t) => [
            t.type,
            money(t.amount),
            t.gateway,
            t.status,
          ])}
        />
      </Card>
      <InstructorPay notify={notify} />
      {review && (
        <Modal title="Commercial Course Review" onClose={() => setReview(null)}>
          <p>
            {review.title} · Quote: {money(review.quotedPrice)}
          </p>
          <Editor
            fields={[
              {
                name: "offeredPrice",
                label: "Counter-offer (₹)",
                type: "number",
                min: 0,
              },
              { name: "message", label: "Negotiation note", type: "textarea" },
            ]}
            initial={{ offeredPrice: review.adminOffer ?? review.quotedPrice }}
            submit="Send Counter-offer"
            onSubmit={async (b) => {
              await api(
                "/commercial/courses/" + review.id + "/counter-offer",
                "POST",
                b,
              );
              setReview(null);
              pending.reload();
            }}
          />
          <button
            className="btn btn-green"
            style={{ marginTop: 16 }}
            onClick={async () => {
              try {
                await api(
                  "/commercial/courses/" + review.id + "/approve",
                  "POST",
                  {
                    sanctionedAmount: Number(
                      review.acceptedPrice ?? review.quotedPrice ?? 0,
                    ),
                  },
                );
                setReview(null);
                pending.reload();
                r.reload();
                notify("Course sanctioned and published.");
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            Sanction & Publish
          </button>
        </Modal>
      )}
      {payOrg && (
        <Modal title={payOrg.name + " License"} onClose={() => setPayOrg(null)}>
          <Editor
            fields={[
              {
                name: "amount",
                label: "Annual license amount (₹)",
                type: "number",
                min: 1,
              },
            ]}
            initial={{ amount: payOrg.annualPrice }}
            submit="Pay with Razorpay"
            onSubmit={async (b) => {
              await checkout({ user, organization: payOrg, amount: b.amount });
              setPayOrg(null);
              orgs.reload();
              r.reload();
              notify("Institution license payment verified.");
            }}
          />
        </Modal>
      )}
    </>
  );
}
function InstructorPay({ notify }) {
  const r = useResource("/commercial/compensation/instructors"),
    [edit, setEdit] = useState(null);
  return (
    <Card
      title="Instructor Compensation"
      subtitle="Monthly per-student rates and skill growth bonuses"
    >
      <Notice error={r.error} />
      <Table
        heads={["Instructor", "Monthly rate", "Action"]}
        rows={r.data.map((i) => [
          i.firstName + " " + i.lastName,
          money(i.instructorMonthlyRate),
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setEdit(i)}
          >
            Manage
          </button>,
        ])}
      />
      {edit && (
        <Modal title="Instructor Compensation" onClose={() => setEdit(null)}>
          <Editor
            fields={[
              {
                name: "perStudentMonthlyRate",
                label: "Monthly rate per student",
                type: "number",
                min: 0,
              },
            ]}
            initial={{ perStudentMonthlyRate: edit.instructorMonthlyRate }}
            onSubmit={async (b) => {
              await api(
                "/commercial/instructors/" + edit.id + "/rate",
                "PATCH",
                b,
              );
              notify("Rate updated.");
              r.reload();
            }}
          />
          <Editor
            fields={[
              {
                name: "amount",
                label: "Performance bonus",
                type: "number",
                min: 1,
              },
              { name: "reason" },
            ]}
            onSubmit={async (b) => {
              await api(
                "/commercial/instructors/" + edit.id + "/bonus",
                "POST",
                b,
              );
              notify("Bonus recorded.");
            }}
          />
          <button
            className="btn btn-green"
            style={{ marginTop: 16 }}
            onClick={async () => {
              try {
                await api(
                  "/commercial/instructors/" + edit.id + "/pay-month",
                  "POST",
                  {},
                );
                notify("Monthly settlement recorded.");
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            Settle current month
          </button>
        </Modal>
      )}
    </Card>
  );
}
export function Earnings({ user }) {
  const r = useResource(
    "/commercial/" +
      (user.role === "provider" ? "providers" : "instructors") +
      "/" +
      user.id +
      "/earnings",
    {},
  );
  return (
    <>
      <Notice error={r.error} />
      <div className="stat-grid">
        <Stats
          items={
            user.role === "provider"
              ? [
                  [
                    "Total Earnings",
                    money(r.data.totalEarned),
                    "Sanctioned course payments",
                    "green",
                  ],
                  ["Pending", money(r.data.pendingAmount), "Awaiting review"],
                ]
              : [
                  [
                    "Monthly Earnings",
                    money(r.data.totalMonthlyEarning),
                    "Base plus bonuses",
                    "green",
                  ],
                  [
                    "Active Students",
                    r.data.activeStudents || 0,
                    "Assigned learners",
                  ],
                  [
                    "Performance Bonus",
                    money(r.data.performanceBonus),
                    "Skill growth rewards",
                    "orange",
                  ],
                ]
          }
        />
      </div>
      <Card title="Payment History">
        <Table
          heads={["Type", "Amount", "Status", "Date"]}
          rows={(r.data.payouts || r.data.transactions || []).map((t) => [
            t.type,
            money(t.amount),
            t.status,
            (t.createdAt || t.paidAt || "").slice(0, 10),
          ])}
        />
      </Card>
    </>
  );
}

function GatewayStatus() {
  const r = useResource("/payments/razorpay/config", {});
  return (
    <div style={{ marginBottom: 16 }}>
      <Notice error={r.error} />
      {!r.loading && (
        <>
          <span
            className={
              "badge " + (r.data.configured ? "badge-green" : "badge-orange")
            }
          >
            {r.data.configured
              ? "Razorpay " + r.data.mode + " checkout configured"
              : "Razorpay API keys needed"}
          </span>
          {r.data.paymentLink && (
            <p style={{ marginTop: 10 }}>
              <a
                className="btn btn-secondary btn-sm"
                href={r.data.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open your Razorpay payment page ↗
              </a>
            </p>
          )}
          {r.data.paymentLink && (
            <p className="card-subtitle">
              The hosted payment page opens separately. A payment made there
              needs separate confirmation; only verified in-app checkout
              activates access automatically.
            </p>
          )}
        </>
      )}
    </div>
  );
}
