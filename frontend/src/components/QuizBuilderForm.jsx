import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAction, date } from "../hooks/api.js";
import { ErrorText, Heading } from "./Common.jsx";

const newQuestion = () => ({
  key: crypto.randomUUID(),
  kind: "mcq",
  prompt: "",
  options: ["", "", ""],
  correct: 0,
  points: 1,
  required: true,
});

export function QuizBuilderForm({
  user,
  courses,
  learners,
  courseId,
  assignmentId,
  initial,
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [questions, setQuestions] = useState(
    initial?.questions.map((q) => ({
      ...q,
      key: q.id,
      options: q.options || [],
      required: Boolean(q.required),
    })) || [newQuestion()],
  );
  const [scope, setScope] = useState(
    initial?.course
      ? "course"
      : initial?.assignment
        ? "assignment"
        : courseId
          ? "course"
          : assignmentId
            ? "assignment"
            : user.role === "provider"
              ? "course"
              : "learners",
  );
  const [target, setTarget] = useState(
    String(
      initial?.course || initial?.assignment || courseId || assignmentId || "",
    ),
  );
  const [recipients, setRecipients] = useState([]);
  const [due, setDue] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const action = useAction();
  const update = (index, changes) =>
    setQuestions((items) =>
      items.map((q, i) => (i === index ? { ...q, ...changes } : q)),
    );
  async function save(event) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const body = {
      title,
      description,
      questions: questions.map((q) => ({
        kind: q.kind,
        prompt: q.prompt,
        points: Number(q.points),
        required: q.required,
        ...(q.kind === "mcq"
          ? { options: q.options, correct: Number(q.correct) }
          : {}),
      })),
      ...(due
        ? { due: new Date(due).getTime() }
        : initial?.due
          ? { due: initial.due }
          : {}),
    };
    if (!initial) {
      if (scope === "course") body.course = Number(target);
      else if (scope === "assignment") body.assignment = Number(target);
      else body.recipients = recipients;
    }
    try {
      const result = await action.mutateAsync({
        path: initial ? "/quizzes/" + initial.id : "/quizzes",
        method: initial ? "PUT" : "POST",
        body,
      });

      navigate("/quizzes/" + (initial?.id || result.id));
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title={initial ? "Edit quiz" : "Create a quiz"}
        detail="Add multiple-choice, short-answer, and long-answer questions."
      />
      <form className="quiz-builder" onSubmit={save}>
        <section className="panel inset">
          <div className="form">
            <label>
              Quiz title
              <input
                required
                minLength="4"
                maxLength="120"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                maxLength="2000"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            {!initial && (
              <>
                <label>
                  Audience
                  <select
                    value={scope}
                    onChange={(e) => {
                      setScope(e.target.value);
                      setTarget("");
                    }}
                  >
                    {user.role === "instructor" && (
                      <option value="learners">Selected active learners</option>
                    )}
                    <option value="course">An owned course</option>
                    {assignmentId && (
                      <option value="assignment">Linked assignment</option>
                    )}
                  </select>
                </label>
                {scope === "course" && (
                  <label>
                    Course
                    <select
                      required
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                    >
                      <option value="">Select a course</option>
                      {courses
                        .filter(
                          (c) => c.owner === user.id && c.state !== "archived",
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                {scope === "assignment" && (
                  <p>Linked to assignment #{target}.</p>
                )}
                {scope === "learners" && (
                  <fieldset>
                    <legend>Recipients</legend>
                    {learners.length ? (
                      learners.map((l) => (
                        <label className="check-label" key={l.id}>
                          <input
                            type="checkbox"
                            checked={recipients.includes(l.id)}
                            onChange={(e) =>
                              setRecipients((ids) =>
                                e.target.checked
                                  ? [...ids, l.id]
                                  : ids.filter((x) => x !== l.id),
                              )
                            }
                          />
                          {l.name}
                        </label>
                      ))
                    ) : (
                      <p className="muted">
                        Accept a learner request before creating a standalone
                        quiz.
                      </p>
                    )}
                  </fieldset>
                )}
              </>
            )}
            <label>
              {initial?.due
                ? "New deadline (leave blank to keep " + date(initial.due) + ")"
                : "Deadline (optional)"}
              <input
                type="datetime-local"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </label>
          </div>
        </section>
        {questions.map((q, index) => (
          <section className="panel inset question-editor" key={q.key}>
            <div className="line-item">
              <h2>Question {index + 1}</h2>
              <button
                type="button"
                className="button secondary"
                disabled={questions.length === 1}
                onClick={() =>
                  setQuestions((items) => items.filter((_, i) => i !== index))
                }
              >
                Remove
              </button>
            </div>
            <div className="form">
              <label>
                Question type
                <select
                  value={q.kind}
                  onChange={(e) =>
                    update(index, {
                      kind: e.target.value,
                      ...(e.target.value === "mcq"
                        ? { options: ["", ""], correct: 0 }
                        : { options: [], correct: null }),
                    })
                  }
                >
                  <option value="mcq">Multiple choice</option>
                  <option value="short">Short answer</option>
                  <option value="long">Long answer</option>
                </select>
              </label>
              <label>
                Question
                <textarea
                  required
                  minLength="3"
                  maxLength="2000"
                  value={q.prompt}
                  onChange={(e) => update(index, { prompt: e.target.value })}
                />
              </label>
              {q.kind === "mcq" && (
                <fieldset>
                  <legend>Options · select the correct answer</legend>
                  {q.options.map((value, option) => (
                    <div className="option-editor" key={option}>
                      <label className="radio-label">
                        <input
                          type="radio"
                          aria-label={
                            "Correct answer option " +
                            (option + 1) +
                            " for question " +
                            (index + 1)
                          }
                          name={"correct-" + q.key}
                          checked={Number(q.correct) === option}
                          onChange={() => update(index, { correct: option })}
                        />
                      </label>
                      <input
                        aria-label={
                          "Option " +
                          (option + 1) +
                          " for question " +
                          (index + 1)
                        }
                        required
                        maxLength="500"
                        value={value}
                        onChange={(e) =>
                          update(index, {
                            options: q.options.map((v, i) =>
                              i === option ? e.target.value : v,
                            ),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={"Remove option " + (option + 1)}
                        disabled={q.options.length <= 2}
                        onClick={() =>
                          update(index, {
                            options: q.options.filter((_, i) => i !== option),
                            correct: 0,
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="button secondary"
                    disabled={q.options.length >= 10}
                    onClick={() =>
                      update(index, { options: [...q.options, ""] })
                    }
                  >
                    Add option
                  </button>
                </fieldset>
              )}
              <div className="question-settings">
                <label>
                  Points
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={q.points}
                    onChange={(e) => update(index, { points: e.target.value })}
                  />
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) =>
                      update(index, { required: e.target.checked })
                    }
                  />
                  Required
                </label>
              </div>
            </div>
          </section>
        ))}
        <ErrorText error={error} />
        <div className="actions">
          <button
            type="button"
            className="button secondary"
            disabled={questions.length >= 50 || busy}
            onClick={() => setQuestions((items) => [...items, newQuestion()])}
          >
            Add question
          </button>
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save draft quiz"}
          </button>
        </div>
      </form>
    </>
  );
}
