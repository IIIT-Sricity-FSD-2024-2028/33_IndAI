import { date } from "../hooks/api.js";
export function MarketFeedNotice({ quote }) {
  if (quote?.mode !== "replay") return null;
  return (
    <div className="market-feed-notice" role="status">
      <strong>Market closed · historical replay</strong>
      {quote.executable ? (
        <p>
          Replaying this stock’s {quote.replayDay} session · candle{" "}
          {quote.replayIndex + 1} of {quote.replayCount} · loop{" "}
          {quote.replayCycle + 1}. Recorded {date(quote.recordedTime)} IST. It
          repeats until the live market opens.
        </p>
      ) : (
        <p>{quote.reason}</p>
      )}
    </div>
  );
}
