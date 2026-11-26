import { Resources } from "../components/Resources.jsx";
import { useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { useAction, useResource } from "../hooks/api.js";
import { useSelector } from "react-redux";
import { selectResource } from "../redux/selectors/index.js";
import { useResourceSubscription, resourceResult } from "../redux/hooks.js";
import { createCourse } from "../redux/slices/courseSlice.js";
import {
  Action,
  Empty,
  ErrorText,
  Form,
  Heading,
  Pager,
  Result,
  select,
  Status,
} from "../components/Common.jsx";

const courseFields = [
  { name: "title", label: "Course title", min: 4, max: 120 },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    min: 15,
    max: 3000,
  },
  {
    name: "outcomes",
    label: "Learning outcomes",
    type: "textarea",
    min: 5,
    max: 2000,
  },
  {
    name: "difficulty",
    label: "Difficulty",
    options: select(["introductory", "intermediate", "advanced"]),
  },
  { name: "prerequisites", label: "Prerequisites", max: 1000, required: false },
  {
    name: "policy",
    label: "Plan access",
    options: select(["basic", "pro", "plus"]),
  },
];
export function Courses() {
  const user = useOutletContext();
  const [create, setCreate] = useState(false);
  const [page, setPage] = useState(0);
  const [deletion, setDeletion] = useState(null);
  const remove = useAction();
  const path = "/courses?page=" + page;
  const refresh = useResourceSubscription(path);
  const entry = useSelector((state) => selectResource(state, path));
  const query = resourceResult(entry, refresh);
  const mutation = useAction();
  const navigate = useNavigate();
  function deleteCourse(row) {
    const question =
      row.state === "published"
        ? "Archive “" +
          row.title +
          "”? Existing learners keep their course access and history."
        : "Permanently delete “" + row.title + "” and its draft content?";
    if (!window.confirm(question)) return;
    setDeletion(null);
    remove.mutate(
      { path: "/courses/" + row.id, method: "DELETE" },
      {
        onSuccess: (result) => {
          setDeletion(
            row.title +
              (result.outcome === "archived"
                ? " was archived. Learner history was preserved."
                : " was deleted."),
          );
        },
      },
    );
  }
  return (
    <>
      <Heading
        title={user.role === "student" ? "Learning center" : "Courses"}
        detail={
          user.role === "student"
            ? "Find your next course or resume a lesson."
            : "Manage course content and review status."
        }
      >
        {["instructor", "provider"].includes(user.role) && (
          <button className="button" onClick={() => setCreate(!create)}>
            {create ? "Close" : "Create course"}
          </button>
        )}
      </Heading>
      {create && (
        <section className="panel inset narrow">
          <h2>Course details</h2>
          <Form
            fields={courseFields}
            submit="Create draft"
            onSubmit={async (body) => {
              const result = await mutation.mutateAsync({
                path: "/courses",
                thunk: createCourse,
                body: { ...body, prerequisites: body.prerequisites || "" },
              });
              navigate("/courses/" + result.id);
            }}
          />
        </section>
      )}
      <ErrorText error={remove.error} />
      {deletion && (
        <div className="notice" role="status">
          {deletion}
        </div>
      )}
      <Result query={query}>
        {(rows) => (
          <>
            {rows.length ? (
              <div className="catalog">
                {rows.map((row) => (
                  <article key={row.id} className="panel course-card">
                    <div className="actions">
                      <Status>{row.policy}</Status>
                      {user.role !== "student" && <Status>{row.state}</Status>}
                    </div>
                    <h2>{row.title}</h2>
                    <p>{row.description}</p>
                    <small className="capitalize">
                      {row.difficulty}
                      {row.instructor ? " · " + row.instructor : ""}
                    </small>
                    {row.enrolled === 1 && (
                      <div className="progress">
                        <progress value={row.complete} max={row.lessons || 1} />
                        <span>
                          {row.complete}/{row.lessons} lessons
                        </span>
                      </div>
                    )}
                    <div className="actions course-actions">
                      <Link
                        className="button secondary"
                        to={row.locked ? "/plans" : "/courses/" + row.id}
                      >
                        {row.locked
                          ? "Compare plans"
                          : row.enrolled
                            ? "Continue"
                            : "View course"}
                      </Link>
                      {["instructor", "provider"].includes(user.role) &&
                        row.owner === user.id &&
                        ["draft", "published"].includes(row.state) && (
                          <button
                            className="button secondary"
                            disabled={remove.isPending}
                            onClick={() => deleteCourse(row)}
                          >
                            Delete course
                          </button>
                        )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <Empty>No courses to show.</Empty>
            )}
            {(page > 0 || rows.length === 24) && (
              <Pager page={page} setPage={setPage} more={rows.length === 24} />
            )}
          </>
        )}
      </Result>
    </>
  );
}
export function Course() {
  const user = useOutletContext();
  const { id } = useParams();
  const base = "/courses/" + id;
  const query = useResource(base);
  const mutation = useAction();
  return (
    <Result query={query}>
      {(row) => {
        const owner =
          ["instructor", "provider"].includes(user.role) &&
          row.owner === user.id;
        const reviewer = user.role === "superadmin";
        return (
          <>
            <Heading title={row.title} detail={row.description}>
              <Link className="button secondary" to="/courses">
                All courses
              </Link>
            </Heading>
            <section className="panel inset">
              <div className="actions">
                <Status>{row.policy}</Status>
                <Status>{row.state}</Status>
              </div>
              <h2>Learning outcomes</h2>
              <p className="prose">{row.outcomes}</p>
              {row.prerequisites && <p>Prerequisites · {row.prerequisites}</p>}
              {user.role === "student" && !row.enrolled && (
                <Action path={base + "/enroll"} title="Enroll" className="" />
              )}
              {owner && row.state === "draft" && (
                <details>
                  <summary>Edit course details</summary>
                  <Form
                    fields={courseFields}
                    initial={Object.fromEntries(
                      courseFields.map((field) => [
                        field.name,
                        row[field.name],
                      ]),
                    )}
                    submit="Save draft"
                    onSubmit={(body) =>
                      mutation.mutateAsync({ path: base, method: "PUT", body })
                    }
                  />
                </details>
              )}
              {owner && row.state === "draft" && (
                <Action path={base + "/submit"} title="Submit for review" />
              )}
              {reviewer && row.state === "review" && (
                <>
                  <Action
                    path={base + "/review"}
                    body={{ action: "publish" }}
                    title="Publish course"
                    confirm="Publish this course?"
                  />
                  <Form
                    fields={[
                      { name: "reason", label: "Revision reason", max: 400 },
                    ]}
                    submit="Return to draft"
                    onSubmit={(body) =>
                      mutation.mutateAsync({
                        path: base + "/review",
                        body: { ...body, action: "return" },
                      })
                    }
                  />
                </>
              )}
              {reviewer && row.state === "published" && (
                <Form
                  fields={[
                    { name: "reason", label: "Archive reason", max: 400 },
                  ]}
                  submit="Archive course"
                  onSubmit={(body) =>
                    mutation.mutateAsync({
                      path: base + "/review",
                      body: { ...body, action: "archive" },
                    })
                  }
                />
              )}
            </section>
            {(row.enrolled || owner || reviewer) && (
              <section className="panel inset">
                <Resources
                  kind="course"
                  target={row.id}
                  editable={owner && row.state === "draft"}
                />
              </section>
            )}
            {owner && (
              <div className="actions">
                <Link
                  className="button secondary"
                  to={"/quizzes/new?course=" + row.id}
                >
                  Create course quiz
                </Link>
                {user.role === "provider" && (
                  <Link className="button secondary" to="/provider">
                    Commercial terms
                  </Link>
                )}
              </div>
            )}
            {row.quizzes?.length > 0 && (
              <section className="panel inset">
                <h2>Course assessments</h2>
                {row.quizzes.map((q) => (
                  <div className="line-item" key={q.id}>
                    <Link className="text-link" to={"/quizzes/" + q.id}>
                      {q.title}
                    </Link>
                    <Status>{q.state}</Status>
                  </div>
                ))}
              </section>
            )}
            <section className="panel inset">
              <h2>Lessons</h2>
              {row.lessons.length ? (
                row.lessons.map((lesson) => (
                  <details className="record" key={lesson.id}>
                    <summary>
                      {lesson.module} · {lesson.title}{" "}
                      {Boolean(lesson.done) && <Status>complete</Status>}
                    </summary>
                    {lesson.body ? (
                      <>
                        <p className="prose">{lesson.body}</p>
                        <Resources
                          kind="lesson"
                          target={lesson.id}
                          editable={owner && row.state === "draft"}
                        />
                        {user.role === "student" && !lesson.done && (
                          <Action
                            path={base + "/lessons/" + lesson.id + "/complete"}
                            title="Mark complete"
                            className=""
                          />
                        )}
                      </>
                    ) : (
                      <p>Enroll to open this lesson.</p>
                    )}
                  </details>
                ))
              ) : (
                <Empty>No lessons yet.</Empty>
              )}
              {owner && row.state === "draft" && (
                <Form
                  reset
                  fields={[
                    { name: "module", label: "Module name", max: 100 },
                    { name: "title", label: "Lesson title", min: 4, max: 120 },
                    {
                      name: "body",
                      label: "Lesson content",
                      type: "textarea",
                      min: 10,
                      max: 18000,
                    },
                  ]}
                  submit="Add lesson"
                  onSubmit={(body) =>
                    mutation.mutateAsync({ path: base + "/lessons", body })
                  }
                />
              )}
            </section>
          </>
        );
      }}
    </Result>
  );
}
