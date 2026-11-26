import { useState } from "react";
import { useResource } from "../hooks/api.js";
import { Empty, Pager, Result } from "./Common.jsx";
import { QuizAttempt } from "./QuizAttempt.jsx";

export function QuizAttempts({ quizId }) {
  const [page, setPage] = useState(0);
  const query = useResource("/quizzes/" + quizId + "/attempts?page=" + page);
  return (
    <section className="panel inset">
      <h2>Learner responses</h2>
      <Result query={query}>
        {(rows) => (
          <>
            {rows.length ? (
              rows.map((row) => (
                <QuizAttempt
                  key={row.id + ":" + row.state + ":" + row.score}
                  attempt={row}
                />
              ))
            ) : (
              <Empty>No submissions yet.</Empty>
            )}
            {(page > 0 || rows.length === 25) && (
              <Pager page={page} setPage={setPage} more={rows.length === 25} />
            )}
          </>
        )}
      </Result>
    </section>
  );
}
