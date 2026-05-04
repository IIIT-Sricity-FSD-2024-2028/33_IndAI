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
exports.TradesService = void 0;
const common_1 = require("@nestjs/common");
const data_store_1 = require("../../store/data.store");
let TradesService = class TradesService {
    constructor(db) {
        this.db = db;
    }
    findAll() { return this.db.trades; }
    findByUser(userId) { return this.db.trades.filter(t => t.learnerId === userId); }
    execute(dto) {
        const user = this.db.getUser(dto.learnerId);
        if (!user || user.role !== 'learner')
            throw new common_1.NotFoundException('Learner not found.');
        const sym = dto.symbol.toUpperCase();
        const exists = this.db.stocks.some(s => s.symbol === sym);
        if (!exists)
            throw new common_1.NotFoundException('Stock symbol not found.');
        const stock = this.db.getStock(sym);
        if (!stock)
            throw new common_1.NotFoundException('Stock not found.');
        const qty = Number(dto.qty);
        const price = Number(dto.price || stock.price);
        if (!Number.isInteger(qty) || qty <= 0)
            throw new common_1.BadRequestException('Quantity must be a positive whole number.');
        if (!(price > 0))
            throw new common_1.BadRequestException('Price must be positive.');
        const total = Number((qty * price).toFixed(2));
        const before = this.db.refreshPortfolio(dto.learnerId);
        if (dto.type === 'BUY' && (before?.user.virtualBalance || 0) < total)
            throw new common_1.BadRequestException(`Insufficient virtual balance. Available ₹${before?.user.virtualBalance}`);
        if (dto.type === 'BUY' && total > (user.tradingLimit || 100000))
            throw new common_1.BadRequestException(`Order exceeds trading limit ₹${user.tradingLimit}`);
        if (dto.type === 'SELL') {
            const held = (before?.holdings?.[sym]?.qty) || 0;
            if (held < qty)
                throw new common_1.BadRequestException(`Only ${held} shares available to sell.`);
        }
        const trade = { id: this.db.id('t'), learnerId: dto.learnerId, symbol: sym, type: dto.type, qty, price, total, date: new Date().toISOString(), status: 'executed' };
        this.db.trades.push(trade);
        const portfolio = this.db.refreshPortfolio(dto.learnerId);
        this.db.notifications.push({ id: this.db.id('n'), userId: dto.learnerId, message: `${dto.type} ${qty} ${sym} executed at ₹${price}`, type: 'trade', read: false, createdAt: new Date().toISOString() });
        return { trade, portfolio };
    }
};
exports.TradesService = TradesService;
exports.TradesService = TradesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], TradesService);
//# sourceMappingURL=trades.service.js.map