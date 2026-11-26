import { useRef, useState } from "react";
import { useAction, rupees } from "../hooks/api.js";
import { placeOrder } from "../redux/slices/tradingSlice.js";
import { ErrorText, Status } from "./Common.jsx";

const types = {
  market: "Market",
  limit: "Limit",
  "stop-market": "Stop market",
  "stop-limit": "Stop limit",
};
const paise = (value) => Math.round(Number(value) * 100);
export function OrderTicket({ instrument, account, initialSide = "buy" }) {
  const [side, setSide] = useState(initialSide);
  const [type, setType] = useState("market");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [trigger, setTrigger] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [validity, setValidity] = useState("DAY");
  const request = useRef(null);
  const active = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const action = useAction();
  const outcome = action.data;

  const needPrice = ["limit", "stop-limit"].includes(type);
  const needTrigger = type.startsWith("stop-");
  const estimate =
    (needPrice
      ? paise(price)
      : needTrigger
        ? paise(trigger)
        : instrument.quote?.price) * Number(qty);
  const position = account?.positions.find(
    (p) => p.symbol === instrument.symbol,
  );
  function amountField(label, value, change, required = false) {
    return (
      <label>
        {label}
        <input
          type="number"
          inputMode="decimal"
          required={required}
          step="0.01"
          min="0.01"
          max="1000000"
          value={value}
          onChange={(e) => change(e.target.value)}
        />
      </label>
    );
  }
  async function submit(event) {
    event.preventDefault();
    if (active.current) return;
    active.current = true;
    setSubmitting(true);
    setError(null);
    action.reset();
    const payload = {
      symbol: instrument.symbol,
      side,
      type,
      qty: Number(qty),
      validity,
      ...(needPrice ? { price: paise(price) } : {}),
      ...(needTrigger ? { trigger: paise(trigger) } : {}),
      ...(side === "buy" && sl ? { sl: paise(sl) } : {}),
      ...(side === "buy" && tp ? { tp: paise(tp) } : {}),
    };
    const content = JSON.stringify(payload);
    const clientKey =
      request.current?.content === content
        ? request.current.key
        : crypto.randomUUID();
    request.current = { content, key: clientKey };
    try {
      await action.mutateAsync({
        path: "/trading/orders",
        thunk: placeOrder,
        body: { ...payload, clientKey },
      });
      request.current = null;
    } catch (failure) {
      setError(failure);
    } finally {
      active.current = false;
      setSubmitting(false);
    }
  }
  return (
    <section className="panel order-ticket" id="order-ticket">
      <div className="panel-head">
        <h2>Order ticket</h2>
        <span className="muted">{instrument.symbol}</span>
      </div>
      {instrument.quote?.mode === "replay" && (
        <p className="order-replay-note">
          Historical replay · {instrument.quote.replayDay}. Paper orders use
          recorded prices.
        </p>
      )}
      <div className="side-switch">
        {["buy", "sell"].map((value) => (
          <button
            key={value}
            type="button"
            className={"side-" + value}
            aria-pressed={side === value}
            onClick={() => setSide(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <form className="form" onSubmit={submit}>
        <label>
          Order type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {Object.entries(types).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="100000"
            required
            value={qty}
            onChange={(event) => setQty(event.target.value)}
          />
        </label>
        {needTrigger &&
          amountField("Trigger price (₹)", trigger, setTrigger, true)}
        {needPrice && amountField("Limit price (₹)", price, setPrice, true)}
        {type !== "market" && (
          <label>
            Validity
            <select
              value={validity}
              onChange={(event) => setValidity(event.target.value)}
            >
              <option value="DAY">24 hours</option>
              <option value="GTC">30 days</option>
            </select>
          </label>
        )}
        {side === "buy" && (
          <details>
            <summary>Attach protection</summary>
            <div className="form inset-small">
              {amountField("Stop-loss (₹)", sl, setSl)}
              {amountField("Take-profit (₹)", tp, setTp)}
            </div>
          </details>
        )}
        <div className="ticket-total">
          <div>
            <span>
              {side === "buy" ? "Available paper cash" : "Available shares"}
            </span>
            <strong>
              {side === "buy"
                ? rupees(account?.available)
                : (position?.sellable ?? 0)}
            </strong>
          </div>
          <div>
            <span>Estimated value</span>
            <strong>{rupees(estimate > 0 ? estimate : null)}</strong>
          </div>
          <div>
            <span>Estimated fee</span>
            <strong>
              {rupees(
                estimate > 0 ? Math.max(1, Math.ceil(estimate / 1000)) : null,
              )}
            </strong>
          </div>
        </div>
        <ErrorText error={error} />
        {outcome && (
          <div className="notice" role="status">
            Order #{outcome.id} <Status>{outcome.state}</Status>
            {outcome.reason && <div>{outcome.reason}</div>}
          </div>
        )}
        {!instrument.quote?.executable && (
          <p className="muted">A fresh quote in an open session is required.</p>
        )}
        <button
          className={"button " + (side === "sell" ? "sell-button" : "")}
          disabled={!instrument.quote?.executable || submitting}
        >
          {submitting ? "Submitting…" : "Submit paper " + side}
        </button>
      </form>
    </section>
  );
}
