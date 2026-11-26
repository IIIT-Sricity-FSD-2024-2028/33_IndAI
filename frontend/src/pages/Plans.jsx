import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import { paymentActions } from "../redux/slices/paymentSlice.js";
import { date, rupees, useResource, useAction } from "../hooks/api.js";
import {
  Action,
  Empty,
  ErrorText,
  Heading,
  Result,
  Status,
} from "../components/Common.jsx";

const plans = [
  [
    "basic",
    "Free",
    [
      "Paper trading and watchlists",
      "Portfolio and trading journal",
      "Introductory lessons",
    ],
  ],
  [
    "pro",
    "Pro",
    [
      "Everything in Free",
      "Subscription course catalog",
      "One course provider request",
      "Learning plans and milestones",
    ],
  ],
  ["plus", "Plus", ["Everything in Pro", "One instructor request"]],
];
let script;
function checkoutScript() {
  if (window.Razorpay) return Promise.resolve();
  if (!script)
    script = new Promise((resolve, reject) => {
      const asset = document.createElement("script");
      asset.src = "https://checkout.razorpay.com/v1/checkout.js";
      asset.onload = resolve;
      asset.onerror = () => {
        script = null;
        asset.remove();
        reject(Error("Razorpay checkout could not load."));
      };
      document.head.append(asset);
    });
  return script;
}
export function Plans() {
  const user = useOutletContext();
  const query = useResource("/plans", {
    staleTime: 0,
    refetchOnMount: "always",
  });
  const dispatch = useDispatch();
  const action = useAction();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const post = (path, body) => action.mutateAsync({ path, body });
  const refresh = () => {
    dispatch(paymentActions.invalidate());
    return query.refetch();
  };
  async function purchase(plan, provider, upgradeTiming) {
    const confirmation = upgradeTiming
      ? "Upgrade to Plus? " +
        upgradeTiming +
        (provider === "demo"
          ? " This is a simulation. No payment will be charged."
          : "")
      : provider === "demo"
        ? "Simulate a 30-day plan purchase? No payment will be charged."
        : null;
    if (confirmation && !window.confirm(confirmation)) return;
    setBusy(plan);
    setError(null);
    setMessage("");
    try {
      const order = await post("/payments", { plan, provider });
      if (provider === "demo") {
        await post("/payments/" + order.id + "/demo");
        setMessage("Simulated payment confirmed.");
      } else {
        await checkoutScript();
        await new Promise((resolve, reject) => {
          const widget = new window.Razorpay({
            key: order.key,
            order_id: order.order,
            amount: order.amount,
            currency: "INR",
            name: "IndAI",
            description: plan.toUpperCase() + " · 30-day access",
            prefill: { email: user.email, name: user.name },
            handler: async (receipt) => {
              try {
                await post("/payments/" + order.id + "/reconcile", {
                  payment: receipt.razorpay_payment_id,
                  signature: receipt.razorpay_signature,
                });
                setMessage("Payment confirmed.");
                resolve();
              } catch (e) {
                reject(e);
              }
            },
            modal: {
              ondismiss: () => {
                setMessage(
                  "Checkout closed. You can reconcile an existing payment below.",
                );
                resolve();
              },
            },
          });
          widget.open();
        });
      }
    } catch (e) {
      setError(e);
    } finally {
      await refresh();
      setBusy("");
    }
  }
  return (
    <>
      <Heading
        title="Plans & billing"
        detail="Compare access and review your payment history."
      />
      <Result query={query}>
        {(data) => {
          const currentPlan = data.current?.plan ?? "basic";
          const paidThrough = data.current?.ends
            ? date(data.current.ends) + " IST"
            : null;
          const upgradeTiming =
            "Plus starts after your current Pro term ends" +
            (paidThrough ? " on " + paidThrough : "") +
            ".";
          const checkoutDisabled =
            Boolean(busy) || query.isFetching || query.isError;
          return (
            <>
              <div className="panel inset line-item">
                <div>
                  <h2>Current access</h2>
                  <p>
                    {data.current
                      ? paidThrough
                        ? "Paid through " + paidThrough
                        : "Your paid term is active."
                      : "Free access starts after application approval."}
                  </p>
                </div>
                <Status>{currentPlan}</Status>
              </div>
              {data.scheduled.map((term) => (
                <div className="notice" key={term.id}>
                  Scheduled {term.plan.toUpperCase()} term begins{" "}
                  {date(term.starts)} IST.
                </div>
              ))}
              <div className="plans">
                {plans.map(([key, title, features]) => {
                  const upgrade = currentPlan === "pro" && key === "plus";
                  const canPurchase =
                    data.scheduled.length === 0 &&
                    (upgrade || (currentPlan === "basic" && key !== "basic"));
                  const timing = upgrade ? upgradeTiming : null;
                  return (
                    <section className="panel plan-card" key={key}>
                      <h2>{title}</h2>
                      <div className="plan-price">
                        {key === "basic"
                          ? "Free"
                          : data.prices[key]
                            ? rupees(data.prices[key], 0)
                            : "Price unavailable"}
                        {key !== "basic" && data.prices[key] > 0 && (
                          <small> / 30 days</small>
                        )}
                      </div>
                      <ul>
                        {features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                      {key === currentPlan && <Status>Current plan</Status>}
                      {canPurchase && (
                        <>
                          {timing && <p className="muted">{timing}</p>}
                          <div className="actions">
                            {data.demo && (
                              <button
                                className="button"
                                disabled={checkoutDisabled || !data.prices[key]}
                                onClick={() => purchase(key, "demo", timing)}
                              >
                                {busy === key
                                  ? "Working…"
                                  : upgrade
                                    ? "Upgrade to Plus"
                                    : "Simulate " + title}
                              </button>
                            )}
                            {data.live && (
                              <button
                                className="button secondary"
                                disabled={checkoutDisabled || !data.prices[key]}
                                onClick={() =>
                                  purchase(key, "razorpay", timing)
                                }
                              >
                                {upgrade
                                  ? "Upgrade to Plus with Razorpay"
                                  : "Pay with Razorpay"}
                              </button>
                            )}
                            {!data.live && !data.demo && (
                              <p className="muted">Checkout is unconfigured.</p>
                            )}
                          </div>
                        </>
                      )}
                    </section>
                  );
                })}
              </div>
              <ErrorText error={error} />
              {message && (
                <div className="notice" role="status">
                  {message}
                </div>
              )}
              <section className="panel inset">
                <h2>Payment history</h2>
                {data.payments.length ? (
                  data.payments.map((payment) => (
                    <div className="line-item" key={payment.id}>
                      <div>
                        <strong>
                          #{payment.id} · {payment.plan.toUpperCase()} ·{" "}
                          {rupees(payment.amount)}
                        </strong>
                        <p>
                          {payment.provider === "demo"
                            ? "Simulated checkout"
                            : "Razorpay"}{" "}
                          · {date(payment.created)} IST
                        </p>
                      </div>
                      <div className="actions">
                        <Status>{payment.status}</Status>
                        {payment.status === "pending" &&
                          (payment.provider === "razorpay" ? (
                            <Action
                              path={"/payments/" + payment.id + "/reconcile"}
                              title="Reconcile"
                            />
                          ) : (
                            <Action
                              path={"/payments/" + payment.id + "/discard-demo"}
                              title="Discard demo checkout"
                            />
                          ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty>No payments yet.</Empty>
                )}
                {data.refunds.map((refund) => (
                  <div className="line-item" key={refund.id}>
                    <span>
                      Refund · Payment #{refund.payment} ·{" "}
                      {rupees(refund.amount)}
                    </span>
                    <Status>{refund.state}</Status>
                  </div>
                ))}
              </section>
              <p className="muted">
                Paid terms are prepaid. If you purchase another plan while a
                term is active, the new term starts at the current paid-through
                time.
              </p>
            </>
          );
        }}
      </Result>
    </>
  );
}
