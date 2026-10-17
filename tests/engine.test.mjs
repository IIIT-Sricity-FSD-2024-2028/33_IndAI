process.env.UPSTOX_ANALYTICS_TOKEN="";
import test from "node:test";
import assert from "node:assert/strict";
import {
  demoCandles,
  search,
  quotes,
  isMarketOpen,
  nowIST,
} from "../back-end/algo/market.mjs";
import {
  sma,
  ema,
  rsi,
  roc,
  calculateSignals,
  backtest,
  parseRule,
  evaluateRule,
} from "../back-end/algo/strategy.mjs";
const bars = demoCandles("DEMO|RELIANCE", "2025-01-01", "2026-10-09");
test("demo produces consistent OHLCV, ascending timestamps", () => {
  assert.ok(bars.length > 400);
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    assert.ok(b.low <= Math.min(b.open, b.close));
    assert.ok(b.high >= Math.max(b.open, b.close));
    if (i) assert.ok(bars[i - 1].time < b.time);
  }
});
test("demo history remains identical for the same date with other range", () => {
  const small = demoCandles("DEMO|RELIANCE", "2026-01-01", "2026-05-01");
  assert.deepEqual(
    small,
    bars.filter((x) => x.time >= "2026-01-01" && x.time <= "2026-05-01"),
  );
});
test("MA and RSI known constant series", () => {
  const arr = [10, 10, 10, 10, 10, 10];
  assert.equal(sma(arr, 3, 2), 10);
  assert.equal(ema(arr, 3, 5), 10);
  assert.equal(rsi(arr, 3, 5), 50);
  assert.equal(roc(arr, 3, 5), 0);
});
test("strategies all generate signals", () => {
  for (const strategy of [
    "sma",
    "ema",
    "rsi",
    "bollinger",
    "breakout",
    "momentum",
    "rules",
  ]) {
    const a = calculateSignals(bars, { strategy });
    assert.equal(a.length, bars.length);
    assert.equal(typeof a.at(-1).buy, "boolean");
  }
});
test("custom expressions support indicators without arbitrary JS", () => {
  const rule = parseRule("sma(20) > sma(50) and rsi(14) < 70");
  assert.equal(typeof evaluateRule(rule, bars, 100), "boolean");
  assert.throws(() => parseRule("process.exit()"));
  assert.throws(() => parseRule("constructor()"));
  assert.throws(() => parseRule("close; import file"));
});
test("backtests produce finite stats and next-open trade prices", () => {
  const result = backtest(bars, {
    strategy: "momentum",
    period: 10,
    capital: 100000,
    feePct: 0,
    slippagePct: 0,
  });
  assert.equal(result.equity.length, bars.length);
  assert.ok(Number.isFinite(result.final));
  assert.ok(result.final > 0);
  assert.ok(result.trades.length > 0);
  const first = result.trades[0];
  const i = bars.findIndex((c) => c.time === first.date);
  assert.equal(first.price, bars[i].open);
  assert.ok(i > 10);
});
test("backtest rejects malformed inputs", () => {
  assert.throws(() => backtest(bars.slice(0, 20), {}));
  assert.throws(() => backtest(bars, { capital: -1 }));
  assert.throws(() => backtest(bars, { strategy: "bad" }));
});
test("demo equity search works without token", async () => {
  const s = await search("TCS");
  assert.ok(s.instruments.some((x) => x.trading_symbol === "TCS"));
  const q = await quotes(["DEMO|TCS"]);
  assert.ok(q["DEMO|TCS"].last_price > 0);
  assert.equal(q["DEMO|TCS"].source, "SYNTHETIC");
});
test("IST clock and market open functions never throw", () => {
  assert.ok(nowIST().year);
  assert.equal(typeof isMarketOpen(), "boolean");
});
