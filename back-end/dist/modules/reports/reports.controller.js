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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
let ReportsController = class ReportsController {
    constructor(db) {
        this.db = db;
    }
    platform() { return { success: true, data: { users: this.db.users.length, learners: this.db.users.filter(u => u.role === 'learner').length, courses: this.db.courses.length, trades: this.db.trades.length, sessions: this.db.sessions.length, assignments: this.db.assignments.length, generatedAt: new Date().toISOString() } }; }
    learner(id) { const p = this.db.refreshPortfolio(id); return { success: true, data: { learnerId: id, totalTrades: p?.trades?.length || 0, portfolioValue: p?.user?.portfolioValue || 0, virtualBalance: p?.user?.virtualBalance || 0, skillPoints: p?.user?.skillPoints || 0, generatedAt: new Date().toISOString() } }; }
    course(id) { const course = this.db.courses.find((c) => c.id === id); const enrollments = this.db.enrollments.filter((e) => e.courseId === id); return { success: true, data: { course, enrollmentCount: enrollments.length, averageProgress: enrollments.length ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length) : 0 } }; }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('platform'),
    (0, roles_decorator_1.Roles)('superuser', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate platform performance report' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "platform", null);
__decorate([
    (0, common_1.Get)('learner/:learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate learner performance report' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "learner", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate course report' }),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "course", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, common_1.Controller)('reports'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map