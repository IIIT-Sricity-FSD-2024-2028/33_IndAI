import { useState } from "react";
import {
  Link,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { date, useResource } from "../hooks/api.js";
import {
  Action,
  Empty,
  Heading,
  Pager,
  Result,
  Status,
} from "../components/Common.jsx";
import { Resources } from "../components/Resources.jsx";
import { QuizBuilderForm } from "../components/QuizBuilderForm.jsx";
import { QuizResponse } from "../components/QuizResponse.jsx";
import { QuizAttempts } from "../components/QuizAttempts.jsx";

export function Quizzes() {
  const user = useOutletContext();
  const [page, setPage] = useState(0);
  const query = useResource("/quizzes?page=" + page);
  return (
    <>
      <Heading
        title="Quizzes"
        detail={
          user.role === "student"
            ? "Complete assessments and review your feedback."
            : "Create assessments and review learner responses."
        }
      >
        {["instructor", "provider"].includes(user.role) && (
          <Link className="button" to="/quizzes/new">
            Create quiz
          </Link>
        )}
      </Heading>
      <Result query={query}>
        {(rows) => (
          <>
            {rows.length ? (
              <div className="catalog">
                {rows.map((q) => (
                  <article className="panel inset" key={q.id}>
                    <div className="actions">
                      <Status>{q.state}</Status>
                      {q.attempt && <Status>{q.attempt.state}</Status>}
                    </div>
                    <h2>{q.title}</h2>
                    <p>{q.description}</p>
                    <small>
                      {q.questionCount} questions
                      {q.due ? " · Due " + date(q.due) + " IST" : ""}
                    </small>
                    {q.attempt && (
                      <p>
                        {q.attempt.state === "graded"
                          ? "Final score"
                          : "Score so far"}{" "}
                        {q.attempt.score}/{q.attempt.maximum}
                      </p>
                    )}
                    <Link className="button secondary" to={"/quizzes/" + q.id}>
                      {user.role === "student"
                        ? q.attempt
                          ? "View result"
                          : "Open quiz"
                        : "Manage quiz"}
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <Empty>No quizzes available.</Empty>
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
export function QuizBuilder() {
  const { id } = useParams();
  const user = useOutletContext();
  const [params] = useSearchParams();
  const existing = useResource(id ? "/quizzes/" + id : null);
  const courses = useResource("/courses?page=0");
  const learners = useResource(
    user.role === "instructor" ? "/teaching/learners" : null,
  );
  if (id)
    return (
      <Result query={existing}>
        {(quiz) =>
          quiz.manager && quiz.state === "draft" ? (
            <QuizBuilderForm
              key={id}
              initial={quiz}
              courses={courses.data || []}
              learners={learners.data || []}
              user={user}
            />
          ) : (
            <Empty>This quiz is unavailable for editing.</Empty>
          )
        }
      </Result>
    );
  return (
    <QuizBuilderForm
      user={user}
      courses={courses.data || []}
      learners={learners.data || []}
      courseId={params.get("course")}
      assignmentId={params.get("assignment")}
    />
  );
}
export function Quiz() {
  const { id } = useParams();
  const query = useResource("/quizzes/" + id);
  const user = useOutletContext();
  return (
    <Result query={query}>
      {(quiz) => (
        <>
          <Heading title={quiz.title} detail={quiz.description}>
            <Link className="button secondary" to="/quizzes">
              All quizzes
            </Link>
          </Heading>
          <div className="actions">
            <Status>{quiz.state}</Status>
            {quiz.due && <small>Due {date(quiz.due)} IST</small>}
          </div>
          {quiz.manager ? (
            <>
              <section className="panel inset">
                <h2>Questions</h2>
                {quiz.questions.map((q, i) => (
                  <article className="record" key={q.id}>
                    <h3>
                      {i + 1}. {q.prompt}
                    </h3>
                    <small>
                      {q.kind} · {q.points} points
                    </small>
                    {q.options && (
                      <ul>
                        {q.options.map((o, index) => (
                          <li key={index}>
                            {o}
                            {index === q.correct ? " · Correct answer" : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
                {quiz.owner === user.id && (
                  <div className="actions">
                    {quiz.state === "draft" && (
                      <>
                        <Link
                          className="button secondary"
                          to={"/quizzes/" + quiz.id + "/edit"}
                        >
                          Edit draft
                        </Link>
                        <Action
                          title="Publish quiz"
                          path={"/quizzes/" + quiz.id + "/publish"}
                          confirm="Publish this quiz and open submissions?"
                          className=""
                        />
                      </>
                    )}
                    {quiz.state === "published" && (
                      <Action
                        title="Archive quiz"
                        path={"/quizzes/" + quiz.id + "/archive"}
                        confirm="Close this quiz to new submissions?"
                      />
                    )}
                  </div>
                )}
              </section>
              <Resources
                kind="quiz"
                target={quiz.id}
                editable={quiz.owner === user.id && quiz.state === "draft"}
              />
              {quiz.canReviewAttempts && <QuizAttempts quizId={quiz.id} />}
            </>
          ) : (
            <>
              <Resources kind="quiz" target={quiz.id} />
              <QuizResponse key={quiz.id} quiz={quiz} />
            </>
          )}
        </>
      )}
    </Result>
  );
}
