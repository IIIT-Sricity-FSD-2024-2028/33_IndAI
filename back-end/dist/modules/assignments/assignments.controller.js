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
exports.AssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const assignments_service_1 = require("./assignments.service");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let AssignmentsController = class AssignmentsController {
    constructor(service) {
        this.service = service;
    }
    all() { return { success: true, data: this.service.findAll() }; }
    byLearner(learnerId) { return { success: true, data: this.service.findByLearner(learnerId) }; }
    one(id) { return { success: true, data: this.service.findOne(id) }; }
    create(b) { return { success: true, data: this.service.create(b) }; }
    update(id, b) { return { success: true, data: this.service.update(id, b) }; }
    submit(id, b) { return { success: true, data: this.service.submit(id, b.learnerId, b) }; }
    approve(id, learnerId) { return { success: true, data: this.service.approve(id, learnerId) }; }
    remove(id) { return { success: true, data: this.service.remove(id) }; }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'List assignments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "all", null);
__decorate([
    (0, common_1.Get)('learner/:learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'List learner assignments' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "byLearner", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one assignment' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "one", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Create assignment' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateAssignmentDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAssignmentDto]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Update assignment' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateAssignmentDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAssignmentDto]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)('superuser', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit assignment' }),
    (0, swagger_1.ApiBody)({ type: dto_1.SubmitAssignmentDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SubmitAssignmentDto]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/approve/:learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve learner assignment completion' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "approve", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete assignment' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "remove", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, swagger_1.ApiTags)('Assignments'),
    (0, common_1.Controller)('assignments'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map