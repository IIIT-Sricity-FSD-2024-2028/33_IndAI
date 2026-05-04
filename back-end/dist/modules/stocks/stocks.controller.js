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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketAliasController = exports.StocksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stocks_service_1 = require("./stocks.service");
const swagger_role_header_1 = require("../../common/swagger-role-header");
let StocksController = class StocksController {
    constructor(service) {
        this.service = service;
    }
    findAll(q, sector, cap) {
        const rows = this.service.findAll(q, sector, cap);
        return { success: true, count: rows.length, data: rows };
    }
    tick(symbols) { return { success: true, data: this.service.tick(symbols) }; }
    findOne(symbol) { return { success: true, data: this.service.findOne(symbol) }; }
    candles(symbol, limit = '240') {
        const rows = this.service.candles(symbol, +limit || 240);
        return { success: true, count: rows.length, data: rows };
    }
};
exports.StocksController = StocksController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all stocks with live prices replayed from uploaded 1-minute CSV datasets' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('sector')),
    __param(2, (0, common_1.Query)('cap')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('live/tick'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one live market tick. Prices, percentages, movers and volumes change automatically from CSV candles' }),
    (0, swagger_1.ApiQuery)({ name: 'symbols', required: false, description: 'Optional comma-separated symbols like TCS,INFY,RELIANCE' }),
    __param(0, (0, common_1.Query)('symbols')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "tick", null);
__decorate([
    (0, common_1.Get)(':symbol'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one live stock quote by symbol' }),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':symbol/candles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get rolling minute-by-minute candles ending at current replay tick' }),
    __param(0, (0, common_1.Param)('symbol')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "candles", null);
exports.StocksController = StocksController = __decorate([
    (0, swagger_1.ApiTags)('Stocks'),
    (0, common_1.Controller)('stocks'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [stocks_service_1.StocksService])
], StocksController);
let MarketAliasController = class MarketAliasController {
    constructor(service) {
        this.service = service;
    }
    instruments(q, sector, cap) { const rows = this.service.findAll(q, sector, cap); return { success: true, count: rows.length, data: rows }; }
    instrument(symbol) { return { success: true, data: this.service.findOne(symbol) }; }
    prices(symbols) { return { success: true, data: this.service.tick(symbols) }; }
    patchPrice(symbol) { return { success: true, data: this.service.findOne(symbol) }; }
};
exports.MarketAliasController = MarketAliasController;
__decorate([
    (0, common_1.Get)('instruments'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias: list market instruments' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('sector')),
    __param(2, (0, common_1.Query)('cap')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MarketAliasController.prototype, "instruments", null);
__decorate([
    (0, common_1.Get)('instruments/:symbol'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias: get market instrument by symbol' }),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketAliasController.prototype, "instrument", null);
__decorate([
    (0, common_1.Get)('prices'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias: get live price tick for all instruments' }),
    __param(0, (0, common_1.Query)('symbols')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketAliasController.prototype, "prices", null);
__decorate([
    (0, common_1.Patch)('prices/:symbol'),
    (0, swagger_1.ApiOperation)({ summary: 'Demo endpoint: return latest live price for symbol' }),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketAliasController.prototype, "patchPrice", null);
exports.MarketAliasController = MarketAliasController = __decorate([
    (0, swagger_1.ApiTags)('Market'),
    (0, common_1.Controller)('market'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [stocks_service_1.StocksService])
], MarketAliasController);
//# sourceMappingURL=stocks.controller.js.map