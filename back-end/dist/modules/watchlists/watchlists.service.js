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
exports.WatchlistsService = void 0;
const common_1 = require("@nestjs/common");
const data_store_1 = require("../../store/data.store");
let WatchlistsService = class WatchlistsService {
    constructor(db) {
        this.db = db;
    }
    list(userId) { const user = this.db.getUser(userId); if (!user)
        throw new common_1.NotFoundException('User not found.'); let rows = this.db.watchlists.filter(w => w.userId === userId); if (!rows.length) {
        rows = [{ id: this.db.id('wl'), userId, name: 'My Watchlist', active: true, symbols: ['TCS', 'RELIANCE', 'INFY'] }];
        this.db.watchlists.push(...rows);
    } return rows; }
    create(userId, b) { const user = this.db.getUser(userId); if (!user)
        throw new common_1.NotFoundException('User not found.'); const symbols = (b.symbols || []).map((s) => s.toUpperCase()); symbols.forEach((s) => this.assertStock(s)); const w = { id: this.db.id('wl'), userId, name: b.name || 'New Watchlist', active: false, symbols: [...new Set(symbols)] }; this.db.watchlists.push(w); return w; }
    update(id, b) { const w = this.db.watchlists.find(x => x.id === id); if (!w)
        throw new common_1.NotFoundException('Watchlist not found.'); if (b.symbols) {
        b.symbols = b.symbols.map((s) => s.toUpperCase());
        b.symbols.forEach((s) => this.assertStock(s));
        b.symbols = [...new Set(b.symbols)];
    } Object.assign(w, b); return w; }
    addSymbol(id, symbol) { const w = this.db.watchlists.find(x => x.id === id); if (!w)
        throw new common_1.NotFoundException('Watchlist not found.'); const sym = String(symbol || '').toUpperCase(); if (!sym)
        throw new common_1.BadRequestException('Symbol is required.'); this.assertStock(sym); if ((w.symbols || []).includes(sym))
        throw new common_1.ConflictException('Symbol already exists in watchlist.'); w.symbols = [...(w.symbols || []), sym]; return w; }
    removeSymbol(id, symbol) { const w = this.db.watchlists.find(x => x.id === id); if (!w)
        throw new common_1.NotFoundException('Watchlist not found.'); w.symbols = (w.symbols || []).filter(s => s !== String(symbol || '').toUpperCase()); return w; }
    remove(id) { const idx = this.db.watchlists.findIndex(w => w.id === id); if (idx === -1)
        throw new common_1.NotFoundException('Watchlist not found.'); this.db.watchlists.splice(idx, 1); return { id }; }
    assertStock(symbol) { const stock = this.db.stocks.find(s => s.symbol === symbol) || this.db.getStock(symbol); if (!stock)
        throw new common_1.NotFoundException('Stock symbol not found.'); }
};
exports.WatchlistsService = WatchlistsService;
exports.WatchlistsService = WatchlistsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], WatchlistsService);
//# sourceMappingURL=watchlists.service.js.map