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
exports.PortfolioController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const users_service_1 = require("../users/users.service");
let PortfolioController = class PortfolioController {
    constructor(users) {
        this.users = users;
    }
    one(id) { return { success: true, data: this.users.portfolio(id) }; }
    holdings(id) { return { success: true, data: this.users.portfolio(id).holdings }; }
    performance(id) { const p = this.users.portfolio(id); const trades = p.trades || []; const profitable = trades.filter((t) => t.type === 'SELL').length; return { success: true, data: { portfolioValue: p.user.portfolioValue, virtualBalance: p.user.virtualBalance, totalTrades: trades.length, profitableTrades: profitable, marketValue: p.marketValue } }; }
};
exports.PortfolioController = PortfolioController;
__decorate([
    (0, common_1.Get)(':learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Get learner portfolio' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "one", null);
__decorate([
    (0, common_1.Get)(':learnerId/holdings'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Get learner holdings' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "holdings", null);
__decorate([
    (0, common_1.Get)(':learnerId/performance'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Get learner performance summary' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "performance", null);
exports.PortfolioController = PortfolioController = __decorate([
    (0, swagger_1.ApiTags)('Portfolio'),
    (0, common_1.Controller)('portfolio'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], PortfolioController);
//# sourceMappingURL=portfolio.controller.js.map