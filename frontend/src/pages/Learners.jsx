import { rupees, useAction, useResource } from "../hooks/api.js";
import { Empty, Form, Heading, Result } from "../components/Common.jsx";

export function Learners() {
  const query = useResource("/teaching/learners");
  const action = useAction();
  return (
    <>
      <Heading
        title="My learners"
        detail="Review your active roster and award paper funds for reviewed work."
      />
      <Result query={query}>
        {(rows) => (
          <div className="catalog">
            {rows.length ? (
              rows.map((row) => (
                <article key={row.id} className="panel inset">
                  <h2>{row.name}</h2>
                  <p className="muted">{row.email}</p>
                  <p className="capitalize">{row.plan} plan</p>
                  <div className="line-item">
                    <span>Awarded in the last seven days</span>
                    <strong>{rupees(row.awardedLastWeek)}</strong>
                  </div>
                  <p className="muted">
                    Weekly allowance remaining{" "}
                    {rupees(1000000 - row.awardedLastWeek)}.
                  </p>
                  {row.reviewedWork.length && row.awardedLastWeek < 1000000 ? (
                    <Form
                      fields={[
                        {
                          name: "submission",
                          label: "Reviewed work",
                          options: row.reviewedWork.map((s) => ({
                            value: s.id,
                            label: "#" + s.id + " · " + s.title,
                          })),
                        },
                        {
                          name: "amount",
                          label: "Paper funds to award (₹)",
                          type: "number",
                          min: 1,
                          max: (1000000 - row.awardedLastWeek) / 100,
                        },
                        {
                          name: "reason",
                          label: "Work and progress supporting this award",
                          type: "textarea",
                          min: 10,
                          max: 1000,
                        },
                      ]}
                      submit="Award paper funds"
                      onSubmit={(data) =>
                        action.mutateAsync({
                          path: "/teaching/learners/" + row.id + "/award",
                          body: {
                            submission: Number(data.submission),
                            amount: Math.round(Number(data.amount) * 100),
                            reason: data.reason,
                          },
                        })
                      }
                    />
                  ) : (
                    <Empty>
                      {row.awardedLastWeek >= 1000000
                        ? "The weekly paper-fund allowance has been used."
                        : "Review a submission before awarding paper funds."}
                    </Empty>
                  )}
                </article>
              ))
            ) : (
              <Empty>No active learners.</Empty>
            )}
          </div>
        )}
      </Result>
    </>
  );
}
