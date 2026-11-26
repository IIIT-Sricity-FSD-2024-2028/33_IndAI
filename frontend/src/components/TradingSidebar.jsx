import { useId, useState } from "react";
import { InstrumentPicker } from "./InstrumentPicker.jsx";
import { Watchlists } from "./Watchlists.jsx";
import { Icon } from "./Icon.jsx";

export function TradingSidebar({
  catalog,
  selected,
  onSelect,
  visible = true,
}) {
  const [tab, setTab] = useState("stocks");
  const id = useId();
  function change(next) {
    setTab(next);
  }
  return (
    <aside className="panel trading-sidebar" aria-label="Stocks and watchlists">
      <div className="stock-explorer-head">
        <div>
          <h2>Market explorer</h2>
          <p>Find stocks. Build your lists.</p>
        </div>
        <span className="exchange">NSE</span>
      </div>
      <div
        className="explorer-tabs"
        role="tablist"
        aria-label="Market explorer views"
      >
        {[
          ["stocks", "Search stocks", "search"],
          ["lists", "Watchlists", "portfolio"],
        ].map(([value, label, icon]) => (
          <button
            type="button"
            role="tab"
            id={id + "-" + value}
            aria-controls={id + "-" + value + "-panel"}
            aria-selected={tab === value}
            tabIndex={tab === value ? 0 : -1}
            key={value}
            onClick={() => change(value)}
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? "stocks"
                    : event.key === "End"
                      ? "lists"
                      : value === "stocks"
                        ? "lists"
                        : "stocks";
                change(next);
                document.getElementById(id + "-" + next)?.focus();
              }
            }}
          >
            <Icon name={icon} size={16} />
            {label}
          </button>
        ))}
      </div>
      <div
        className="explorer-section"
        id={id + "-stocks-panel"}
        role="tabpanel"
        aria-labelledby={id + "-stocks"}
        hidden={tab !== "stocks"}
      >
        <InstrumentPicker
          catalog={catalog}
          selected={selected}
          onSelect={onSelect}
        />
        <div className="explorer-selection">
          <small>Selected stock</small>
          <strong>{selected}</strong>
          <button
            type="button"
            className="button secondary"
            onClick={() => change("lists")}
          >
            Save to a watchlist
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
      <div
        className="explorer-section"
        id={id + "-lists-panel"}
        role="tabpanel"
        aria-labelledby={id + "-lists"}
        hidden={tab !== "lists"}
      >
        <Watchlists
          visible={visible && tab === "lists"}
          selected={selected}
          onSelect={onSelect}
          catalog={catalog}
          onBrowse={() => {
            change("stocks");
            requestAnimationFrame(() =>
              document
                .querySelector('.trading-sidebar input[type="search"]')
                ?.focus(),
            );
          }}
        />
      </div>
    </aside>
  );
}
