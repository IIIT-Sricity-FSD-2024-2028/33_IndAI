import { useState } from "react";

import { useAction } from "../hooks/api.js";
import { ErrorText } from "./Common.jsx";

export function QuizResponse({ quiz }) {
  const [answers, setAnswers] = useState(quiz.draft || {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const action = useAction();
  const closed =
    quiz.state !== "published" || (quiz.due && quiz.due <= Date.now());
  async function send(final) {
    if (busy) return;
    if (
      final &&
      !window.confirm("Submit this quiz? Your answers will be final.")
    )
      return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await action.mutateAsync({
        path: "/quizzes/" + quiz.id + (final ? "/submit" : "/draft"),
        method: final ? "POST" : "PUT",
        body: { answers },
      });
      setSaved(!final);
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }
  if (quiz.attempt)
    return (
      <section className="panel inset">
        <h2>
          {quiz.attempt.state === "graded"
            ? "Quiz result"
            : "Submitted for review"}
        </h2>
        <p>
          {quiz.attempt.state === "graded" ? "Final score" : "Score so far"}{" "}
          {quiz.attempt.score}/{quiz.attempt.maximum}
        </p>
        {quiz.questions.map((q, index) => {
          const answer = quiz.attempt.answers.find((a) => a.question === q.id);
          return (
            <article key={q.id} className="record">
              <h3>
                {index + 1}. {q.prompt}
              </h3>
              <p className="prose">
                {q.kind === "mcq"
                  ? answer?.answer !== ""
                    ? q.options[Number(answer?.answer)] || "No answer"
                    : "No answer"
                  : answer?.answer || "No answer"}
              </p>
              <small>
                {answer?.score == null
                  ? "Awaiting review"
                  : answer.score + "/" + q.points + " points"}
              </small>
              {answer?.feedback && <p className="prose">{answer.feedback}</p>}
            </article>
          );
        })}
      </section>
    );
  return (
    <form
      className="quiz-response"
      onSubmit={(e) => {
        e.preventDefault();
        send(true);
      }}
    >
      {closed && <div className="notice">This quiz is closed.</div>}
      <p className="muted">
        {quiz.questions.filter((q) => answers[q.id]?.trim()).length} of{" "}
        {quiz.questions.length} questions answered.
      </p>
      {quiz.questions.map((q, index) => (
        <fieldset key={q.id} className="panel inset">
          <legend>
            {index + 1}. {q.prompt} {q.required ? "*" : ""}
          </legend>
          <small>
            {q.points} points ·{" "}
            {q.kind === "mcq"
              ? "Choose one answer"
              : q.kind === "short"
                ? "Short answer"
                : "Long answer"}
          </small>
          {q.kind === "mcq" ? (
            q.options.map((option, i) => (
              <label className="check-label quiz-option" key={i}>
                <input
                  type="radio"
                  name={"answer-" + q.id}
                  required={Boolean(q.required)}
                  disabled={closed || busy}
                  checked={answers[q.id] === String(i)}
                  onChange={() => {
                    setAnswers((a) => ({ ...a, [q.id]: String(i) }));
                    setSaved(false);
                  }}
                />
                {option}
              </label>
            ))
          ) : (
            <textarea
              aria-label={"Answer question " + (index + 1)}
              rows={q.kind === "short" ? 3 : 7}
              required={Boolean(q.required)}
              maxLength={q.kind === "short" ? 1000 : 10000}
              disabled={closed || busy}
              value={answers[q.id] || ""}
              onChange={(e) => {
                setAnswers((a) => ({ ...a, [q.id]: e.target.value }));
                setSaved(false);
              }}
            />
          )}
        </fieldset>
      ))}
      <ErrorText error={error} />
      {saved && (
        <p className="notice" role="status">
          Draft saved. You can return to it later.
        </p>
      )}
      <div className="actions">
        <button
          className="button secondary"
          type="button"
          disabled={busy || closed}
          onClick={() => send(false)}
        >
          Save draft
        </button>
        <button className="button" disabled={busy || closed}>
          {busy ? "Saving…" : "Submit quiz"}
        </button>
      </div>
    </form>
  );
}
