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
exports.TradingAliasController = exports.TradesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trades_service_1 = require("./trades.service");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let TradesController = class TradesController {
    constructor(service) {
        this.service = service;
    }
    all() { return { success: true, data: this.service.findAll() }; }
    byUser(userId) { return { success: true, data: this.service.findByUser(userId) }; }
    create(dto) { return { success: true, data: this.service.execute(dto) }; }
};
exports.TradesController = TradesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'List all trades' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "all", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'List learner trades' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "byUser", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute paper BUY/SELL order' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateTradeDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTradeDto]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "create", null);
exports.TradesController = TradesController = __decorate([
    (0, swagger_1.ApiTags)('Trades'),
    (0, common_1.Controller)('trades'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [trades_service_1.TradesService])
], TradesController);
let TradingAliasController = class TradingAliasController {
    constructor(service) {
        this.service = service;
    }
    allOrders() { return { success: true, data: this.service.findAll() }; }
    learnerOrders(id) { return { success: true, data: this.service.findByUser(id) }; }
    allTrades() { return { success: true, data: this.service.findAll() }; }
    learnerTrades(id) { return { success: true, data: this.service.findByUser(id) }; }
    order(dto) { return { success: true, data: this.service.execute({ learnerId: dto.learnerId, symbol: dto.symbol, type: dto.orderType, qty: dto.quantity, price: dto.price, orderCategory: dto.orderCategory }) }; }
};
exports.TradingAliasController = TradingAliasController;
__decorate([
    (0, common_1.Get)('orders'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias: list all orders/trades' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TradingAliasController.prototype, "allOrders", null);
__decorate([
    (0, common_1.Get)('orders/learner/:learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias: list learner orders/trades' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingAliasController.prototype, "learnerOrders", null);
__decorate([
    (0, common_1.Get)('trades'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias: list all trades' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TradingAliasController.prototype, "allTrades", null);
__decorate([
    (0, common_1.Get)('trades/learner/:learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias: list learner trades' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingAliasController.prototype, "learnerTrades", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias: place paper trading order' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateOrderDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], TradingAliasController.prototype, "order", null);
exports.TradingAliasController = TradingAliasController = __decorate([
    (0, swagger_1.ApiTags)('Trading'),
    (0, common_1.Controller)('trading'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [trades_service_1.TradesService])
], TradingAliasController);
//# sourceMappingURL=trades.controller.js.map