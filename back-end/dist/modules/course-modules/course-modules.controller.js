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
exports.CourseModulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let CourseModulesController = class CourseModulesController {
    constructor(db) {
        this.db = db;
    }
    list(courseId) { return { success: true, data: this.db.courseModules.filter((m) => m.courseId === courseId).sort((a, b) => (a.order || 0) - (b.order || 0)) }; }
    create(courseId, b) { if (!this.db.ensureCourseExists(courseId))
        throw new common_1.NotFoundException('Course not found.'); if (this.db.courseModules.some((m) => m.courseId === courseId && String(m.title).trim().toLowerCase() === b.title.trim().toLowerCase()))
        throw new common_1.ConflictException('Module title already exists for this course.'); const row = { id: this.db.id('m'), courseId, ...b, title: b.title.trim(), createdAt: new Date().toISOString() }; this.db.courseModules.push(row); return { success: true, data: row }; }
    update(id, b) { const row = this.db.courseModules.find((m) => m.id === id); if (!row)
        throw new common_1.NotFoundException('Module not found.'); if (b.title && this.db.courseModules.some((m) => m.id !== id && m.courseId === row.courseId && String(m.title).trim().toLowerCase() === b.title.trim().toLowerCase()))
        throw new common_1.ConflictException('Module title already exists for this course.'); Object.assign(row, b); return { success: true, data: row }; }
    remove(id) { const i = this.db.courseModules.findIndex((m) => m.id === id); if (i === -1)
        throw new common_1.NotFoundException('Module not found.'); this.db.courseModules.splice(i, 1); return { success: true, data: { id } }; }
};
exports.CourseModulesController = CourseModulesController;
__decorate([
    (0, common_1.Get)('courses/:courseId/modules'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'List modules for a course' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseModulesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/modules'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Create course module' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateCourseModuleDto }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateCourseModuleDto]),
    __metadata("design:returntype", void 0)
], CourseModulesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('course-modules/:id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Update course module' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateCourseModuleDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateCourseModuleDto]),
    __metadata("design:returntype", void 0)
], CourseModulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('course-modules/:id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete course module' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseModulesController.prototype, "remove", null);
exports.CourseModulesController = CourseModulesController = __decorate([
    (0, swagger_1.ApiTags)('Course Modules'),
    (0, common_1.Controller)(),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], CourseModulesController);
//# sourceMappingURL=course-modules.controller.js.map