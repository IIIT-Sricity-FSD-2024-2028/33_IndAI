import { date, useAction } from "../hooks/api.js";
import { Form } from "./Common.jsx";

export function QuizAttempt({ attempt }) {
  const action = useAction();
  const written = attempt.answers.filter((a) => a.kind !== "mcq");
  return (
    <details className="record">
      <summary>
        {attempt.name} · {attempt.score}/{attempt.maximum} · {attempt.state}
      </summary>
      <small>Submitted {date(attempt.created)} IST</small>
      {attempt.answers.map((a) => (
        <article className="record" key={a.question}>
          <h3>{a.prompt}</h3>
          <p className="prose">
            {a.kind === "mcq"
              ? a.answer !== ""
                ? JSON.parse(a.options || "[]")[Number(a.answer)] || "No answer"
                : "No answer"
              : a.answer || "No answer"}
          </p>
          <small>
            {a.score ?? "Awaiting review"}/{a.points} points
          </small>
          {a.feedback && <p>{a.feedback}</p>}
        </article>
      ))}
      {written.length > 0 && (
        <Form
          fields={written.flatMap((a) => [
            {
              name: "score-" + a.question,
              label: "Points for " + a.prompt,
              type: "number",
              min: 0,
              max: a.points,
            },
            {
              name: "feedback-" + a.question,
              label: "Feedback for " + a.prompt,
              type: "textarea",
              max: 2000,
              required: false,
            },
          ])}
          initial={Object.fromEntries(
            written.flatMap((a) => [
              ["score-" + a.question, a.score ?? 0],
              ["feedback-" + a.question, a.feedback || ""],
            ]),
          )}
          submit="Save grades"
          onSubmit={(body) =>
            action.mutateAsync({
              path: "/quiz-attempts/" + attempt.id + "/grade",
              body: {
                grades: written.map((a) => ({
                  question: a.question,
                  score: Number(body["score-" + a.question]),
                  feedback: body["feedback-" + a.question] || "",
                })),
              },
            })
          }
        />
      )}
    </details>
  );
}
