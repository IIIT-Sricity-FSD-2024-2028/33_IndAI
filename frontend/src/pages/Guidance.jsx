import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { date, useAction, useResource } from "../hooks/api.js";
import {
  Action,
  Empty,
  Form,
  Heading,
  Pager,
  Result,
  Status,
} from "../components/Common.jsx";

function Directory({ kind }) {
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const query = useResource(
    "/staff?kind=" +
      kind +
      "&page=" +
      page +
      "&search=" +
      encodeURIComponent(search),
  );
  const send = useAction();
  function applySearch(value) {
    setSearch(value.trim());
    setPage(0);
    setTarget(null);
  }
  return (
    <section className="panel inset">
      <h2 className="capitalize">{kind} directory</h2>
      <form
        className="form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          applySearch(input);
        }}
      >
        <label>
          Search {kind === "instructor" ? "instructors" : "course providers"}
          <input
            type="search"
            maxLength={120}
            placeholder="Name, expertise, or language"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="actions">
          <button className="button secondary">Search</button>
          <button
            className="button secondary"
            type="button"
            disabled={!input && !search}
            onClick={() => {
              setInput("");
              applySearch("");
            }}
          >
            Clear search
          </button>
        </div>
      </form>
      <Result query={query}>
        {(rows) => (
          <>
            {rows.map((person) => (
              <div className="record" key={person.id}>
                <div className="line-item">
                  <div>
                    <strong>{person.name}</strong>
                    <p>
                      {person.expertise} · {person.languages}
                    </p>
                    <small>
                      {person.capacity - person.used} of {person.capacity} slots
                      available
                    </small>
                  </div>
                  <button
                    className="button secondary"
                    disabled={person.used >= person.capacity}
                    onClick={() =>
                      setTarget(target === person.id ? null : person.id)
                    }
                  >
                    {target === person.id ? "Close" : "Request"}
                  </button>
                </div>
                {target === person.id && (
                  <Form
                    fields={[
                      {
                        name: "goal",
                        label: "Your learning goals",
                        type: "textarea",
                        min: 5,
                        max: 1000,
                      },
                    ]}
                    submit="Send request"
                    onSubmit={async (body) => {
                      await send.mutateAsync({
                        path: "/guidance",
                        body: { ...body, kind, staff: person.id },
                      });
                      setTarget(null);
                    }}
                  />
                )}
              </div>
            ))}
            {!rows.length && (
              <Empty>
                {search
                  ? "No specialists match your search. Try a different name, expertise, or language."
                  : "No specialists are available."}
              </Empty>
            )}
            {(page > 0 || rows.length === 30) && (
              <Pager page={page} setPage={setPage} more={rows.length === 30} />
            )}
          </>
        )}
      </Result>
    </section>
  );
}
export function Guidance() {
  const user = useOutletContext();
  const [selectedKind, setKind] = useState(null);
  const [page, setPage] = useState(0);
  const query = useResource("/guidance?page=" + page);
  const learner = user.role === "student";
  const kind =
    selectedKind ?? (user.plan === "plus" ? "instructor" : "provider");
  const unlocked =
    kind === "instructor"
      ? user.plan === "plus"
      : ["pro", "plus"].includes(user.plan);
  return (
    <>
      <Heading
        title={learner ? "Guidance" : "Learner requests"}
        detail={
          learner
            ? "Choose a specialist and track your requests."
            : "Review requests and manage your active learners."
        }
      />
      {learner && (
        <div className="segments">
          {["instructor", "provider"].map((option) => (
            <button
              key={option}
              aria-pressed={kind === option}
              onClick={() => setKind(option)}
              className="capitalize"
            >
              {option}
            </button>
          ))}
        </div>
      )}
      <div className={learner && unlocked ? "overview-grid" : ""}>
        <section className="panel inset">
          <h2>{learner ? "Your requests" : "Request queue"}</h2>
          <Result query={query}>
            {(rows) => (
              <>
                {rows.filter((row) => !learner || row.kind === kind).length ? (
                  rows
                    .filter((row) => !learner || row.kind === kind)
                    .map((row) => (
                      <article className="record" key={row.id}>
                        <div className="line-item">
                          <div>
                            <strong>
                              {learner ? row.staff_name : row.student_name}
                            </strong>
                            <p>{row.goal}</p>
                            {row.state === "pending" && (
                              <small>
                                Response due {date(row.expires)} IST
                              </small>
                            )}
                            {row.reason && <small>{row.reason}</small>}
                          </div>
                          <Status>{row.state}</Status>
                        </div>
                        <div className="actions">
                          {row.state === "pending" &&
                            (learner ? (
                              <Action
                                path={"/guidance/" + row.id + "/decision"}
                                body={{ action: "cancel" }}
                                title="Cancel request"
                                confirm="Cancel this guidance request?"
                              />
                            ) : (
                              <>
                                <Action
                                  path={"/guidance/" + row.id + "/decision"}
                                  body={{ action: "accept" }}
                                  title="Accept"
                                  className=""
                                />
                                <Action
                                  path={"/guidance/" + row.id + "/decision"}
                                  body={{ action: "decline" }}
                                  title="Decline"
                                  confirm="Decline this request?"
                                />
                              </>
                            ))}
                          {row.state === "active" && (
                            <>
                              <Link className="button secondary" to="/tasks">
                                Learning tasks
                              </Link>
                              <Action
                                path={"/guidance/" + row.id + "/decision"}
                                body={{ action: "end" }}
                                title="End relationship"
                                confirm="End this active guidance relationship?"
                              />
                            </>
                          )}
                        </div>
                      </article>
                    ))
                ) : (
                  <Empty>No requests to show.</Empty>
                )}
                {(page > 0 || rows.length === 30) && (
                  <Pager
                    page={page}
                    setPage={setPage}
                    more={rows.length === 30}
                  />
                )}
              </>
            )}
          </Result>
        </section>
        {learner &&
          (unlocked ? (
            <Directory key={kind} kind={kind} />
          ) : (
            <div className="notice">
              This feature requires{" "}
              {kind === "instructor" ? "Plus" : "Pro or Plus"}.{" "}
              <Link className="text-link" to="/plans">
                Compare plans
              </Link>
            </div>
          ))}
      </div>
    </>
  );
}
