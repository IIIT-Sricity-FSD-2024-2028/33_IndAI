"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StocksService = void 0;
const common_1 = require("@nestjs/common");
const data_store_1 = require("../../store/data.store");
let StocksService = class StocksService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger('StocksService');
    }
    findAll(q, sector, cap) {
        let rows = this.db.getLiveStocks();
        if (q)
            rows = rows.filter(s => s.symbol.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase()));
        if (sector && sector !== 'All')
            rows = rows.filter(s => s.sector === sector);
        if (cap && cap !== 'All')
            rows = rows.filter(s => s.cap === cap);
        this.logger.log(`LIVE MARKET LIST -> ${rows.length} stocks from 1-minute CSV replay`);
        return rows;
    }
    findOne(symbol) {
        const stock = this.db.getLiveStock(symbol);
        this.logger.log(`LIVE QUOTE ${stock.symbol} -> ₹${stock.price} (${stock.change}%) candle#${stock.replayIndex}`);
        return stock;
    }
    candles(symbol, limit = 240) {
        const rows = this.db.getLiveCandles(symbol, limit);
        this.logger.log(`LIVE CANDLES ${symbol.toUpperCase()} -> ${rows.length} rows ending ${rows[rows.length - 1]?.datetime}`);
        return rows;
    }
    tick(symbols) {
        const list = symbols ? symbols.split(',').map(s => s.trim()).filter(Boolean) : undefined;
        const tick = this.db.getMarketTick(list);
        this.logger.log(`LIVE TICK -> ${tick.stocks.length} stocks, replay speed ${tick.replaySpeedMs}ms`);
        return tick;
    }
};
exports.StocksService = StocksService;
exports.StocksService = StocksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], StocksService);
//# sourceMappingURL=stocks.service.js.map