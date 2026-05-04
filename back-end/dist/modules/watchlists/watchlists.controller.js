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
exports.WatchlistsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const watchlists_service_1 = require("./watchlists.service");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let WatchlistsController = class WatchlistsController {
    constructor(service) {
        this.service = service;
    }
    list(userId) { return { success: true, data: this.service.list(userId) }; }
    create(userId, b) { return { success: true, data: this.service.create(userId, b) }; }
    addItem(userId, b) { const list = this.service.list(userId)[0]; return { success: true, data: this.service.addSymbol(list.id, b.symbol) }; }
    removeItem(userId, symbol) { const list = this.service.list(userId)[0]; return { success: true, data: this.service.removeSymbol(list.id, symbol) }; }
    update(id, b) { return { success: true, data: this.service.update(id, b) }; }
    add(id, symbol) { return { success: true, data: this.service.addSymbol(id, symbol) }; }
    remSym(id, symbol) { return { success: true, data: this.service.removeSymbol(id, symbol) }; }
    remove(id) { return { success: true, data: this.service.remove(id) }; }
};
exports.WatchlistsController = WatchlistsController;
__decorate([
    (0, common_1.Get)(':userId'),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'admin', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Get watchlists for user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WatchlistsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':userId'),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Create watchlist' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateWatchlistDto }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateWatchlistDto]),
    __metadata("design:returntype", void 0)
], WatchlistsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':userId/items'),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Add symbol to the first/default watchlist by user id' }),
    (0, swagger_1.ApiBody)({ type: dto_1.AddWatchlistSymbolDto }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddWatchlistSymbolDto]),
    __metadata("design:returntype", void 0)
], WatchlistsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Delete)(':userId/items/:symbol'),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove symbol from the first/default watchlist by user id' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WatchlistsController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Update watchlist symbols/name' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateWatchlistDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateWatchlistDto]),
    __metadata("design:returntype", void 0)
], WatchlistsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/symbols/:symbol'),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Add symbol to watchlist' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WatchlistsController.prototype, "add", null);
__decorate([
    (0, common_1.Delete)(':id/symbols/:symbol'),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove symbol from watchlist' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WatchlistsController.prototype, "remSym", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('learner', 'instructor', 'superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete watchlist' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WatchlistsController.prototype, "remove", null);
exports.WatchlistsController = WatchlistsController = __decorate([
    (0, swagger_1.ApiTags)('Watchlists'),
    (0, common_1.Controller)('watchlists'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [watchlists_service_1.WatchlistsService])
], WatchlistsController);
//# sourceMappingURL=watchlists.controller.js.map