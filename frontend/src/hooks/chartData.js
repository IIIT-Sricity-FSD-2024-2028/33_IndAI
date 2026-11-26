export function intradayBars(bars, quote) {
  if (!quote?.executable) return bars;
  if (quote.mode === "replay" && quote.replayBar) {
    const current = quote.replayBar;
    return [
      ...bars.filter(
        (bar) =>
          typeof bar.time === "number" &&
          bar.time < current.time &&
          new Date(bar.time * 1000 + 19800000).toISOString().slice(0, 10) ===
            quote.replayDay,
      ),
      current,
    ];
  }
  return bars.map((bar, index) =>
    index === bars.length - 1 &&
    typeof bar.time === "number" &&
    Math.floor(quote.time / 300000) * 300 === bar.time
      ? {
          ...bar,
          close: quote.price / 100,
          high: Math.max(bar.high, quote.price / 100),
          low: Math.min(bar.low, quote.price / 100),
        }
      : bar,
  );
}

export const chartTimeLabel = (time) =>
  typeof time === "number"
    ? new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(time * 1000)
    : null;
