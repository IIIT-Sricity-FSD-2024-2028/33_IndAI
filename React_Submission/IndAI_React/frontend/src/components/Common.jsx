import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { money } from "../services/api";
export function Card({ title, subtitle, children, actions }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
export function Empty({ children = "No records yet." }) {
  return (
    <div className="empty-state">
      <p>{children}</p>
    </div>
  );
}
export function Stats({ items }) {
  return (
    <>
      {items.map(([label, value, sub, color], i) => (
        <div className="stat-card" key={i}>
          <div className="stat-label">{label}</div>
          <div className={"stat-value " + (color || "")}>{value}</div>
          <div className="stat-sub">{sub}</div>
        </div>
      ))}
    </>
  );
}
export function Table({ heads, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r, i) => (
              <tr key={i}>
                {r.map((v, j) => (
                  <td key={j}>{v}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={heads.length}>
                <Empty />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export function Modal({ title, children, onClose }) {
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("input, select, textarea, button")?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") close.current();
      if (event.key !== "Tab") return;
      const items = [...panel.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')].filter(e => e.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, []);
  return createPortal(
    <div className="modal-overlay active" style={{ display: "flex" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={panel} className="modal-box modal" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="btn btn-secondary btn-sm" style={{ float: "right" }} onClick={onClose}>Close</button>
        <h2 className="modal-title">{title}</h2>
        {children}
      </div>
    </div>, document.body
  );
}
// A reusable controlled form. Values live in React state and flow to the parent on submit.
export function Editor({ fields, initial = {}, onSubmit, submit = "Save" }) {
  const [values, setValues] = useState(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
          await onSubmit(values);
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {fields.map((f) => (
        <div className="form-group" key={f.name}>
          <label className="form-label" htmlFor={"field-" + f.name}>
            {f.label || f.name}
          </label>
          {f.options ? (
            <select
              id={"field-" + f.name}
              required={f.required !== false}
              className="form-select"
              value={values[f.name] ?? ""}
              onChange={(e) =>
                setValues({ ...values, [f.name]: e.target.value })
              }
            >
              <option value="">Choose…</option>
              {f.options.map((o) => (
                <option key={o.value ?? o} value={o.value ?? o}>
                  {o.label ?? o}
                </option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              id={"field-" + f.name}
              className="form-textarea"
              required={f.required !== false}
              value={values[f.name] ?? ""}
              onChange={(e) =>
                setValues({ ...values, [f.name]: e.target.value })
              }
            />
          ) : (
            <input
              id={"field-" + f.name}
              className="form-input"
              type={f.type || "text"}
              min={f.min}
              max={f.max}
              step={f.step || (f.type === "number" ? "any" : undefined)}
              required={f.required !== false}
              value={values[f.name] ?? ""}
              onChange={(e) =>
                setValues({
                  ...values,
                  [f.name]:
                    f.type === "number"
                      ? e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                      : e.target.value,
                })
              }
            />
          )}
        </div>
      ))}
      {error && (
        <p className="alert alert-red" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : submit}
      </button>
    </form>
  );
}
export function Notice({ error }) {
  return error ? (
    <div className="alert alert-red" role="alert">
      {error}
    </div>
  ) : null;
}
export function Holdings({ positions = [], onTrade, busy = false }) {
  return (
    <Table
      heads={["Symbol", "Quantity", "Avg price", "Value", "P&L"]}
      rows={positions.map((p) => [
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"nowrap",width:"max-content",whiteSpace:"nowrap"}}>
          <strong>{p.symbol}</strong>
          {onTrade && <span className="holdings-actions" style={{display:"inline-flex",alignItems:"center",gap:6,flexWrap:"nowrap",flexShrink:0}}>
            <button type="button" className="btn btn-green btn-sm" aria-label={`Buy ${p.symbol}`} disabled={busy} onClick={()=>onTrade(p,"BUY")}>Buy</button>
            <button type="button" className="btn btn-primary btn-sm" aria-label={`Sell ${p.symbol}`} disabled={busy || p.qty<=0} onClick={()=>onTrade(p,"SELL")}>Sell</button>
          </span>}
        </div>,
        p.qty,
        money(p.avg_price),
        money(p.market_value),
        <span className={p.unrealized >= 0 ? "gain" : "loss"}>
          {money(p.unrealized)}
        </span>,
      ])}
    />
  );
}
