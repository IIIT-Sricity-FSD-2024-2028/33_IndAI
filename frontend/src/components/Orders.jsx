import { useState } from "react";
import { date, rupees, useResource } from "../hooks/api.js";
import { Action, Empty, Pager, Result, Status } from "./Common.jsx";
export function Orders({ working = false }) {
  const [page, setPage] = useState(0);
  const query = useResource(
    "/trading/orders?page=" + page + "&working=" + working,
    { refetchInterval: 5000 },
  );
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{working ? "Working orders" : "Order history"}</h2>
      </div>
      <Result query={query}>
        {(rows) => (
          <>
            {rows.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Instrument</th>
                      <th>Order</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>{working ? "Condition" : "Fill price"}</th>
                      <th>{working ? "" : "Fee"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.symbol}</strong>
                          {row.feed_mode === "replay" && (
                            <small>Historical replay · {row.replay_day}</small>
                          )}
                          <small>
                            #{row.id} · {date(row.created)}
                          </small>
                        </td>
                        <td>
                          <span
                            className={
                              row.side === "buy" ? "positive" : "negative"
                            }
                          >
                            {row.side.toUpperCase()}
                          </span>
                          <small>{row.type.replaceAll("-", " ")}</small>
                        </td>
                        <td>{row.qty}</td>
                        <td>
                          <Status>{row.state}</Status>
                          {(row.reason || row.triggered) && (
                            <small>
                              {row.reason ||
                                (row.state === "open" ? "Triggered" : null)}
                            </small>
                          )}
                        </td>
                        <td>
                          {working ? (
                            <>
                              {row.price && (
                                <div>Limit {rupees(row.price)}</div>
                              )}
                              {row.trigger && (
                                <div>Trigger {rupees(row.trigger)}</div>
                              )}
                            </>
                          ) : (
                            rupees(row.fill_price)
                          )}
                        </td>
                        <td>
                          {working ? (
                            <Action
                              path={"/trading/orders/" + row.id + "/cancel"}
                              title={row.oco ? "Cancel protection" : "Cancel"}
                              confirm={
                                row.oco
                                  ? "Cancel both linked protection orders?"
                                  : "Cancel this order?"
                              }
                            />
                          ) : (
                            rupees(row.fee)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>
                {working ? "No working orders." : "No paper orders yet."}
              </Empty>
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
