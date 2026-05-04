// ============================================================
// IndAI Review-4 Professional Trading UI
// REAL-TIME CSV REPLAY: every 2 seconds = next 1-minute candle.
// Prices, percentages, movers, chart, order ticket and portfolio
// are refreshed from the NestJS backend using uploaded CSV files.
// ============================================================
const TradingUI = {
  _userId:null,
  _prefix:'',
  _capFilter:'All',
  _sectorFilter:'All',
  _tradeType:'BUY',
  _stocks:[],
  _candles:{},
  _activeSymbol:'TCS',
  _backendOnline:false,
  _liveTimer:null,
  _lastTick:null,
  _tickMs:2000,

  init(userId, prefix='') {
    this._userId=userId;
    this._prefix=prefix;
    this._capFilter='All';
    this._sectorFilter='All';
    this._stocks=[];
    this._candles={};
    this._lastTick=null;
    this._stopLiveLoop();
  },

  _el(id){ return document.getElementById(this._prefix + id); },
  _localStocks(){ return (window.DB?.getStocks?.() || window.IndAIData?.stocks || []); },

  async _ensureStocks(force=false){
    if (this._stocks.length && !force) return this._stocks;
    const res = await window.ApiClient?.stocks?.();
    if (res?.success && Array.isArray(res.data)) {
      this._stocks = res.data;
      this._backendOnline=true;
      if(window.IndAIData) IndAIData.stocks = res.data;
    } else {
      this._stocks = this._localStocks();
      this._backendOnline=false;
    }
    return this._stocks;
  },

  async _getCandles(symbol, force=false){
    symbol = symbol || this._activeSymbol;
    if (!force && this._candles[symbol]) return this._candles[symbol];
    const res = await window.ApiClient?.candles?.(symbol, 240);
    if (res?.success && Array.isArray(res.data)) this._candles[symbol] = res.data;
    else this._candles[symbol] = this._mockCandles(DB.getStockBySymbol(symbol) || this._stocks.find(s=>s.symbol===symbol));
    return this._candles[symbol];
  },

  _mockCandles(stock){
    const base = Number(stock?.price || 100); const arr=[];
    for(let i=239;i>=0;i--){
      const wave=Math.sin(i/12)*base*0.008;
      const drift=(240-i)*base*0.00003;
      const close=base-wave-drift;
      arr.push({datetime:new Date(Date.now()-i*60000).toISOString(), open:close*0.998, high:close*1.004, low:close*0.996, close, volume:Math.round(1000+Math.random()*90000)});
    }
    return arr;
  },

  async renderPortfolio(){
    let live = await window.ApiClient?.portfolio?.(this._userId);
    if (!live?.success && window.DB) DB.refreshTradingState(this._userId);
    const user = (live?.data?.user) || DB.getUserById(this._userId); if(!user) return;
    if(live?.data?.user && window.IndAIData){ const idx=IndAIData.users.findIndex(u=>u.id===this._userId); if(idx>=0) Object.assign(IndAIData.users[idx], live.data.user); }
    const holdings = (live?.data?.holdings) || DB.getHoldings(this._userId);
    const trades = (live?.data?.trades) || DB.getLearnerTrades(this._userId);
    const ret = (((user.portfolioValue || 100000)-100000)/100000*100);
    const portVal=this._el('port-val'), portRet=this._el('port-ret'), portBal=this._el('port-bal');
    if(portVal) portVal.textContent = fmtINR(user.portfolioValue||100000);
    if(portRet){ portRet.textContent=fmtPct(ret); portRet.className=gainLossClass(ret); }
    if(portBal) portBal.textContent = fmtINR(user.virtualBalance||0);
    const bal=document.getElementById('ticket-balance'); if(bal) bal.textContent=fmtINR(user.virtualBalance||0);

    const holdingsEl=this._el('holdings-list');
    if(holdingsEl){
      const arr=Object.entries(holdings).filter(([,h])=>h.qty>0);
      holdingsEl.innerHTML = arr.length ? arr.map(([sym,h])=>{
        const s=this._stocks.find(x=>x.symbol===sym)||DB.getStockBySymbol(sym)||{};
        const avg=h.qty? h.spent/h.qty:0;
        const cur=(s.price||avg)*h.qty;
        const pnl=((s.price||avg)-avg)*h.qty;
        const pnlPct = avg ? ((s.price||avg)-avg)/avg*100 : 0;
        return `<div class="holding-row pro-holding"><div><div class="holding-sym">${sym}</div><div class="holding-meta">${h.qty} qty · Avg ₹${Math.round(avg).toLocaleString('en-IN')}</div></div><div style="text-align:right"><div style="font-weight:900">${fmtINR(cur)}</div><div class="${gainLossClass(pnl)}">${fmtINR(pnl)} · ${fmtPct(pnlPct)}</div></div></div>`;
      }).join('') : `<div class="empty-state"><div class="icon">₹</div><p>No holdings yet. Open the Trading tab and place your first paper order.</p></div>`;
    }
    const historyEl=this._el('trade-history');
    if(historyEl){ historyEl.innerHTML = trades.length ? [...trades].reverse().map(t=>`<tr><td style="font-weight:800">${t.symbol}</td><td><span class="badge ${t.type==='BUY'?'badge-green':'badge-red'}">${t.type}</span></td><td>${t.qty}</td><td>₹${Number(t.price).toLocaleString('en-IN')}</td><td style="font-weight:800">${fmtINR(t.total)}</td><td style="color:var(--gray-400)">${String(t.date).slice(0,16).replace('T',' ')}</td><td><span class="badge badge-green">Executed</span></td></tr>`).join('') : `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--gray-400);">No trades yet.</td></tr>`; }
  },

  async renderMarket(){
    const stocks=await this._ensureStocks(true);
    if(!stocks.length) return;
    this._activeSymbol = this._activeSymbol || stocks[0].symbol;
    const selected = stocks.find(s=>s.symbol===this._activeSymbol) || stocks[0];
    const host=this._el('stock-list');
    const count=this._el('stock-count-label');
    if(count) count.textContent = `Professional Market Terminal · ${stocks.length} instruments`;
    this._renderMovers(stocks);
    if(host && !host.dataset.pro){ host.dataset.pro='1'; host.innerHTML = this._terminalHTML(selected); }
    await this._renderSelectedStock(selected.symbol, true);
    this.filterMarket();
    this._startLiveLoop();
  },

  _startLiveLoop(){
    if(this._liveTimer) return;
    this._liveTimer = setInterval(()=>this._refreshLiveTick(), this._tickMs);
    this._refreshLiveTick();
  },

  _stopLiveLoop(){
    if(this._liveTimer) clearInterval(this._liveTimer);
    this._liveTimer=null;
  },

  async _refreshLiveTick(){
    const res = await window.ApiClient?.marketTick?.();
    if(res?.success && res.data?.stocks){
      this._backendOnline=true;
      this._tickMs = res.data.replaySpeedMs || this._tickMs;
      this._lastTick = res.data;
      this._stocks = res.data.stocks;
      if(window.IndAIData) IndAIData.stocks = res.data.stocks;
      this._renderMoversFromTick(res.data);
      this.filterMarket();
      await this._renderSelectedStock(this._activeSymbol, true);
      await this.renderPortfolio();
      if(typeof renderPortfolioGraph==='function') renderPortfolioGraph();
      if(typeof renderStats==='function') renderStats();
      this._updateLiveStatus(true, res.data);
      console.log(`[LIVE MARKET] ${res.data.serverTime} | ${this._stocks.length} stocks updated from 1-min CSV replay`);
    } else {
      this._backendOnline=false;
      this._simulateLocalTick();
      this._renderMovers(this._stocks);
      this.filterMarket();
      await this._renderSelectedStock(this._activeSymbol, false);
      this._updateLiveStatus(false);
    }
  },

  _simulateLocalTick(){
    const base = this._stocks.length ? this._stocks : this._localStocks();
    this._stocks = base.map(s=>{
      const old=Number(s.price||100);
      const next=Number((old*(1+(Math.sin(Date.now()/9000+old)*0.0012))).toFixed(2));
      const open=Number(s.open||old);
      return {...s, price:next, changeAbs:Number((next-open).toFixed(2)), change:Number(((next-open)/open*100).toFixed(2)), vol:s.vol||'-', lastTickAt:new Date().toISOString()};
    });
  },

  _renderMoversFromTick(tick){
    if(tick?.movers){
      this._renderMoversList(tick.movers.gainers || [], 'top-gainers');
      this._renderMoversList(tick.movers.losers || [], 'top-losers');
      this._renderMoversList(tick.movers.active || [], 'most-active');
    } else this._renderMovers(this._stocks);
  },

  _renderMovers(stocks){
    this._renderMoversList([...stocks].sort((a,b)=>b.change-a.change).slice(0,5),'top-gainers');
    this._renderMoversList([...stocks].sort((a,b)=>a.change-b.change).slice(0,5),'top-losers');
    this._renderMoversList([...stocks].sort((a,b)=>(b.volume||0)-(a.volume||0)).slice(0,5),'most-active');
  },

  _renderMoversList(arr,elId){
    const el=this._el(elId);
    if(el) el.innerHTML=arr.map(s=>`<div class="pro-mover" onclick="TradingUI.selectStock('${s.symbol}')"><div><b>${s.symbol}</b><span>${s.name}</span></div><div><strong>₹${Number(s.price).toLocaleString('en-IN')}</strong><em class="${gainLossClass(s.change)}">${s.change>=0?'+':''}${s.change}%</em></div></div>`).join('');
  },

  _terminalHTML(s){
    return `<div class="pro-terminal">
      <div class="pro-left">
        <div class="pro-chart-card">
          <div class="pro-chart-head">
            <div><div class="pro-symbol" id="pro-symbol">${s.symbol}</div><div class="pro-name" id="pro-name">${s.name}</div></div>
            <div class="pro-price-box"><div id="pro-price">₹${Number(s.price).toLocaleString('en-IN')}</div><span id="pro-change" class="${gainLossClass(s.change)}">${s.change>=0?'+':''}${s.change}%</span></div>
          </div>
          <div class="live-strip"><span class="live-dot"></span><span id="live-status">LIVE CSV replay starting...</span><span id="live-clock"></span></div>
          <canvas id="${this._prefix}pro-chart" height="260"></canvas>
          <div class="pro-chart-foot"><span>Rolling 1-minute candles from your uploaded datasets</span><span id="pro-source">${this._backendOnline?'Backend live CSV replay':'Local fallback'}</span></div>
        </div>
        <div class="pro-market-table"><div class="pro-table-head"><span>Instrument</span><span>Price</span><span>Change</span><span>Volume</span><span>Action</span></div><div id="${this._prefix}pro-stock-rows"></div></div>
      </div>
      <div class="pro-ticket">
        <div class="ticket-title">Order Ticket</div><div class="ticket-symbol" id="ticket-symbol">${s.symbol}</div>
        <div class="ticket-tabs"><button id="ticket-buy" class="active" onclick="TradingUI._setTicketType('BUY')">BUY</button><button id="ticket-sell" onclick="TradingUI._setTicketType('SELL')">SELL</button></div>
        <label>Quantity</label><input id="${this._prefix}ticket-qty" class="form-input" type="number" min="1" value="1" oninput="TradingUI._updateTicketTotal()">
        <label>Order Type</label><select class="form-select"><option>Market Order</option><option>Limit Order Demo</option><option>Stop Loss Demo</option></select>
        <div class="ticket-summary"><div><span>LTP</span><b id="ticket-price">₹${Number(s.price).toLocaleString('en-IN')}</b></div><div><span>Change</span><b id="ticket-live-change" class="${gainLossClass(s.change)}">${s.change>=0?'+':''}${s.change}%</b></div><div><span>Estimated Total</span><b id="ticket-total">₹${Number(s.price).toLocaleString('en-IN')}</b></div><div><span>Virtual Balance</span><b id="ticket-balance">${fmtINR(DB.getUserById(this._userId)?.virtualBalance||100000)}</b></div></div>
        <button class="btn btn-primary btn-block" onclick="TradingUI._executeTicketOrder()">Place Paper Order</button><button class="btn btn-secondary btn-block mt-8" onclick="TradingUI.addToWatchlist(TradingUI._activeSymbol)">Add to Watchlist</button>
        <div class="ticket-note">Backend logs every live tick and order in the NestJS terminal. Prices are replayed from your minute-by-minute CSV files.</div>
      </div>
    </div>`;
  },

  async _renderSelectedStock(symbol, forceCandles=false){
    const stocks=await this._ensureStocks();
    const s=stocks.find(x=>x.symbol===symbol) || stocks[0]; if(!s)return;
    this._activeSymbol=s.symbol;
    [['pro-symbol',s.symbol],['pro-name',s.name],['pro-price',`₹${Number(s.price).toLocaleString('en-IN')}`],['ticket-symbol',s.symbol],['ticket-price',`₹${Number(s.price).toLocaleString('en-IN')}`]].forEach(([id,val])=>{const e=document.getElementById(id); if(e)e.textContent=val;});
    const c=document.getElementById('pro-change'); if(c){c.className=gainLossClass(s.change); c.textContent=`${s.change>=0?'+':''}${s.change}%`;}
    const tc=document.getElementById('ticket-live-change'); if(tc){tc.className=gainLossClass(s.change); tc.textContent=`${s.change>=0?'+':''}${s.change}%`;}
    this._updateTicketTotal();
    this._drawChart(await this._getCandles(s.symbol, forceCandles));
  },

  async selectStock(symbol){
    this._activeSymbol=symbol;
    delete this._candles[symbol];
    await this._renderSelectedStock(symbol, true);
    document.querySelectorAll('.pro-row').forEach(r=>r.classList.toggle('selected', r.dataset.symbol===symbol));
  },

  filterMarket(){
    const q=(this._el('market-search')?.value||'').toLowerCase();
    const stocks=(this._stocks.length?this._stocks:this._localStocks()).filter(s=>(!q||s.symbol.toLowerCase().includes(q)||s.name.toLowerCase().includes(q))&&(this._capFilter==='All'||s.cap===this._capFilter)&&(this._sectorFilter==='All'||s.sector===this._sectorFilter));
    const rows=this._el('pro-stock-rows');
    if(rows) rows.innerHTML=stocks.map(s=>`<div class="pro-row ${s.symbol===this._activeSymbol?'selected':''}" data-symbol="${s.symbol}" onclick="TradingUI.selectStock('${s.symbol}')"><span><b>${s.symbol}</b><small>${s.name}</small></span><span class="live-price">₹${Number(s.price).toLocaleString('en-IN')}</span><span class="${gainLossClass(s.change)}">${s.change>=0?'+':''}${s.change}%</span><span>${s.vol||'-'}</span><span><button class="btn btn-green btn-sm" onclick="event.stopPropagation();TradingUI._openTradeModal('${s.symbol}','BUY')">Trade</button></span></div>`).join('');
    const count=this._el('stock-count-label'); if(count) count.textContent=`Live CSV replay · Showing ${stocks.length} of ${(this._stocks.length||this._localStocks().length)} stocks`;
  },

  setCapFilter(cap,btn){ this._capFilter=cap; const c=this._el('cap-filters'); if(c)c.querySelectorAll('.chip').forEach(b=>b.classList.remove('active')); if(btn)btn.classList.add('active'); this.filterMarket(); },
  setSectorFilter(sec,btn){ this._sectorFilter=sec; const c=this._el('sector-filters'); if(c)c.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active')); if(btn)btn.classList.add('active'); this.filterMarket(); },
  resetFilters(){ this._capFilter='All'; this._sectorFilter='All'; const ms=this._el('market-search'); if(ms)ms.value=''; this.filterMarket(); },
  _setTicketType(type){ this._tradeType=type; document.getElementById('ticket-buy')?.classList.toggle('active', type==='BUY'); document.getElementById('ticket-sell')?.classList.toggle('active', type==='SELL'); },
  _updateTicketTotal(){ const s=this._stocks.find(x=>x.symbol===this._activeSymbol)||DB.getStockBySymbol(this._activeSymbol)||{}; const qty=parseInt(this._el('ticket-qty')?.value)||1; const el=document.getElementById('ticket-total'); if(el) el.textContent=fmtINR(qty*(s.price||0)); },
  async _executeTicketOrder(){ const s=this._stocks.find(x=>x.symbol===this._activeSymbol)||DB.getStockBySymbol(this._activeSymbol); const qty=parseInt(this._el('ticket-qty')?.value)||0; if(!s||qty<=0){UI.showToast('Enter a valid quantity.','error');return;} await this._executeTradePayload(s.symbol,this._tradeType,qty,s.price); },
  _openTradeModal(symbol, defaultType){ this._activeSymbol=symbol; this._tradeType=defaultType; this.selectStock(symbol); UI.showToast(`${symbol} loaded in professional live order ticket.`, 'info'); },

  async _executeTradePayload(symbol,type,qty,price){
    const livePrice = this._stocks.find(x=>x.symbol===symbol)?.price || price;
    const res=await window.ApiClient?.executeTrade?.({learnerId:this._userId,symbol,type,qty,price:livePrice});
    if(res?.success){ UI.showToast(`${type} ${qty} x ${symbol} executed at live CSV price ₹${Number(livePrice).toLocaleString('en-IN')}.`); if(res.data?.portfolio?.user && window.IndAIData){ const idx=IndAIData.users.findIndex(u=>u.id===this._userId); if(idx>=0) Object.assign(IndAIData.users[idx],res.data.portfolio.user); } }
    else { const r=DB.executeTrade(this._userId,symbol,type,qty,livePrice); if(!r.success){UI.showToast(r.message,'error');return;} UI.showToast(`${type} ${qty} x ${symbol} executed locally.`); }
    await this.renderPortfolio(); await this.renderMarket(); if(typeof renderStats==='function') renderStats(); if(typeof renderPortfolioGraph==='function') renderPortfolioGraph();
  },

  async renderWatchlist(){
    const el=this._el('watchlist-table'); if(!el)return;
    const listsRes=await window.ApiClient?.watchlists?.(this._userId); let symbols=[];
    if(listsRes?.success){ symbols=listsRes.data[0]?.symbols||[]; } else symbols=DB.getWatchlist(this._userId);
    await this._ensureStocks(); const stocks=symbols.map(sym=>this._stocks.find(s=>s.symbol===sym)||DB.getStockBySymbol(sym)).filter(Boolean);
    el.innerHTML = `<div class="pro-market-table"><div class="pro-table-head"><span>Symbol</span><span>Company</span><span>Price</span><span>Change</span><span>Action</span></div>${stocks.map(s=>`<div class="pro-row"><span><b>${s.symbol}</b></span><span>${s.name}</span><span>₹${Number(s.price).toLocaleString('en-IN')}</span><span class="${gainLossClass(s.change)}">${s.change>=0?'+':''}${s.change}%</span><span><button class="btn btn-green btn-sm" onclick="TradingUI.selectStock('${s.symbol}');switchTab('trading')">Trade</button></span></div>`).join('') || emptyState('WL','No watchlist symbols yet','Add stocks from the trading terminal.')}</div>`;
  },

  async addToWatchlist(sym){
    const lists=await window.ApiClient?.watchlists?.(this._userId); if(lists?.success && lists.data?.[0]) await window.ApiClient.addWatchSymbol(lists.data[0].id, sym); else DB.addToWatchlist(this._userId,sym);
    UI.showToast(`${sym} added to watchlist.`);
  },
  removeFromWatchlist(sym){ DB.removeFromWatchlist(this._userId,sym); this.renderWatchlist(); }, createWatchlist(){ DB.createWatchlist(this._userId); this.renderWatchlist(); }, deleteCurrentWatchlist(){ const a=DB.getActiveWatchlist(this._userId); if(a)DB.deleteWatchlist(this._userId,a.id); this.renderWatchlist(); }, switchWatchlist(id){ DB.setActiveWatchlist(this._userId,id); this.renderWatchlist(); }, searchToAdd(){},

  _updateLiveStatus(online, tick){
    const status=document.getElementById('live-status'), clock=document.getElementById('live-clock'), source=document.getElementById('pro-source');
    if(status) status.textContent = online ? `LIVE: backend replaying uploaded 1-minute CSV candles every ${Math.round((tick?.replaySpeedMs||this._tickMs)/1000)}s` : 'OFFLINE: local demo fallback';
    if(clock) clock.textContent = tick?.serverTime ? new Date(tick.serverTime).toLocaleTimeString('en-IN') : new Date().toLocaleTimeString('en-IN');
    if(source) source.textContent = online ? `CSV candle #${this._stocks.find(s=>s.symbol===this._activeSymbol)?.replayIndex ?? '-'} · ${this._stocks.find(s=>s.symbol===this._activeSymbol)?.lastTickAt ?? ''}` : 'Local fallback';
  },

  _drawChart(candles){
    const canvas=this._el('pro-chart'); if(!canvas||!candles?.length)return; const ctx=canvas.getContext('2d'); const box=canvas.parentElement; const dpr=window.devicePixelRatio||1; const w=Math.max(520,box.clientWidth-28), h=260; canvas.style.width=w+'px'; canvas.style.height=h+'px'; canvas.width=w*dpr; canvas.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
    const vals=candles.map(c=>+c.close); const min=Math.min(...vals)*0.998, max=Math.max(...vals)*1.002, pad=18;
    ctx.strokeStyle='#E5E7EB'; ctx.lineWidth=1; [0.25,0.5,0.75].forEach(r=>{ctx.beginPath();ctx.moveTo(pad,h*r);ctx.lineTo(w-pad,h*r);ctx.stroke();});
    const up = vals.at(-1) >= vals[0];
    const line = up ? '#16A34A' : '#DC2626';
    const grad=ctx.createLinearGradient(0,0,0,h); grad.addColorStop(0, up ? 'rgba(22,163,74,.20)' : 'rgba(220,38,38,.18)'); grad.addColorStop(1,'rgba(37,99,235,0)');
    ctx.beginPath(); vals.forEach((v,i)=>{const x=pad+(w-pad*2)*i/(vals.length-1); const y=h-pad-(v-min)/(max-min)*(h-pad*2); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);}); ctx.strokeStyle=line; ctx.lineWidth=2.4; ctx.stroke();
    ctx.lineTo(w-pad,h-pad); ctx.lineTo(pad,h-pad); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
    ctx.fillStyle='#64748B'; ctx.font='11px Inter, Arial'; ctx.fillText(`₹${Number(vals.at(-1)).toFixed(2)}`, w-86, 18); ctx.fillText(String(candles.at(-1)?.datetime||'').slice(11,16), w-62, h-8);
  }
};
