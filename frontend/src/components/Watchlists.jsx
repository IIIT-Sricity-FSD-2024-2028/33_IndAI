import { useMemo, useState } from "react";
import { useMarket } from "../hooks/useMarket.js";
import { useWatchlists } from "../hooks/useWatchlists.js";
import { Empty, ErrorText, Form, Result } from "./Common.jsx";
import { WatchlistRow } from "./WatchlistRow.jsx";
import { Icon } from "./Icon.jsx";

export function Watchlists({
  selected,
  onSelect,
  catalog,
  onBrowse,
  visible = true,
}) {
  const state = useWatchlists();
  const { query, items, list, busy, notice, error } = state;
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(false);
  const market = useMarket(visible ? list?.symbols || [] : []);
  const quotes = new Map(
    (market.data || []).map((row) => [row.symbol, row.quote]),
  );
  const names = useMemo(
    () =>
      new Map(
        (catalog?.data?.instruments || []).map((row) => [row.symbol, row.name]),
      ),
    [catalog?.data],
  );
  const saved = list?.symbols.includes(selected);
  const run = (operation) => operation.catch(() => {});
  const choose = (event) => {
    state.select(Number(event.target.value));
    setMode(null);
    setEditing(false);
  };
  const close = () => setMode(null);
  return (
    <section className="watchlist-manager" aria-label="Watchlist manager">
      <div className="watchlist-heading">
        <div>
          <h3>Your watchlists</h3>
          <p className="muted">{items.length} of 12 lists</p>
        </div>
        <button
          type="button"
          className="button secondary"
          disabled={busy || items.length >= 12}
          onClick={() => {
            state.clearNotice();
            setMode(mode === "create" ? null : "create");
          }}
        >
          <Icon name="plus" size={16} />
          New list
        </button>
      </div>
      {mode === "create" && (
        <div className="watchlist-editor">
          <h3>Create a watchlist</h3>
          <Form
            fields={[{ name: "name", label: "Watchlist name", max: 50 }]}
            submit="Create watchlist"
            onSubmit={async ({ name }) => {
              await state.create(name);
              close();
              setEditing(false);
            }}
            secondary={
              <button
                type="button"
                className="button secondary"
                onClick={close}
              >
                Cancel
              </button>
            }
          />
        </div>
      )}
      <Result query={query}>
        {() =>
          !list ? (
            <div className="watchlist-empty">
              <Empty>
                No watchlists yet. Create one to group your favourite stocks.
              </Empty>
            </div>
          ) : (
            <>
              <label className="watchlist-selector">
                Active watchlist
                <select value={list.id} disabled={busy} onChange={choose}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.symbols.length})
                    </option>
                  ))}
                </select>
              </label>
              <div className="watchlist-title">
                <h3>{list.name}</h3>
                <span className="muted">{list.symbols.length}/40 stocks</span>
              </div>
              <div className="watchlist-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={() => {
                    state.clearNotice();
                    setMode(mode === "rename" ? null : "rename");
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="button secondary"
                  disabled={busy || !list.symbols.length}
                  aria-pressed={editing}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "Done reordering" : "Reorder"}
                </button>
                <button
                  type="button"
                  className="button secondary danger-action"
                  disabled={busy}
                  onClick={() => {
                    state.clearNotice();
                    setMode(mode === "delete" ? null : "delete");
                  }}
                >
                  Delete list
                </button>
              </div>
              {mode === "rename" && (
                <div className="watchlist-editor">
                  <Form
                    key={list.id}
                    initial={{ name: list.name }}
                    fields={[
                      { name: "name", label: "New watchlist name", max: 50 },
                    ]}
                    submit="Save name"
                    onSubmit={async ({ name }) => {
                      await state.rename(name);
                      close();
                    }}
                    secondary={
                      <button
                        type="button"
                        className="button secondary"
                        onClick={close}
                      >
                        Cancel
                      </button>
                    }
                  />
                </div>
              )}
              {mode === "delete" && (
                <div className="watchlist-delete">
                  <p>
                    Delete <strong>{list.name}</strong>? Its saved stocks will
                    be removed. Your holdings and orders are kept.
                  </p>
                  <div className="actions">
                    <button
                      type="button"
                      className="button sell-button"
                      disabled={busy}
                      onClick={() =>
                        run(
                          state.deleteList().then(() => {
                            close();
                            setEditing(false);
                          }),
                        )
                      }
                    >
                      Confirm delete
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={busy}
                      onClick={close}
                    >
                      Keep list
                    </button>
                  </div>
                </div>
              )}
              <div className="watchlist-add">
                <div>
                  <small>Selected stock</small>
                  <strong>{selected}</strong>
                </div>
                <button
                  type="button"
                  className="button"
                  disabled={
                    busy || saved || !selected || list.symbols.length >= 40
                  }
                  onClick={() => run(state.add(selected))}
                >
                  <Icon name={saved ? "check" : "plus"} size={16} />
                  {saved ? "Added" : "Add to list"}
                </button>
              </div>
              <button
                type="button"
                className="watchlist-browse text-link"
                onClick={onBrowse}
              >
                <Icon name="search" size={16} />
                Find another stock
              </button>
              {list.symbols.length >= 40 && (
                <p className="muted">
                  This list has 40 stocks. Remove one or create another list.
                </p>
              )}
              {market.isError && (
                <div className="watchlist-feed-error">
                  <p className="muted">Quotes could not refresh.</p>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => market.refetch()}
                  >
                    Retry quotes
                  </button>
                </div>
              )}
              {list.symbols.length ? (
                <div className="watchlist-entries">
                  {list.symbols.map((symbol, index) => (
                    <WatchlistRow
                      key={symbol}
                      symbol={symbol}
                      name={names.get(symbol)}
                      quote={quotes.get(symbol)}
                      selected={selected}
                      editing={editing}
                      index={index}
                      total={list.symbols.length}
                      busy={busy}
                      onSelect={onSelect}
                      onMove={(value, direction) =>
                        run(state.move(value, direction))
                      }
                      onRemove={(value) => run(state.remove(value))}
                    />
                  ))}
                </div>
              ) : (
                <Empty>
                  This list is empty. Add {selected} or search for another
                  stock.
                </Empty>
              )}
            </>
          )
        }
      </Result>
      {notice && (
        <p className="watchlist-notice" role="status">
          {notice}
        </p>
      )}
      <ErrorText error={error} />
    </section>
  );
}
