// ============================================================
// IndAI Platform – Trading Data Module
// ============================================================
window.TradingModule = {
  getMovers(stocks) {
    const list = [...(stocks || [])];
    return {
      gainers: list.sort((a,b)=>b.change-a.change).slice(0,5),
      losers: [...list].sort((a,b)=>a.change-b.change).slice(0,5),
      active: [...list].sort((a,b)=>parseFloat(String(b.vol).replace(/[^\d.]/g,'')) - parseFloat(String(a.vol).replace(/[^\d.]/g,''))).slice(0,5)
    };
  },
  buildPortfolioSeries(user, trades, period = '1M') {
    const pointsMap = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365 };
    const points = pointsMap[period] || 30;
    const today = new Date();
    const current = Number(user?.portfolioValue || 100000);
    const baseline = 100000;
    const totalTrades = (trades || []).length;
    const amplitude = Math.max(800, totalTrades * 180 + Math.abs(current - baseline) * 0.25);
    const series = [];
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const progress = 1 - (i / Math.max(points - 1, 1));
      const wave = Math.sin(progress * Math.PI * 2.3) * amplitude * 0.32;
      const drift = (current - baseline) * progress;
      const pullback = Math.cos(progress * Math.PI * 5.1) * amplitude * 0.08;
      series.push({
        label: d.toLocaleDateString('en-IN', { day:'numeric', month: points > 31 ? 'short' : undefined }),
        value: Math.max(85000, Math.round(baseline + drift + wave + pullback))
      });
    }
    series[series.length - 1].value = current;
    return series;
  }
};
