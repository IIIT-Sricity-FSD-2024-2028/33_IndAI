import { useEffect, useRef, useState } from "react";
import { CandlestickSeries, LineSeries, createChart } from "lightweight-charts";
import { useTheme } from "../hooks/useTheme.jsx";
import { intradayBars, chartTimeLabel } from "../hooks/chartData.js";
import { ErrorText, Result } from "./Common.jsx";
import { Icon } from "./Icon.jsx";
import { useResource } from "../hooks/api.js";

function Plot({ bars, intraday, type, controller }) {
  const canvas = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const { theme } = useTheme();
  const [selected, setSelected] = useState(null);
  const barsRef = useRef(bars);
  barsRef.current = bars;
  useEffect(() => {
    setSelected(null);
    const chart = createChart(canvas.current, {
      autoSize: true,
      layout: {
        background: { color: "#fff" },
        textColor: "#5a6a65",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "#f0f3f1" },
        horzLines: { color: "#edf1ef" },
      },
      rightPriceScale: {
        borderColor: "#e3e9e5",
        minimumWidth: 76,
        scaleMargins: { top: 0.14, bottom: 0.08 },
      },
      timeScale: {
        borderColor: "#e3e9e5",
        timeVisible: intraday,
        tickMarkFormatter: chartTimeLabel,
        rightOffset: 5,
      },
      localization: {
        locale: "en-IN",
        timeFormatter: (time) =>
          typeof time === "number"
            ? chartTimeLabel(time)
            : typeof time === "string"
              ? time
              : [time.year, time.month, time.day].join("-"),
      },
    });
    const series =
      type === "line"
        ? chart.addSeries(LineSeries, { color: "#29836b", lineWidth: 2 })
        : chart.addSeries(CandlestickSeries, {
            upColor: "#25866b",
            downColor: "#d0625b",
            borderVisible: false,
            wickUpColor: "#25866b",
            wickDownColor: "#d0625b",
          });
    series.setData(
      type === "line"
        ? bars.map((bar) => ({ time: bar.time, value: bar.close }))
        : bars,
    );
    chartRef.current = chart;
    seriesRef.current = series;
    controller.current = chart;
    chart.timeScale().fitContent();
    chart.subscribeCrosshairMove((param) => {
      const point = param.seriesData.get(series);
      setSelected(
        point
          ? barsRef.current.find((bar) => bar.time === point.time) || point
          : null,
      );
    });
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      controller.current = null;
    };
  }, [intraday, type]);
  useEffect(() => {
    seriesRef.current?.setData(
      type === "line"
        ? bars.map((bar) => ({ time: bar.time, value: bar.close }))
        : bars,
    );
  }, [bars, type]);
  useEffect(() => {
    const dark = theme === "dark";
    chartRef.current?.applyOptions({
      layout: {
        background: { color: dark ? "#17221f" : "#fff" },
        textColor: dark ? "#b9ccc4" : "#5a6a65",
      },
      grid: {
        vertLines: { color: dark ? "#263a32" : "#f0f3f1" },
        horzLines: { color: dark ? "#263a32" : "#edf1ef" },
      },
      rightPriceScale: { borderColor: dark ? "#344b41" : "#e3e9e5" },
      timeScale: { borderColor: dark ? "#344b41" : "#e3e9e5" },
    });
  }, [theme, type, intraday]);
  const bar = selected?.close != null ? selected : bars.at(-1);
  const span = (time) =>
    typeof time === "number"
      ? chartTimeLabel(time)
      : typeof time === "string"
        ? time
        : [time.year, time.month, time.day].join("-");
  return (
    <>
      <div className="chart-detail" aria-live="off">
        {[
          ["Open", bar.open],
          ["High", bar.high],
          ["Low", bar.low],
          ["Close", bar.close],
        ].map(([tag, value]) => (
          <span key={tag}>
            {tag}
            <strong
              className={
                tag === "Close"
                  ? bar.close >= bar.open
                    ? "positive"
                    : "negative"
                  : undefined
              }
            >
              {value.toFixed(2)}
            </strong>
          </span>
        ))}
      </div>
      <div
        className="chart-canvas"
        ref={canvas}
        aria-label={type === "line" ? "Line price chart" : "Candlestick chart"}
      />
      <div className="chart-caption">
        <span>
          {bars.length} candles · {span(bars[0].time)} –{" "}
          {span(bars.at(-1).time)}
          {intraday ? " IST" : ""}
        </span>
        <span>Scroll to zoom · drag to pan</span>
      </div>
    </>
  );
}
export function CandleChart({ symbol, quote }) {
  const [range, setRange] = useState("1D");
  const [type, setType] = useState("candles");
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);
  const panel = useRef(null);
  const controller = useRef(null);
  useEffect(() => {
    const update = () =>
      setExpanded(document.fullscreenElement === panel.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  const query = useResource(
    "/trading/instruments/" +
      encodeURIComponent(symbol) +
      "/candles?range=" +
      range,
    { staleTime: 1000, refetchInterval: range === "1D" ? 5000 : 60000 },
  );
  async function expand() {
    try {
      setError(null);
      if (document.fullscreenElement === panel.current)
        await document.exitFullscreen();
      else await panel.current.requestFullscreen();
    } catch {
      setError(new Error("Full screen is unavailable in this browser."));
    }
  }
  return (
    <section
      ref={panel}
      className="panel chart-panel"
      role="region"
      aria-label="Chart workspace"
    >
      <div className="terminal-chart-heading">
        <div>
          <h2>Price chart</h2>
          <p>
            <strong>{symbol}</strong>
            <span>
              NSE · {range === "1D" ? "5-minute candles" : "Daily candles"}
            </span>
          </p>
        </div>
        <div className="chart-tools">
          <button
            type="button"
            className="chart-tool"
            onClick={() => controller.current?.timeScale().fitContent()}
            aria-label="Reset chart view"
            title="Fit all candles"
          >
            <Icon name="reset" size={17} />
          </button>
          <button
            type="button"
            className="chart-tool"
            onClick={expand}
            aria-label={expanded ? "Exit full-screen chart" : "Expand chart"}
            title={expanded ? "Exit full screen" : "Full-screen chart"}
          >
            <Icon name="expand" size={17} />
          </button>
        </div>
      </div>
      <div className="chart-toolbar">
        <div className="segments chart-ranges" aria-label="Chart range">
          {["1D", "1M", "3M", "1Y"].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={range === value}
              onClick={() => setRange(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="chart-views" aria-label="Chart style">
          {[
            ["candles", "Candlesticks", "candles"],
            ["line", "Line chart", "line"],
          ].map(([value, label, icon]) => (
            <button
              type="button"
              key={value}
              className="chart-tool"
              aria-label={label}
              title={label}
              aria-pressed={type === value}
              onClick={() => setType(value)}
            >
              <Icon name={icon} size={17} />
            </button>
          ))}
        </div>
      </div>
      <ErrorText error={error} />
      <Result query={query}>
        {(data) =>
          data.candles.length ? (
            <Plot
              key={
                symbol +
                range +
                (quote?.mode || "live") +
                (quote?.replayDay || "") +
                (quote?.replayCycle ?? "")
              }
              controller={controller}
              bars={
                range === "1D"
                  ? intradayBars(data.candles, quote)
                  : data.candles
              }
              intraday={range === "1D"}
              type={type}
            />
          ) : (
            <p className="empty">No candles are available in this range.</p>
          )
        }
      </Result>
    </section>
  );
}
