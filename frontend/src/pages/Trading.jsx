import { useState } from "react";
import { useCatalog, useMarket } from "../hooks/useMarket.js";
import { useSearchParams, Link } from "react-router-dom";
import { date, rupees, useResource } from "../hooks/api.js";
import { Heading, Result, Status } from "../components/Common.jsx";
import { Icon } from "../components/Icon.jsx";
import { MarketFeedNotice } from "../components/MarketFeedNotice.jsx";
import { MarketExplorerDialog } from "../components/MarketExplorerDialog.jsx";
import { CandleChart } from "../components/CandleChart.jsx";
import { OrderTicket } from "../components/OrderTicket.jsx";
import { Orders } from "../components/Orders.jsx";
import "../styles/trading.css";
import { useSelector } from "react-redux";
import { selectResource } from "../redux/selectors/index.js";
import { useResourceSubscription, resourceResult } from "../redux/hooks.js";

export function Trading() {
  const [params, setParams] = useSearchParams();
  const [explorer, setExplorer] = useState(false);
  const symbol = params.get("symbol") || "RELIANCE";
  const catalog = useCatalog();
  const market = useMarket([symbol]);
  const selected = market.data?.find((item) => item.symbol === symbol);
  const current = {
    ...market,
    data: selected,
    isError: market.isError || (!market.isPending && !selected),
    error:
      market.error ||
      new Error("Instrument not found. Choose a symbol from the explorer."),
  };
  const refreshAccount = useResourceSubscription("/trading/account", {
    refetchInterval: 5000,
  });
  const accountEntry = useSelector((state) =>
    selectResource(state, "/trading/account"),
  );
  const account = resourceResult(accountEntry, refreshAccount);
  const select = (value) => setParams({ symbol: value });
  const tick = current.data?.quote;
  return (
    <div className="trading-workspace">
      <Heading title="Paper trading" detail="Your market workspace">
        <div className="trading-page-actions">
          <button
            type="button"
            className="button"
            onClick={() => setExplorer(true)}
            aria-haspopup="dialog"
          >
            <Icon name="search" size={17} />
            Stocks & watchlists
          </button>
          <Link className="button secondary" to="/portfolio">
            <Icon name="portfolio" size={17} />
            Portfolio
          </Link>
        </div>
      </Heading>
      <MarketExplorerDialog
        open={explorer}
        onClose={() => setExplorer(false)}
        catalog={catalog}
        selected={symbol}
        onSelect={select}
      />
      <Result query={current}>
        {(item) => (
          <>
            <section className="panel terminal-instrument">
              <div className="terminal-instrument-identity">
                <span className="ticker-monogram" aria-hidden="true">
                  {symbol.replace(/[^A-Z0-9]/g, "").slice(0, 2)}
                </span>
                <div>
                  <div className="instrument-symbol">
                    <h2>{item.symbol}</h2>
                    <span className="exchange">{item.exchange}</span>
                    <button
                      type="button"
                      className="icon-button change-stock"
                      aria-label="Change stock"
                      onClick={() => setExplorer(true)}
                    >
                      <Icon name="down" size={16} />
                    </button>
                  </div>
                  <p>{item.name}</p>
                </div>
              </div>
              <div className="terminal-price">
                <strong>{rupees(tick.price)}</strong>
                <div>
                  <Status>{tick.status}</Status>
                  <span>
                    {tick.source === "demo"
                      ? "Simulated feed"
                      : tick.mode === "replay"
                        ? "Historical feed"
                        : "Upstox live"}
                  </span>
                </div>
              </div>
              <div className="terminal-account">
                <small>Available paper cash</small>
                <strong>{rupees(account.data?.available, 0)}</strong>
                <small>
                  {tick.time
                    ? "Updated " + date(tick.time) + " IST"
                    : tick.reason || "Waiting for a quote"}
                </small>
              </div>
            </section>
            <MarketFeedNotice quote={tick} />
            <div className="terminal terminal-focused">
              <CandleChart key={symbol} symbol={symbol} quote={tick} />
              <OrderTicket
                key={symbol}
                instrument={
                  current.isError
                    ? { ...item, quote: { ...tick, executable: false } }
                    : item
                }
                account={account.data}
              />
            </div>
          </>
        )}
      </Result>
      <Orders working />
      <p className="terminal-disclaimer">
        <Icon name="trade" size={14} />
        Paper account · orders use simulated funds
        {tick?.mode === "replay" ? " and recorded prices" : ""}.
      </p>
    </div>
  );
}
