import { Icon } from "./Icon.jsx";

const candles = [
  [68, 24, false],
  [63, 20, true],
  [58, 28, true],
  [52, 19, true],
  [56, 25, false],
  [49, 20, true],
  [46, 26, true],
  [41, 20, true],
  [45, 21, false],
  [38, 24, true],
  [33, 19, true],
  [37, 25, false],
  [32, 21, true],
  [27, 24, true],
  [30, 19, false],
  [23, 23, true],
  [19, 18, true],
  [23, 22, false],
  [17, 23, true],
  [13, 18, true],
];

export function HomePreview() {
  return (
    <div className="home-preview">
      <div className="preview-toolbar">
        <span>
          <i />
          <i />
          <i />
        </span>
        <small>IndAI workspace preview</small>
        <Icon name="trade" size={17} />
      </div>
      <div className="preview-top">
        <div>
          <span className="preview-overline">PAPER TRADING</span>
          <h2>
            A place to put learning
            <br />
            into practice.
          </h2>
        </div>
        <span className="preview-label">Simulated</span>
      </div>
      <div className="preview-chart" aria-hidden="true">
        <div className="preview-chart-grid" />
        <div className="preview-candles">
          {candles.map(([top, height, up], index) => (
            <span
              key={index}
              className={up ? "candle-up" : "candle-down"}
              style={{ top: top + "%", height }}
            />
          ))}
        </div>
      </div>
      <small className="preview-disclosure">
        Illustrative chart · simulated trading
      </small>
      <div className="preview-bottom">
        <span className="preview-book">
          <Icon name="book" size={21} />
        </span>
        <div>
          <small>CONNECT THE CONCEPTS</small>
          <strong>From your first lesson to your first paper order.</strong>
        </div>
      </div>
      <div className="preview-note">
        <span>
          <Icon name="journal" size={19} />
        </span>
        <div>
          <strong>Make every session a lesson.</strong>
          <small>Practice. Record. Review.</small>
        </div>
      </div>
    </div>
  );
}
