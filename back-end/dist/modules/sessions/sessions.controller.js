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
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sessions_service_1 = require("./sessions.service");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let SessionsController = class SessionsController {
    constructor(service) {
        this.service = service;
    }
    all() { return { success: true, data: this.service.findAll() }; }
    byLearner(learnerId) { return { success: true, data: this.service.findByLearner(learnerId) }; }
    one(id) { return { success: true, data: this.service.findOne(id) }; }
    create(b) { return { success: true, data: this.service.create(b) }; }
    update(id, b) { return { success: true, data: this.service.update(id, b) }; }
    remove(id) { return { success: true, data: this.service.remove(id) }; }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'List sessions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "all", null);
__decorate([
    (0, common_1.Get)('learner/:learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'List learner sessions' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "byLearner", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one session' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "one", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Create session' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateSessionDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Update session' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateSessionDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete session' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "remove", null);
exports.SessionsController = SessionsController = __decorate([
    (0, swagger_1.ApiTags)('Sessions'),
    (0, common_1.Controller)('sessions'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map