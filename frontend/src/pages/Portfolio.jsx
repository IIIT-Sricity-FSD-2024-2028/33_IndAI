import { OrderDialog } from "../components/OrderDialog.jsx";
import { useState } from "react";
import { Link } from "react-router-dom";
import { date, rupees, useAction, useResource } from "../hooks/api.js";
import {
  Empty,
  Form,
  Heading,
  Pager,
  Result,
  Status,
} from "../components/Common.jsx";
import { Orders } from "../components/Orders.jsx";

export function Portfolio() {
  const rawAccount = useResource("/trading/account", { refetchInterval: 2000 });
  const account = rawAccount;
  const [ticket, setTicket] = useState(null);
  const [show, setShow] = useState(false);
  const [ledgerPage, setLedgerPage] = useState(0);
  const ledger = useResource(
    show ? "/trading/ledger?page=" + ledgerPage : null,
  );
  const mutation = useAction();
  return (
    <>
      <Heading
        title="Portfolio"
        detail="Review positions, paper cash, and execution history."
      >
        <button
          className="button"
          onClick={() => setTicket({ symbol: "RELIANCE", side: "buy" })}
        >
          Buy shares
        </button>
      </Heading>
      {ticket && (
        <OrderDialog
          ticket={ticket}
          account={account.data}
          onClose={() => setTicket(null)}
        />
      )}
      <Result query={account}>
        {(data) => (
          <>
            <div className="stats">
              <div>
                <small>Paper cash</small>
                <strong>{rupees(data.cash)}</strong>
                <small>Initial funding {rupees(data.funded, 0)}</small>
              </div>
              <div>
                <small>Reserved cash</small>
                <strong>{rupees(data.reservedCash)}</strong>
              </div>
              <div>
                <small>Available cash</small>
                <strong>{rupees(data.available)}</strong>
              </div>
              <div>
                <small>Equity</small>
                <strong>
                  {rupees(
                    data.positions.every((p) => p.quote?.executable)
                      ? data.cash +
                          data.positions.reduce(
                            (sum, p) => sum + p.qty * p.quote.price,
                            0,
                          )
                      : null,
                  )}
                </strong>
              </div>
            </div>
            <section className="panel">
              <div className="panel-head">
                <h2>Positions</h2>
              </div>
              {data.positions.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Instrument</th>
                        <th>Qty</th>
                        <th>Sellable</th>
                        <th>Average cost</th>
                        <th>Quote</th>
                        <th>Unrealized P&L</th>
                        <th>Trade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.positions.map((row) => {
                        const quote = row.quote;
                        const pnl = quote?.executable
                          ? row.qty * quote.price - row.cost
                          : null;
                        return (
                          <tr key={row.symbol}>
                            <td>
                              <Link
                                className="text-link"
                                to={
                                  "/trading?symbol=" +
                                  encodeURIComponent(row.symbol)
                                }
                              >
                                {row.symbol}
                              </Link>
                            </td>
                            <td>{row.qty}</td>
                            <td>{row.sellable}</td>
                            <td>{rupees(row.cost / row.qty)}</td>
                            <td>
                              {rupees(quote?.price)}{" "}
                              {quote && <Status>{quote.status}</Status>}
                            </td>
                            <td
                              className={
                                pnl > 0
                                  ? "positive"
                                  : pnl < 0
                                    ? "negative"
                                    : undefined
                              }
                            >
                              {pnl > 0 ? "+" : ""}
                              {rupees(pnl)}
                            </td>
                            <td>
                              <div className="actions">
                                <button
                                  className="button secondary"
                                  onClick={() =>
                                    setTicket({
                                      symbol: row.symbol,
                                      side: "buy",
                                    })
                                  }
                                >
                                  Buy
                                </button>
                                <button
                                  className="button secondary"
                                  disabled={!row.sellable}
                                  onClick={() =>
                                    setTicket({
                                      symbol: row.symbol,
                                      side: "sell",
                                    })
                                  }
                                >
                                  Sell
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No positions yet.</Empty>
              )}
            </section>
          </>
        )}
      </Result>
      <Orders />
      <section className="panel inset">
        <div className="line-item">
          <h2>Cash ledger</h2>
          <button className="button secondary" onClick={() => setShow(!show)}>
            {show ? "Hide entries" : "View entries"}
          </button>
        </div>
        {show && (
          <Result query={ledger}>
            {(rows) => (
              <>
                {rows.map((row) => (
                  <div key={row.id} className="line-item">
                    <div>
                      <strong>{row.reason}</strong>
                      <small>{date(row.created)}</small>
                    </div>
                    <div>
                      {rupees(row.delta)} · {rupees(row.balance)} balance
                    </div>
                  </div>
                ))}
                {(ledgerPage > 0 || rows.length === 25) && (
                  <Pager
                    page={ledgerPage}
                    setPage={setLedgerPage}
                    more={rows.length === 25}
                  />
                )}
              </>
            )}
          </Result>
        )}
      </section>
      <details className="panel inset">
        <summary>Reset paper account</summary>
        <p className="muted">
          This closes working orders, clears positions, and restores the
          starting paper balance. The cash ledger retains a record.
        </p>
        <Form
          fields={[
            { name: "confirm", label: "Type RESET PAPER ACCOUNT", max: 19 },
          ]}
          submit="Reset paper account"
          reset
          onSubmit={(body) =>
            mutation.mutateAsync({ path: "/trading/reset", body })
          }
        />
      </details>
    </>
  );
}
export function Journal() {
  const [page, setPage] = useState(0);
  const query = useResource("/trading/journal?page=" + page);
  const mutation = useAction();
  return (
    <>
      <Heading
        title="Trading journal"
        detail="Keep private notes on your practice and decisions."
      />
      <div className="overview-grid">
        <section className="panel inset">
          <h2>New entry</h2>
          <Form
            reset
            fields={[
              { name: "tag", label: "Strategy tag", max: 50 },
              {
                name: "body",
                label: "Notes",
                type: "textarea",
                min: 5,
                max: 4000,
              },
              {
                name: "order",
                label: "Order number (optional)",
                type: "number",
                min: 1,
                required: false,
              },
            ]}
            submit="Save entry"
            onSubmit={(data) =>
              mutation.mutateAsync({
                path: "/trading/journal",
                body: {
                  tag: data.tag,
                  body: data.body,
                  ...(data.order ? { order: Number(data.order) } : {}),
                },
              })
            }
          />
        </section>
        <section className="panel inset">
          <h2>Entries</h2>
          <Result query={query}>
            {(rows) => (
              <>
                {rows.length ? (
                  rows.map((row) => (
                    <article className="record" key={row.id}>
                      <Status>{row.tag}</Status>
                      <small>
                        {date(row.created)}{" "}
                        {row.order_id ? " · Order #" + row.order_id : ""}
                      </small>
                      <p className="prose">{row.body}</p>
                    </article>
                  ))
                ) : (
                  <Empty>No journal entries.</Empty>
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
