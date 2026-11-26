import { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchNotifications } from "../redux/slices/notificationSlice.js";
import { resourceKey } from "../redux/routes.js";
import {
  Link,
  Navigate,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
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

export function Notifications() {
  const user = useOutletContext();
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const query = useResource("/notifications?page=" + page, {
    refetchInterval: 15000,
  });
  const unread = useResource("/notifications/unread", {
    refetchInterval: 15000,
  });
  return (
    <>
      <Heading title="Notifications">
        {unread.data?.count > 0 && (
          <Action path="/notifications/read-all" title="Mark all as read" />
        )}
      </Heading>
      <section className="panel inset">
        <Result query={query}>
          {({ items, more }) => (
            <>
              {items.length ? (
                items.map((row) => (
                  <article className="record" key={row.id}>
                    <strong>{row.title}</strong>
                    <small>
                      {row.source} ·{" "}
                      <time dateTime={new Date(row.created).toISOString()}>
                        {date(row.created)} IST
                      </time>
                    </small>
                    <p className="prose">{row.message}</p>
                    <div className="actions">
                      <Action
                        path={"/notifications/" + row.id + "/open"}
                        title="Open notification"
                        onDone={({ destination }) => {
                          if (destination) navigate(destination);
                        }}
                      />
                      {row.read ? (
                        <Status>read</Status>
                      ) : (
                        <Action
                          path={"/notifications/" + row.id + "/read"}
                          title="Mark as read"
                        />
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <Empty>
                  {page
                    ? "No notifications on this page."
                    : "No notifications yet."}
                </Empty>
              )}
              {(page > 0 || more) && (
                <Pager page={page} setPage={setPage} more={more} />
              )}
            </>
          )}
        </Result>
      </section>
    </>
  );
}

const audiences = [
  { value: "instructors", label: "Active instructors" },
  { value: "providers", label: "Active course providers" },
  { value: "both", label: "Active instructors and course providers" },
];
function Broadcast() {
  const dispatch = useDispatch();
  const send = useAction();
  const [feedback, setFeedback] = useState("");
  return (
    <section className="panel inset narrow">
      <h2>Send a notification</h2>
      <Form
        submit="Review recipients"
        fields={[
          { name: "audience", label: "Audience", options: audiences },
          { name: "title", label: "Title", max: 120 },
          { name: "message", label: "Message", type: "textarea", max: 4000 },
        ]}
        onSubmit={async (body) => {
          setFeedback("");
          const {
            data: { count },
          } = await dispatch(
            fetchNotifications({
              path: resourceKey(
                "/admin/notifications/preview?audience=" +
                  encodeURIComponent(body.audience),
              ),
              force: true,
            }),
          ).unwrap();
          if (!count) {
            setFeedback("There are no eligible recipients in this audience.");
            return;
          }
          const label = audiences.find(
            ({ value }) => value === body.audience,
          ).label;
          if (
            !window.confirm(
              label +
                " · Estimated recipients: " +
                count +
                ". Send this notification?",
            )
          )
            return;
          await send.mutateAsync({
            path: "/admin/notifications",
            body: { ...body, confirmedCount: count },
          });
          setFeedback("sent");
        }}
      />
      <p role="status">
        {feedback === "sent"
          ? "Notification sent to " +
            (send.data?.count ?? 0) +
            " " +
            (send.data?.count === 1 ? "recipient." : "recipients.")
          : feedback}
      </p>
    </section>
  );
}
export function Support() {
  const user = useOutletContext();
  const [page, setPage] = useState(0);
  const query = useResource("/support?page=" + page);
  const mutation = useAction();
  const navigate = useNavigate();
  if (["admin", "superadmin"].includes(user.role))
    return <Navigate to="/admin?queue=support" replace />;
  return (
    <>
      <Heading
        title="Help & support"
        detail="Create a ticket and follow the conversation here."
      />
      <div className="overview-grid">
        <section className="panel inset">
          <h2>New ticket</h2>
          <Form
            fields={[
              { name: "subject", label: "Subject", min: 4, max: 120 },
              {
                name: "body",
                label: "How can we help?",
                type: "textarea",
                min: 10,
                max: 4000,
              },
            ]}
            submit="Create ticket"
            onSubmit={async (body) => {
              const ticket = await mutation.mutateAsync({
                path: "/support",
                body,
              });
              navigate("/support/" + ticket.id);
            }}
          />
        </section>
        <section className="panel inset">
          <h2>Your tickets</h2>
          <Result query={query}>
            {(rows) => (
              <>
                {rows.length ? (
                  rows.map((row) => (
                    <div className="line-item" key={row.id}>
                      <Link to={"/support/" + row.id} className="text-link">
                        #{row.id} · {row.subject}
                      </Link>
                      <Status>{row.state}</Status>
                    </div>
                  ))
                ) : (
                  <Empty>No tickets yet.</Empty>
                )}
                {(page > 0 || rows.length === 25) && (
                  <Pager
                    page={page}
                    setPage={setPage}
                    more={rows.length === 25}
                  />
                )}
              </>
            )}
          </Result>
        </section>
      </div>
    </>
  );
}
export function Ticket() {
  const { id } = useParams();
  const [page, setPage] = useState(0);
  const query = useResource("/support/" + id + "?page=" + page);
  const mutation = useAction();
  return (
    <Result query={query}>
      {(ticket) => (
        <>
          <Heading title={ticket.subject} detail={"Ticket #" + ticket.id}>
            <Status>{ticket.state}</Status>
          </Heading>
          <section className="panel inset narrow">
            {ticket.replies.map((reply) => (
              <article className="record" key={reply.id}>
                <strong>{reply.name}</strong>
                <small>{date(reply.created)} IST</small>
                <p className="prose">{reply.body}</p>
              </article>
            ))}
            {(page > 0 || ticket.replies.length === 50) && (
              <Pager
                page={page}
                setPage={setPage}
                more={ticket.replies.length === 50}
              />
            )}
            {ticket.state === "open" && (
              <>
                <Form
                  reset
                  fields={[
                    {
                      name: "body",
                      label: "Reply",
                      type: "textarea",
                      min: 2,
                      max: 4000,
                    },
                  ]}
                  submit="Send reply"
                  onSubmit={(body) =>
                    mutation.mutateAsync({
                      path: "/support/" + ticket.id + "/reply",
                      body,
                    })
                  }
                />
                <Action
                  path={"/support/" + ticket.id + "/close"}
                  title="Close ticket"
                  confirm="Close this support ticket?"
                />
              </>
            )}
          </section>
        </>
      )}
    </Result>
  );
}
function Decision({ row }) {
  const mutation = useAction();
  const path = "/admin/applications/" + row.id;
  if (row.state !== "pending") return null;
  return (
    <>
      <Action
        path={path}
        body={{ decision: "approved" }}
        title="Approve"
        confirm={"Approve " + row.name + " for Basic access?"}
      />
      <details>
        <summary>Reject</summary>
        <Form
          fields={[{ name: "reason", label: "Rejection reason", max: 400 }]}
          submit="Reject application"
          onSubmit={(body) =>
            mutation.mutateAsync({
              path,
              body: { ...body, decision: "rejected" },
            })
          }
        />
      </details>
    </>
  );
}
function AdminActions({ row, queue }) {
  const mutation = useAction();
  const reason = [{ name: "reason", label: "Reason", min: 5, max: 400 }];
  if (queue === "users")
    return (
      <>
        <Decision row={row} />
        {row.status === "approved" && (
          <details>
            <summary>Suspend</summary>
            <Form
              fields={reason}
              submit="Suspend learner"
              onSubmit={(body) => {
                if (
                  window.confirm("Suspend " + row.name + " and revoke access?")
                )
                  return mutation.mutateAsync({
                    path: "/admin/users/" + row.student + "/suspend",
                    body,
                  });
              }}
            />
          </details>
        )}
      </>
    );
  if (queue === "staff" && row.role === "admin" && row.status !== "approved")
    return (
      <Link className="text-link" to={"/members/" + row.id}>
        Manage Admin account
      </Link>
    );
  if (queue === "staff" && row.status === "pending")
    return (
      <>
        <Action
          path={"/admin/staff/" + row.id + "/decision"}
          body={{ decision: "approved" }}
          title="Approve staff"
          confirm={"Approve " + row.name + "?"}
        />
        <details>
          <summary>Reject</summary>
          <Form
            fields={reason}
            submit="Reject staff"
            onSubmit={(body) =>
              mutation.mutateAsync({
                path: "/admin/staff/" + row.id + "/decision",
                body: { ...body, decision: "rejected" },
              })
            }
          />
        </details>
      </>
    );
  if (queue === "staff" && row.status === "approved")
    return (
      <details>
        <summary>{row.role === "admin" ? "Suspend Admin" : "Suspend"}</summary>
        <Form
          fields={reason}
          submit={row.role === "admin" ? "Suspend Admin" : "Suspend staff"}
          onSubmit={(body) => {
            if (window.confirm("Suspend " + row.name + " and revoke access?"))
              return mutation.mutateAsync({
                path: "/admin/users/" + row.id + "/suspend",
                body,
              });
          }}
        />
      </details>
    );
  if (queue === "courses")
    return (
      <Link className="text-link" to={"/courses/" + row.id}>
        Review course
      </Link>
    );
  if (queue === "support")
    return (
      <Link className="text-link" to={"/support/" + row.id}>
        Open ticket
      </Link>
    );
  if (
    queue === "payments" &&
    row.provider === "razorpay" &&
    row.status === "captured"
  )
    return (
      <details>
        <summary>Request refund</summary>
        <Form
          fields={reason}
          submit="Request full refund"
          onSubmit={(body) => {
            if (
              window.confirm(
                "Request a full refund of " + rupees(row.amount) + "?",
              )
            )
              return mutation.mutateAsync({
                path: "/admin/payments/" + row.id + "/refund",
                body,
              });
          }}
        />
      </details>
    );
  return null;
}
const titles = {
  users: "Student applications",
  staff: "Staff approvals",
  payments: "Payment records",
  courses: "Course review",
  support: "Support queue",
  audit: "Audit log",
};
export function Admin() {
  const user = useOutletContext();
  const [params, setParams] = useSearchParams();
  if (params.get("queue") === "courses" && user.role !== "superadmin")
    return <Empty>This page is unavailable for your role.</Empty>;
  return <AdminQueues user={user} params={params} setParams={setParams} />;
}
function AdminQueues({ user, params, setParams }) {
  const available = Object.keys(titles).filter(
    (value) =>
      user.role === "superadmin" || !["audit", "courses"].includes(value),
  );
  const queue = available.includes(params.get("queue"))
    ? params.get("queue")
    : available[0];
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const query = useResource(
    "/admin?queue=" +
      queue +
      "&page=" +
      page +
      "&search=" +
      encodeURIComponent(search),
  );
  const action = useAction();
  return (
    <>
      <Heading
        title="Operations"
        detail="Review records in the queues available to your role."
      />
      <Broadcast />
      {available.length > 1 && (
        <div className="segments">
          {available.map((value) => (
            <button
              key={value}
              aria-pressed={value === queue}
              onClick={() => {
                setParams({ queue: value });
                setPage(0);
                setSearch("");
              }}
            >
              {titles[value]}
            </button>
          ))}
        </div>
      )}
      <section className="panel">
        <div className="panel-head">
          <h2>{titles[queue]}</h2>
          <label>
            <span className="sr-only">Search queue</span>
            <input
              maxLength="90"
              placeholder="Search queue"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </label>
        </div>
        <Result query={query}>
          {(rows) => (
            <>
              {rows.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Record</th>
                        <th>Account / reference</th>
                        <th>Status / time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <strong>
                              {row.subject ||
                                row.title ||
                                row.action ||
                                (["users", "staff"].includes(queue)
                                  ? row.name
                                  : row.plan?.toUpperCase())}
                            </strong>
                            <small>
                              #{row.id}{" "}
                              {row.amount ? " · " + rupees(row.amount) : ""}
                            </small>
                          </td>
                          <td>
                            {queue === "audit"
                              ? row.actor_name || "System"
                              : row.email || row.name || row.target}
                            <small>{queue === "audit" ? row.target : ""}</small>
                            <small>
                              {row.note || row.detail || row.expertise}
                            </small>
                          </td>
                          <td>
                            {(row.state || row.status) && (
                              <Status>{row.state || row.status}</Status>
                            )}
                            <small>
                              {row.created ? date(row.created) + " IST" : ""}
                            </small>
                          </td>
                          <td>
                            <AdminActions row={row} queue={queue} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No matching records.</Empty>
              )}
              {(page > 0 || rows.length === 25) && (
                <Pager
                  page={page}
                  setPage={setPage}
                  more={rows.length === 25}
                />
              )}
            </>
          )}
        </Result>
      </section>
      {user.role === "superadmin" && (
        <section className="panel inset narrow">
          <h2>End a guidance relationship</h2>
          <Form
            reset
            fields={[
              {
                name: "id",
                label: "Guidance reference number",
                type: "number",
                min: 1,
              },
              { name: "reason", label: "Intervention reason", max: 400 },
            ]}
            submit="End relationship"
            onSubmit={(body) => {
              if (window.confirm("End this guidance relationship or request?"))
                return action.mutateAsync({
                  path: "/guidance/" + Number(body.id) + "/decision",
                  body: { action: "intervene", reason: body.reason },
                });
            }}
          />
        </section>
      )}
    </>
  );
}
