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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let AdminController = class AdminController {
    constructor(db) {
        this.db = db;
    }
    config() {
        return { success: true, data: this.db.config };
    }
    updateConfig(body) {
        if (!body || Object.keys(body).length === 0)
            throw new common_1.BadRequestException('At least one config field is required.');
        Object.assign(this.db.config, body);
        return { success: true, data: this.db.config };
    }
    assign(body) {
        const learner = this.db.getUser(body.learnerId);
        if (!learner || learner.role !== 'learner')
            throw new common_1.NotFoundException('Learner not found.');
        const instructor = this.db.getUser(body.instructorId);
        if (!instructor || instructor.role !== 'instructor')
            throw new common_1.NotFoundException('Instructor not found.');
        learner.instructorId = instructor.id;
        instructor.studentIds = [...new Set([...(instructor.studentIds || []), learner.id])];
        return { success: true, data: { learner: this.db.safeUser(learner), instructor: this.db.safeUser(instructor) } };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('config'),
    (0, roles_decorator_1.Roles)('superuser', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform config' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "config", null);
__decorate([
    (0, common_1.Patch)('config'),
    (0, roles_decorator_1.Roles)('superuser', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update platform config' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateConfigDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateConfigDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Post)('assign-instructor'),
    (0, roles_decorator_1.Roles)('superuser', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign instructor to learner' }),
    (0, swagger_1.ApiBody)({ type: dto_1.AssignInstructorDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AssignInstructorDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "assign", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], AdminController);
//# sourceMappingURL=admin.controller.js.map