import { useState } from "react";
import { Link } from "react-router-dom";
import { date, rupees, useAction, useResource } from "../hooks/api.js";
import {
  Action,
  Empty,
  Form,
  Heading,
  Pager,
  Result,
  Status,
} from "../components/Common.jsx";

export function Provider() {
  const [page, setPage] = useState(0);
  const query = useResource("/provider?page=" + page);
  const action = useAction();
  return (
    <>
      <Heading
        title="Course provider"
        detail="Manage your catalog, proposals, learner engagement, and licensing earnings."
      >
        <Link className="button" to="/courses">
          Manage course content
        </Link>
      </Heading>
      <Result query={query}>
        {(data) => (
          <>
            <div className="stats">
              <div>
                <small>Recorded earnings</small>
                <strong>{rupees(data.totals.earned)}</strong>
              </div>
              <div>
                <small>Recorded payments</small>
                <strong>{rupees(data.totals.paid)}</strong>
              </div>
              <div>
                <small>Awaiting settlement</small>
                <strong>{rupees(data.totals.earned - data.totals.paid)}</strong>
              </div>
            </div>
            <section className="panel inset">
              <h2>Your courses & proposals</h2>
              {data.courses.length ? (
                data.courses.map((course) => (
                  <article className="record" key={course.id}>
                    <div className="line-item">
                      <div>
                        <Link
                          className="text-link"
                          to={"/courses/" + course.id}
                        >
                          {course.title}
                        </Link>
                        <small>
                          {course.enrollments} enrollments ·{" "}
                          {course.quizSubmissions} quiz submissions
                        </small>
                      </div>
                      <Status>{course.state}</Status>
                    </div>
                    {course.terms_state ? (
                      <>
                        <p>
                          Licensing proposal {rupees(course.requested)}
                          {course.offered != null
                            ? " · Offered " + rupees(course.offered)
                            : ""}{" "}
                          <Status>{course.terms_state}</Status>
                        </p>
                        <p className="muted">{course.note}</p>
                        {course.terms_state === "countered" && (
                          <div className="actions">
                            <Action
                              title="Accept counteroffer"
                              path={"/courses/" + course.id + "/terms/respond"}
                              body={{ accept: true }}
                              confirm="Accept these course licensing terms?"
                            />
                            <Action
                              title="Decline counteroffer"
                              path={"/courses/" + course.id + "/terms/respond"}
                              body={{ accept: false }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="muted">
                        Submit a licensing proposal before publication.
                      </p>
                    )}
                    {(!course.terms_state ||
                      course.terms_state === "rejected") &&
                      ["draft", "review"].includes(course.state) && (
                        <Form
                          fields={[
                            {
                              name: "amount",
                              label:
                                "Requested one-time course licensing fee (₹)",
                              type: "number",
                              min: 0,
                            },
                            {
                              name: "note",
                              label: "Proposal details",
                              type: "textarea",
                              min: 5,
                              max: 2000,
                            },
                          ]}
                          submit="Submit proposal"
                          onSubmit={(body) =>
                            action.mutateAsync({
                              path: "/courses/" + course.id + "/terms",
                              body: {
                                amount: Math.round(Number(body.amount) * 100),
                                note: body.note,
                              },
                            })
                          }
                        />
                      )}
                    <div className="actions">
                      <Link
                        className="button secondary"
                        to={"/courses/" + course.id}
                      >
                        Course workspace
                      </Link>
                      <Link
                        className="button secondary"
                        to={"/quizzes/new?course=" + course.id}
                      >
                        Create course quiz
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <Empty>Create a course to start your catalog.</Empty>
              )}
            </section>
            <section className="panel inset">
              <h2>Settlement records</h2>
              <p className="muted">
                Administrators record external transfers with a reference after
                payment.
              </p>
              {data.settlements.length ? (
                data.settlements.map((s) => (
                  <div className="line-item" key={s.id}>
                    <div>
                      <strong>{s.title}</strong>
                      <small>
                        {s.reference || "Awaiting transfer reference"} ·{" "}
                        {date(s.paid || s.created)}
                      </small>
                    </div>
                    <span>
                      {rupees(s.amount)} <Status>{s.state}</Status>
                    </span>
                  </div>
                ))
              ) : (
                <Empty>No settlements yet.</Empty>
              )}
            </section>
            {(page > 0 ||
              data.courses.length === 25 ||
              data.settlements.length === 25) && (
              <Pager
                page={page}
                setPage={setPage}
                more={
                  data.courses.length === 25 || data.settlements.length === 25
                }
              />
            )}
          </>
        )}
      </Result>
    </>
  );
}
