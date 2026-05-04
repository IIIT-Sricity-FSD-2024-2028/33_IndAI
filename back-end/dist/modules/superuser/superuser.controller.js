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
exports.SuperuserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
let SuperuserController = class SuperuserController {
    constructor(db) {
        this.db = db;
    }
    overview() { return { success: true, data: { users: this.db.users.length, courses: this.db.courses.length, trades: this.db.trades.length, notifications: this.db.notifications.length } }; }
    allData() { const users = this.db.users.map(u => this.db.safeUser(u)); return { success: true, data: { ...this.db, users } }; }
    reset() { this.db.onModuleInit(); return { success: true, message: 'Demo data reset' }; }
};
exports.SuperuserController = SuperuserController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, roles_decorator_1.Roles)('superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Super User system overview' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperuserController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('all-data'),
    (0, roles_decorator_1.Roles)('superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Super User full in-memory repository snapshot' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperuserController.prototype, "allData", null);
__decorate([
    (0, common_1.Post)('reset-demo-data'),
    (0, roles_decorator_1.Roles)('superuser'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset demo data by restarting in-memory seed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperuserController.prototype, "reset", null);
exports.SuperuserController = SuperuserController = __decorate([
    (0, swagger_1.ApiTags)('Superuser'),
    (0, common_1.Controller)('superuser'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], SuperuserController);
//# sourceMappingURL=superuser.controller.js.map