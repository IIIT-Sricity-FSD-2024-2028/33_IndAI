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
exports.EnrollmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let EnrollmentsController = class EnrollmentsController {
    constructor(db) {
        this.db = db;
    }
    all() { return { success: true, data: this.db.enrollments }; }
    learner(id) { return { success: true, data: this.db.enrollments.filter((e) => e.learnerId === id) }; }
    create(b) { if (!this.db.ensureLearnerExists(b.learnerId))
        throw new common_1.NotFoundException('Learner not found.'); if (!this.db.ensureCourseExists(b.courseId))
        throw new common_1.NotFoundException('Course not found.'); if (this.db.enrollments.some((e) => e.learnerId === b.learnerId && e.courseId === b.courseId))
        throw new common_1.ConflictException('Learner is already enrolled in this course.'); const row = { id: this.db.id('e'), learnerId: b.learnerId, courseId: b.courseId, progress: 0, status: 'in_progress', enrolledAt: new Date().toISOString() }; this.db.enrollments.push(row); return { success: true, data: row }; }
    update(id, b) { const row = this.db.enrollments.find((e) => e.id === id); if (!row)
        throw new common_1.NotFoundException('Enrollment not found.'); row.progress = b.progress; row.status = b.status || (row.progress >= 100 ? 'completed' : 'in_progress'); return { success: true, data: row }; }
    remove(id) { const idx = this.db.enrollments.findIndex((e) => e.id === id); if (idx === -1)
        throw new common_1.NotFoundException('Enrollment not found.'); this.db.enrollments.splice(idx, 1); return { success: true, data: { id } }; }
};
exports.EnrollmentsController = EnrollmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'List enrollments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "all", null);
__decorate([
    (0, common_1.Get)('learner/:learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'List learner enrollments' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "learner", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll learner in course' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateEnrollmentDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateEnrollmentDto]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/progress'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Update enrollment progress' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateProgressDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateProgressDto]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete enrollment' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "remove", null);
exports.EnrollmentsController = EnrollmentsController = __decorate([
    (0, swagger_1.ApiTags)('Enrollments'),
    (0, common_1.Controller)('enrollments'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], EnrollmentsController);
//# sourceMappingURL=enrollments.controller.js.map