import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Resources } from "../components/Resources.jsx";
import { date, useAction, useResource } from "../hooks/api.js";
import {
  Empty,
  Form,
  Heading,
  Pager,
  Result,
  select,
  Status,
} from "../components/Common.jsx";
export function Tasks() {
  const user = useOutletContext();
  const [page, setPage] = useState(0);
  const staff = user.role !== "student";
  const instructor = user.role === "instructor";
  const query = useResource("/tasks?page=" + page);
  const guidance = useResource(staff ? "/guidance/active" : null);
  const mutation = useAction();
  const post = (path, body) => mutation.mutateAsync({ path, body });
  const roster = (guidance.data || [])
    .filter((row) => row.state === "active")
    .map((row) => ({ value: row.id, label: row.student_name }));
  return (
    <>
      <Heading
        title={staff ? "Learning tasks" : "Assignments & milestones"}
        detail="Track due dates, submissions, feedback, and learning milestones."
      />
      {staff && (
        <section className="panel inset narrow">
          <h2>{instructor ? "New assignment" : "New milestone"}</h2>
          {roster.length ? (
            <Form
              reset
              fields={[
                { name: "relationship", label: "Learner", options: roster },
                { name: "title", label: "Title", max: 120, min: 4 },
                {
                  name: "body",
                  label: "Instructions",
                  type: "textarea",
                  min: 5,
                  max: 5000,
                },
                {
                  name: "due",
                  label: "Due date and time (your local time)",
                  type: "datetime-local",
                },
              ]}
              submit={instructor ? "Assign work" : "Add milestone"}
              onSubmit={(body) =>
                post(instructor ? "/assignments" : "/milestones", {
                  ...body,
                  relationship: Number(body.relationship),
                  due: new Date(body.due).getTime(),
                })
              }
            />
          ) : (
            <Empty>Accept a learner request to create work.</Empty>
          )}
        </section>
      )}
      {user.role === "provider" && roster.length > 0 && (
        <section className="panel inset narrow">
          <h2>Write a learning plan</h2>
          <Form
            fields={[
              { name: "relationship", label: "Learner", options: roster },
              { name: "title", label: "Plan title", min: 4, max: 120 },
              {
                name: "body",
                label: "Plan and follow-up notes",
                type: "textarea",
                min: 10,
                max: 8000,
              },
            ]}
            submit="Save learning plan"
            onSubmit={({ relationship, ...body }) =>
              mutation.mutateAsync({
                path: "/learning-plans/" + relationship,
                method: "PUT",
                body,
              })
            }
          />
        </section>
      )}
      <Result query={query}>
        {(data) => (
          <>
            {data.learningPlans.length > 0 && (
              <section className="panel inset">
                <h2>Learning plans</h2>
                {data.learningPlans.map((item) => (
                  <article className="record" key={item.relationship}>
                    <h3>{item.title}</h3>
                    <small>
                      {staff ? item.student_name + " · " : ""}Updated{" "}
                      {date(item.updated)} IST
                    </small>
                    <p className="prose">{item.body}</p>
                  </article>
                ))}
              </section>
            )}
            <div className="overview-grid">
              <section className="panel inset">
                <h2>Assignments</h2>
                {data.assignments.length ? (
                  data.assignments.map((item) => (
                    <article className="record" key={item.id}>
                      <h3>{item.title}</h3>
                      <small>
                        Due {date(item.due)} IST{" "}
                        {staff ? " · " + item.student_name : ""}
                      </small>
                      <p className="prose">{item.body}</p>
                      <Resources
                        kind="assignment"
                        target={item.id}
                        editable={
                          instructor && item.relationship_state === "active"
                        }
                      />
                      {instructor && item.relationship_state === "active" && (
                        <Link
                          className="button secondary"
                          to={"/quizzes/new?assignment=" + item.id}
                        >
                          Add optional assignment quiz
                        </Link>
                      )}
                      {item.quizzes?.length > 0 && (
                        <div className="record">
                          <h3>Assignment quizzes</h3>
                          {item.quizzes.map((q) => (
                            <div className="line-item" key={q.id}>
                              <Link
                                className="text-link"
                                to={"/quizzes/" + q.id}
                              >
                                {q.title}
                              </Link>
                              <Status>{q.state}</Status>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.submissions.map((sub) => (
                        <details className="record" key={sub.id}>
                          <summary>
                            Submission #{sub.id} · {date(sub.created)} IST{" "}
                            {sub.created > item.due ? " · Late" : ""}
                          </summary>
                          <p className="prose">{sub.body}</p>
                          <Resources
                            kind="submission"
                            target={sub.id}
                            editable={
                              !staff &&
                              !sub.reviewed &&
                              item.relationship_state === "active"
                            }
                          />
                          {sub.feedback ? (
                            <>
                              <strong>Feedback</strong>
                              <p className="prose">{sub.feedback}</p>
                            </>
                          ) : (
                            instructor && (
                              <Form
                                fields={[
                                  {
                                    name: "feedback",
                                    label: "Feedback",
                                    type: "textarea",
                                    min: 5,
                                    max: 10000,
                                  },
                                ]}
                                submit="Post feedback"
                                onSubmit={(body) =>
                                  post(
                                    "/submissions/" + sub.id + "/review",
                                    body,
                                  )
                                }
                              />
                            )
                          )}
                        </details>
                      ))}
                      {!staff && item.relationship_state === "active" && (
                        <details>
                          <summary>
                            {item.submissions.length
                              ? "Submit a revision"
                              : "Submit work"}
                          </summary>
                          <Form
                            reset
                            fields={[
                              {
                                name: "body",
                                label: "Your submission",
                                type: "textarea",
                                min: 5,
                                max: 10000,
                              },
                            ]}
                            submit="Submit work"
                            onSubmit={(body) =>
                              post("/assignments/" + item.id + "/submit", body)
                            }
                          />
                        </details>
                      )}
                    </article>
                  ))
                ) : (
                  <Empty>No assignments.</Empty>
                )}
              </section>
              <section className="panel inset">
                <h2>Milestones</h2>
                {data.milestones.length ? (
                  data.milestones.map((item) => (
                    <article className="record" key={item.id}>
                      <h3>
                        {item.title} <Status>{item.state}</Status>
                      </h3>
                      <small>
                        Due {date(item.due)} IST{" "}
                        {staff ? " · " + item.student_name : ""}
                      </small>
                      <p className="prose">{item.body}</p>
                      {user.role === "provider" && (
                        <Form
                          fields={[
                            {
                              name: "state",
                              label: "Milestone status",
                              options: select([
                                "planned",
                                "in-progress",
                                "complete",
                              ]),
                            },
                          ]}
                          initial={{ state: item.state }}
                          submit="Update milestone"
                          onSubmit={(body) =>
                            post("/milestones/" + item.id + "/state", body)
                          }
                        />
                      )}
                    </article>
                  ))
                ) : (
                  <Empty>No milestones.</Empty>
                )}
              </section>
            </div>
            {(page > 0 ||
              data.assignments.length === 25 ||
              data.milestones.length === 25 ||
              data.learningPlans.length === 25) && (
              <Pager
                page={page}
                setPage={setPage}
                more={
                  data.assignments.length === 25 ||
                  data.milestones.length === 25 ||
                  data.learningPlans.length === 25
                }
              />
            )}
          </>
        )}
      </Result>
    </>
  );
}
