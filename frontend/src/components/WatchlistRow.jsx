import { date, rupees } from "../hooks/api.js";
import { Icon } from "./Icon.jsx";

export function WatchlistRow({
  symbol,
  name,
  quote,
  selected,
  editing,
  index,
  total,
  busy,
  onSelect,
  onMove,
  onRemove,
}) {
  return (
    <div className="watch-entry">
      <button
        type="button"
        className="watch-stock"
        aria-pressed={selected === symbol}
        onClick={() => onSelect(symbol)}
      >
        <strong className="watch-ticker">{symbol}</strong>
        <strong className="watch-price">{rupees(quote?.price)}</strong>
        <span className="watch-company">{name || symbol}</span>
        <small
          className="watch-feed"
          title={quote?.time ? date(quote.time) + " IST" : undefined}
        >
          {quote
            ? quote.mode === "replay"
              ? "Replay · " + quote.replayDay
              : quote.status === "demo"
                ? "Simulated price"
                : quote.status
            : "Loading quote…"}
        </small>
      </button>
      <button
        type="button"
        className="watch-remove"
        disabled={busy}
        aria-label={"Remove " + symbol}
        title={"Remove " + symbol + " from this watchlist"}
        onClick={() => onRemove(symbol)}
      >
        <Icon name="close" size={16} />
      </button>
      {editing && (
        <div className="watch-reorder">
          <span>
            Position {index + 1} of {total}
          </span>
          <button
            type="button"
            className="button secondary"
            aria-label={"Move " + symbol + " up"}
            disabled={busy || index === 0}
            onClick={() => onMove(symbol, -1)}
          >
            <Icon name="up" size={16} />
            Up
          </button>
          <button
            type="button"
            className="button secondary"
            aria-label={"Move " + symbol + " down"}
            disabled={busy || index === total - 1}
            onClick={() => onMove(symbol, 1)}
          >
            <Icon name="down" size={16} />
            Down
          </button>
        </div>
      )}
    </div>
  );
}
