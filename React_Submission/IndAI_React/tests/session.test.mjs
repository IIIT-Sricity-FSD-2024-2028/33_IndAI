import test from "node:test";
import assert from "node:assert/strict";
process.env.UPSTOX_ANALYTICS_TOKEN = "test-token-not-a-real-secret";
const originalFetch = globalThis.fetch;
const bars = Array.from({ length: 375 }, (_, i) => {
  const minute = 555 + i;
  return [
    "2026-10-15T" +
      String(Math.floor(minute / 60)).padStart(2, "0") +
      ":" +
      String(minute % 60).padStart(2, "0") +
      ":00+05:30",
    100 + i,
    102 + i,
    99 + i,
    101 + i,
    1000,
  ];
});
globalThis.fetch = async (url) => {
  url = String(url);
  let p;
  if (url.includes("/market/status/"))
    p = {
      status: "success",
      data: { status: url.endsWith("/BSE") ? "NORMAL_OPEN" : "CLOSING_END" },
    };
  else if (url.includes("/historical-candle/"))
    p = { status: "success", data: { candles: [...bars].reverse() } };
  else if (url.includes("/market-quote/ltp"))
    p = {
      status: "success",
      data: {
        stock: { instrument_token: "BSE_EQ|TEST123", last_price: 321, cp: 300 },
      },
    };
  else
    return new Response(
      JSON.stringify({ errors: [{ message: "Expired token" }] }),
      { status: 401 },
    );
  return new Response(JSON.stringify(p), { status: 200 });
};
const session = await import("../back-end/algo/session.mjs");
await test("Closed-session replay exposes only candles through the virtual clock and uses the same fill quote", async () => {
  const result = await session.sessionBars("NSE_EQ|TEST123");
  assert.equal(result.mode, "REPLAY");
  assert.equal(result.sessionDate, "2026-10-15");
  assert.equal(result.candles.length, result.replayIndex + 1);
  const quote = (await session.sessionQuotes(["NSE_EQ|TEST123"]))[
    "NSE_EQ|TEST123"
  ];
  assert.equal(quote.source, "UPSTOX_REPLAY");
  assert.equal(quote.last_price, result.candles.at(-1).close);
  assert.ok(result.candles.every((c) => c.time.startsWith("2026-10-15")));
});
await test("Exchange-reported open session uses live quotes rather than weekday assumptions", async () => {
  const s = await session.sessionStatus("BSE");
  assert.equal(s.mode, "LIVE");
  const q = (await session.sessionQuotes(["BSE_EQ|TEST123"]))["BSE_EQ|TEST123"];
  assert.equal(q.source, "UPSTOX_LTP");
  assert.equal(q.last_price, 321);
});
await test("Expired upstream credentials report an error without synthetic substitution", async () => {
  const { requestUpstox } = await import("../back-end/algo/market.mjs");
  await assert.rejects(requestUpstox("/v2/expired"), /authorization failed/);
});
globalThis.fetch = originalFetch;
