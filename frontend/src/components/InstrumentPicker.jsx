import { useId, useMemo, useState } from "react";
import { Empty, Pager, Result } from "./Common.jsx";
import { Icon } from "./Icon.jsx";

const pageSize = 40;
export function InstrumentPicker({
  catalog,
  selected,
  onSelect,
  autoFocus = false,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const id = useId();
  const rows = useMemo(() => {
    const query = search.trim().toUpperCase();
    const all = catalog.data?.instruments || [];
    if (!query) return all;
    return all
      .filter((row) =>
        (row.symbol + " " + row.name).toUpperCase().includes(query),
      )
      .sort((a, b) => {
        const rank = (row) =>
          row.symbol === query ? 0 : row.symbol.startsWith(query) ? 1 : 2;
        return rank(a) - rank(b) || a.symbol.localeCompare(b.symbol);
      });
  }, [catalog.data, search]);
  const current = rows.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <div className="instrument-picker">
      <label htmlFor={id}>
        <span>Search NSE stocks</span>
        <div className="search-control">
          <Icon name="search" size={17} />
          <input
            id={id}
            autoFocus={autoFocus}
            type="search"
            value={search}
            maxLength={60}
            placeholder="Symbol or company name"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </label>
      <Result query={catalog}>
        {() => (
          <>
            <p className="muted picker-count" role="status">
              {search.trim()
                ? rows.length + " matches"
                : rows.length.toLocaleString("en-IN") +
                  " NSE equity instruments"}
              {rows.length > pageSize
                ? " · " +
                  (page * pageSize + 1) +
                  "–" +
                  Math.min((page + 1) * pageSize, rows.length)
                : ""}
            </p>
            {current.length ? (
              <div
                className="symbol-results"
                aria-label="Stock search results"
                tabIndex={0}
              >
                {current.map((row) => (
                  <button
                    type="button"
                    key={row.symbol}
                    aria-pressed={selected === row.symbol}
                    onClick={() => onSelect(row.symbol)}
                  >
                    <strong>{row.symbol}</strong>
                    <small>{row.name}</small>
                  </button>
                ))}
              </div>
            ) : (
              <Empty>No matching stocks. Try a symbol or company name.</Empty>
            )}
            {current.length > 4 && (
              <small className="picker-scroll-hint">
                Scroll to see more stocks
              </small>
            )}
            {(page > 0 || rows.length > pageSize) && (
              <Pager
                page={page}
                setPage={setPage}
                more={(page + 1) * pageSize < rows.length}
              />
            )}
          </>
        )}
      </Result>
    </div>
  );
}
