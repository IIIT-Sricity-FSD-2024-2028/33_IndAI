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
exports.CoursesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const courses_service_1 = require("./courses.service");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let CoursesController = class CoursesController {
    constructor(service) {
        this.service = service;
    }
    all() { return { success: true, data: this.service.findAll() }; }
    published() { return { success: true, data: this.service.findPublished() }; }
    byProvider(providerId) { return { success: true, data: this.service.findByProvider(providerId) }; }
    one(id) { return { success: true, data: this.service.findOne(id) }; }
    create(b) { return { success: true, data: this.service.create(b) }; }
    update(id, b) { return { success: true, data: this.service.update(id, b) }; }
    remove(id) { return { success: true, data: this.service.remove(id) }; }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'List courses' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "all", null);
__decorate([
    (0, common_1.Get)('published'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'List published courses' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "published", null);
__decorate([
    (0, common_1.Get)('provider/:providerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'List courses by provider' }),
    __param(0, (0, common_1.Param)('providerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "byProvider", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one course' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "one", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Create course' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateCourseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCourseDto]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Update course' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateCourseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateCourseDto]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete course' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "remove", null);
exports.CoursesController = CoursesController = __decorate([
    (0, swagger_1.ApiTags)('Courses'),
    (0, common_1.Controller)('courses'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [courses_service_1.CoursesService])
], CoursesController);
//# sourceMappingURL=courses.controller.js.map