"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStore = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let DataStore = class DataStore {
    constructor() {
        this.logger = new common_1.Logger('DataStore');
        this.users = [];
        this.stocks = [];
        this.candles = {};
        this.trades = [];
        this.marketStartedAt = Date.now();
        this.replaySpeedMs = 2000;
        this.watchlists = [];
        this.courses = [];
        this.assignments = [];
        this.sessions = [];
        this.notifications = [];
        this.enrollments = [];
        this.courseModules = [];
        this.quizzes = [];
        this.feedback = [];
        this.diagnostics = [];
        this.config = { maxDailyTrades: 10, defaultTradingLimit: 150000, maintenanceMode: false, platformName: 'IndAI' };
        this.names = {
            RELIANCE: { name: 'Reliance Industries', sector: 'Energy', cap: 'Large Cap' }, TCS: { name: 'Tata Consultancy Services', sector: 'IT', cap: 'Large Cap' }, INFY: { name: 'Infosys', sector: 'IT', cap: 'Large Cap' }, HDFCBANK: { name: 'HDFC Bank', sector: 'Banking', cap: 'Large Cap' }, ICICIBANK: { name: 'ICICI Bank', sector: 'Banking', cap: 'Large Cap' }, SBIN: { name: 'State Bank of India', sector: 'Banking', cap: 'Large Cap' }, AXISBANK: { name: 'Axis Bank', sector: 'Banking', cap: 'Mid Cap' }, KOTAKBANK: { name: 'Kotak Mahindra Bank', sector: 'Banking', cap: 'Large Cap' }, ITC: { name: 'ITC Limited', sector: 'FMCG', cap: 'Large Cap' }, HINDUNILVR: { name: 'Hindustan Unilever', sector: 'FMCG', cap: 'Large Cap' }, NESTLEIND: { name: 'Nestle India', sector: 'FMCG', cap: 'Large Cap' }, DABUR: { name: 'Dabur India', sector: 'FMCG', cap: 'Large Cap' }, BHARTIARTL: { name: 'Bharti Airtel', sector: 'Telecom', cap: 'Large Cap' }, SUNPHARMA: { name: 'Sun Pharmaceutical', sector: 'Pharma', cap: 'Large Cap' }, DRREDDY: { name: "Dr. Reddy's Laboratories", sector: 'Pharma', cap: 'Large Cap' }, CIPLA: { name: 'Cipla Limited', sector: 'Pharma', cap: 'Large Cap' }, MARUTI: { name: 'Maruti Suzuki', sector: 'Automobile', cap: 'Large Cap' }, 'BAJAJ-AUTO': { name: 'Bajaj Auto', sector: 'Automobile', cap: 'Large Cap' }, 'M&M': { name: 'Mahindra & Mahindra', sector: 'Automobile', cap: 'Large Cap' }, LT: { name: 'Larsen & Toubro', sector: 'Infrastructure', cap: 'Large Cap' }, ULTRACEMCO: { name: 'UltraTech Cement', sector: 'Infrastructure', cap: 'Large Cap' }, ADANIENT: { name: 'Adani Enterprises', sector: 'Infrastructure', cap: 'Large Cap' }, ADANIPORTS: { name: 'Adani Ports', sector: 'Infrastructure', cap: 'Mid Cap' }, WIPRO: { name: 'Wipro Limited', sector: 'IT', cap: 'Mid Cap' }, HCLTECH: { name: 'HCL Technologies', sector: 'IT', cap: 'Large Cap' }, TECHM: { name: 'Tech Mahindra', sector: 'IT', cap: 'Large Cap' }, MPHASIS: { name: 'Mphasis Limited', sector: 'IT', cap: 'Mid Cap' }, PERSISTENT: { name: 'Persistent Systems', sector: 'IT', cap: 'Mid Cap' }, TATAMOTORS: { name: 'Tata Motors', sector: 'Automobile', cap: 'Mid Cap' }, HEROMOTOCO: { name: 'Hero MotoCorp', sector: 'Automobile', cap: 'Mid Cap' }, EICHERMOT: { name: 'Eicher Motors', sector: 'Automobile', cap: 'Mid Cap' }, LUPIN: { name: 'Lupin Limited', sector: 'Pharma', cap: 'Mid Cap' }, DIVISLAB: { name: "Divi's Laboratories", sector: 'Pharma', cap: 'Mid Cap' }, ALKEM: { name: 'Alkem Laboratories', sector: 'Pharma', cap: 'Mid Cap' }, TITAN: { name: 'Titan Company', sector: 'Consumer', cap: 'Mid Cap' }, GODREJCP: { name: 'Godrej Consumer Products', sector: 'Consumer', cap: 'Mid Cap' }, MARICO: { name: 'Marico Limited', sector: 'FMCG', cap: 'Mid Cap' }, POWERGRID: { name: 'Power Grid Corp', sector: 'Power', cap: 'Mid Cap' }, NTPC: { name: 'NTPC Limited', sector: 'Power', cap: 'Mid Cap' }, TATAPOWER: { name: 'Tata Power Company', sector: 'Power', cap: 'Mid Cap' }, BAJFINANCE: { name: 'Bajaj Finance', sector: 'NBFC', cap: 'Mid Cap' }, BAJAJFINSV: { name: 'Bajaj Finserv', sector: 'NBFC', cap: 'Mid Cap' }, MUTHOOTFIN: { name: 'Muthoot Finance', sector: 'NBFC', cap: 'Mid Cap' }, NAUKRI: { name: 'Info Edge (Naukri)', sector: 'Technology', cap: 'Small Cap' }, INDIAMART: { name: 'IndiaMART InterMESH', sector: 'Technology', cap: 'Small Cap' }, PAYTM: { name: 'Paytm (One97 Comm.)', sector: 'Fintech', cap: 'Small Cap' }, POLICYBZR: { name: 'PB Fintech', sector: 'Fintech', cap: 'Small Cap' }, NYKAA: { name: 'Nykaa', sector: 'E-commerce', cap: 'Small Cap' }, SHOPERSTOP: { name: 'Shoppers Stop', sector: 'E-commerce', cap: 'Small Cap' }, AUROPHARMA: { name: 'Aurobindo Pharma', sector: 'Pharma', cap: 'Small Cap' }, GLENMARK: { name: 'Glenmark Pharmaceuticals', sector: 'Pharma', cap: 'Small Cap' }, ZEEL: { name: 'Zee Entertainment', sector: 'Media', cap: 'Small Cap' }, IRCTC: { name: 'IRCTC', sector: 'Travel', cap: 'Small Cap' }, ONGC: { name: 'Oil & Natural Gas Corp', sector: 'Energy', cap: 'Large Cap' }, BPCL: { name: 'Bharat Petroleum Corp', sector: 'Energy', cap: 'Large Cap' }, IOC: { name: 'Indian Oil Corporation', sector: 'Energy', cap: 'Large Cap' }, IDFCFIRSTB: { name: 'IDFC First Bank', sector: 'Banking', cap: 'Mid Cap' }, BALKRISIND: { name: 'Balkrishna Industries', sector: 'Automobile', cap: 'Mid Cap' }, BANDHANBNK: { name: 'Bandhan Bank', sector: 'Banking', cap: 'Mid Cap' }, TVSMOTOR: { name: 'TVS Motor', sector: 'Automobile', cap: 'Mid Cap' }
        };
    }
    onModuleInit() { this.seed(); this.loadCsvStocks(); this.logger.log(`Loaded ${this.stocks.length} stocks, ${Object.keys(this.candles).length} minute datasets, ${this.users.length} users.`); }
    id(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
    seed() {
        this.users = [
            { id: 'u1', firstName: 'Super', lastName: 'Admin', email: 'superadmin@indai.com', password: 'Admin@1234', role: 'superuser', status: 'active', skillPoints: 0, startingBalance: 0, virtualBalance: 0, portfolioValue: 0, tradingLimit: 0 },
            { id: 'u2', firstName: 'Priya', lastName: 'Sharma', email: 'admin@indai.com', password: 'Admin@1234', role: 'admin', status: 'active', skillPoints: 0, startingBalance: 0, virtualBalance: 0, portfolioValue: 0, tradingLimit: 0 },
            { id: 'u3', firstName: 'Dr. Amit', lastName: 'Singh', email: 'instructor@indai.com', password: 'Inst@1234', role: 'instructor', status: 'active', skillPoints: 0, startingBalance: 100000, virtualBalance: 100000, portfolioValue: 100000, tradingLimit: 150000, studentIds: ['u6'], expertise: 'Technical Analysis' },
            { id: 'u5', firstName: 'Course', lastName: 'Provider', email: 'provider@indai.com', password: 'Prov@1234', role: 'provider', status: 'active', skillPoints: 0, startingBalance: 0, virtualBalance: 0, portfolioValue: 0, tradingLimit: 0, organization: 'IndAI Academy' },
            { id: 'u6', firstName: 'Rahul', lastName: 'Sharma', email: 'learner@indai.com', password: 'Learn@1234', role: 'learner', status: 'active', skillPoints: 245, startingBalance: 100000, virtualBalance: 100000, portfolioValue: 100000, tradingLimit: 150000, instructorId: 'u3', learnerLevel: 'BEGINNER' }
        ];
        this.courses = [
            { id: 'c1', providerId: 'u5', title: 'Introduction to Stock Markets', description: 'Learn market basics safely.', category: 'Fundamentals', difficulty: 'BEGINNER', status: 'published', skillPoints: 25, lessons: 4, duration: '2 weeks', enrolledCount: 1, completedCount: 0, rating: 4.7 },
            { id: 'c2', providerId: 'u5', title: 'Technical Analysis Fundamentals', description: 'Charts, indicators and entry rules.', category: 'Technical Analysis', difficulty: 'INTERMEDIATE', status: 'published', skillPoints: 40, lessons: 6, duration: '3 weeks', enrolledCount: 0, completedCount: 0, rating: 4.5 }
        ];
        this.courseModules = [
            { id: 'm1', courseId: 'c1', title: 'Market Basics', type: 'video', duration: '15 min', order: 1 },
            { id: 'm2', courseId: 'c1', title: 'Risk and Reward', type: 'document', duration: '10 min', order: 2 }
        ];
        this.enrollments = [{ id: 'e1', learnerId: 'u6', courseId: 'c1', progress: 20, status: 'in_progress', enrolledAt: new Date().toISOString() }];
        this.assignments = [{ id: 'a1', title: 'Swing Trading Challenge', description: 'Create a swing trade plan.', instructorId: 'u3', studentIds: ['u6'], completedIds: [], status: 'active', dueDate: '2026-05-20', skillPoints: 50, difficulty: 'Medium' }];
        this.sessions = [{ id: 's1', title: 'Live Market Opening Review', description: 'Discuss market opening movement.', instructorId: 'u3', studentIds: ['u6'], status: 'scheduled', date: '2026-05-05', time: '09:15' }];
        this.quizzes = [{ id: 'q1', courseId: 'c1', title: 'Market Basics Quiz', questions: [{ q: 'What is paper trading?', options: ['Real money', 'Virtual trading', 'Tax filing'], ans: 1 }], createdBy: 'u5' }];
        this.feedback = [{ id: 'f1', instructorId: 'u3', learnerId: 'u6', message: 'Good start. Focus on risk management.', rating: 4, createdAt: new Date().toISOString() }];
        this.notifications = [{ id: 'n1', userId: 'u6', message: 'Welcome to Review-4 backend powered trading.', type: 'info', read: false, createdAt: new Date().toISOString() }];
    }
    loadCsvStocks() {
        const dir = path.join(process.cwd(), 'data', 'stocks');
        if (!fs.existsSync(dir))
            return;
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv')).sort();
        for (const file of files) {
            const symbol = file.replace('_1min.csv', '').replace('_1min_data.csv', '').toUpperCase();
            if (this.candles[symbol])
                continue;
            const candles = this.parseCsv(path.join(dir, file));
            if (!candles.length)
                continue;
            this.candles[symbol] = candles;
            const meta = this.names[symbol] || { name: `${symbol} Limited`, sector: 'Market', cap: 'Mid Cap' };
            if (!this.stocks.some(s => s.symbol === symbol))
                this.stocks.push(this.buildStockSnapshot(symbol, meta, candles, `data/stocks/${file}`));
        }
        const required = Object.keys(this.names);
        const base = this.candles['TCS'] || Object.values(this.candles)[0] || [];
        for (const symbol of required) {
            if (!this.stocks.some(s => s.symbol === symbol)) {
                const meta = this.names[symbol], factor = 0.35 + Math.random() * 2.5;
                const candles = base.map(c => ({ ...c, open: Number((c.open * factor).toFixed(2)), high: Number((c.high * factor).toFixed(2)), low: Number((c.low * factor).toFixed(2)), close: Number((c.close * factor).toFixed(2)) }));
                this.candles[symbol] = candles;
                this.stocks.push(this.buildStockSnapshot(symbol, meta, candles, 'fallback-from-TCS'));
            }
        }
        this.stocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    parseCsv(file) {
        const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(3);
        return lines.map(line => { const [datetime, , close, high, low, open, volume] = line.split(','); return { datetime, open: +open, high: +high, low: +low, close: +close, volume: +volume || 0 }; }).filter(c => c.datetime && c.close > 0);
    }
    fakeMarketCap(price) { return `${Math.max(0.08, price * 0.0012).toFixed(1)}L Cr`; }
    fakeVolume(candles) { const v = candles.slice(-390).reduce((s, c) => s + (c.volume || 0), 0); return v > 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${Math.round(v / 1000)}K`; }
    currentIndex(symbol) {
        const rows = this.candles[symbol.toUpperCase()] || [];
        if (!rows.length)
            return 0;
        return Math.floor((Date.now() - this.marketStartedAt) / this.replaySpeedMs) % rows.length;
    }
    buildStockSnapshot(symbol, meta, candles, dataSource, index) {
        const safe = candles.length ? candles : [{ datetime: new Date().toISOString(), open: 100, high: 101, low: 99, close: 100, volume: 0 }];
        const idx = index ?? this.currentIndex(symbol);
        const current = safe[idx % safe.length];
        const dayStart = safe[Math.max(0, idx - (idx % 390))] || safe[0];
        const visible = idx >= 239 ? safe.slice(idx - 239, idx + 1) : [...safe.slice(0, idx + 1), ...safe.slice(Math.max(0, safe.length - (239 - idx)))];
        const high = Math.max(...visible.map(c => c.high || c.close));
        const low = Math.min(...visible.map(c => c.low || c.close));
        const changeAbs = Number((current.close - dayStart.open).toFixed(2));
        const change = Number((((current.close - dayStart.open) / dayStart.open) * 100).toFixed(2));
        const volNum = visible.reduce((sum, c) => sum + (c.volume || 0), 0);
        return {
            symbol,
            name: meta.name,
            price: Number(current.close.toFixed(2)),
            change,
            changeAbs,
            open: Number(dayStart.open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            volume: volNum,
            cap: meta.cap,
            sector: meta.sector,
            marketCap: this.fakeMarketCap(current.close),
            vol: volNum > 1000000 ? `${(volNum / 1000000).toFixed(1)}M` : `${Math.round(volNum / 1000)}K`,
            dataSource,
            lastTickAt: current.datetime,
            replayIndex: idx
        };
    }
    getLiveStock(symbol) {
        const sym = symbol.toUpperCase();
        const candles = this.candles[sym] || [];
        const meta = this.names[sym] || { name: `${sym} Limited`, sector: 'Market', cap: 'Mid Cap' };
        const existing = this.stocks.find(s => s.symbol === sym);
        const live = this.buildStockSnapshot(sym, meta, candles, existing?.dataSource || 'fallback');
        if (existing)
            Object.assign(existing, live);
        else
            this.stocks.push(live);
        return live;
    }
    getLiveStocks() {
        return this.stocks.map(s => this.getLiveStock(s.symbol)).sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    getLiveCandles(symbol, limit = 240) {
        const sym = symbol.toUpperCase();
        const rows = this.candles[sym] || [];
        if (!rows.length)
            return [];
        const idx = this.currentIndex(sym);
        const count = Math.max(1, Math.min(limit || 240, rows.length));
        const out = [];
        for (let i = count - 1; i >= 0; i--) {
            out.push(rows[(idx - i + rows.length) % rows.length]);
        }
        return out;
    }
    getMarketTick(symbols) {
        const wanted = symbols?.length ? symbols.map(s => s.toUpperCase()) : this.stocks.map(s => s.symbol);
        const stocks = wanted.map(s => this.getLiveStock(s)).filter(Boolean);
        return {
            replaySpeedMs: this.replaySpeedMs,
            serverTime: new Date().toISOString(),
            stocks,
            movers: {
                gainers: [...stocks].sort((a, b) => b.change - a.change).slice(0, 5),
                losers: [...stocks].sort((a, b) => a.change - b.change).slice(0, 5),
                active: [...stocks].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 5)
            }
        };
    }
    getUser(id) { return this.users.find(u => u.id === id); }
    getStock(symbol) { return this.getLiveStock(symbol); }
    getHoldings(userId) {
        const h = {};
        for (const t of this.trades.filter(t => t.learnerId === userId)) {
            h[t.symbol] ||= { qty: 0, spent: 0 };
            if (t.type === 'BUY') {
                h[t.symbol].qty += t.qty;
                h[t.symbol].spent += t.total;
            }
            else {
                const avg = h[t.symbol].qty ? h[t.symbol].spent / h[t.symbol].qty : 0;
                h[t.symbol].qty = Math.max(0, h[t.symbol].qty - t.qty);
                h[t.symbol].spent = Math.max(0, h[t.symbol].spent - avg * t.qty);
            }
        }
        return h;
    }
    refreshPortfolio(userId) {
        const u = this.getUser(userId);
        if (!u)
            return null;
        const buy = this.trades.filter(t => t.learnerId === userId && t.type === 'BUY').reduce((s, t) => s + t.total, 0);
        const sell = this.trades.filter(t => t.learnerId === userId && t.type === 'SELL').reduce((s, t) => s + t.total, 0);
        const holdings = this.getHoldings(userId);
        const marketValue = Object.entries(holdings).reduce((sum, [sym, h]) => sum + (h.qty > 0 ? h.qty * (this.getStock(sym)?.price || 0) : 0), 0);
        u.virtualBalance = Number((u.startingBalance - buy + sell).toFixed(2));
        u.portfolioValue = Math.round(u.virtualBalance + marketValue);
        return { user: this.safeUser(u), holdings, marketValue, trades: this.trades.filter(t => t.learnerId === userId) };
    }
    findUserByEmail(email) { return this.users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase()); }
    safeUser(user) { if (!user)
        return null; const { password, ...safe } = user; return safe; }
    ensureCourseExists(courseId) { return this.courses.find(c => c.id === courseId); }
    ensureLearnerExists(learnerId) { return this.users.find(u => u.id === learnerId && u.role === 'learner'); }
};
exports.DataStore = DataStore;
exports.DataStore = DataStore = __decorate([
    (0, common_1.Injectable)()
], DataStore);
//# sourceMappingURL=data.store.js.map