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
exports.DiagnosticController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let DiagnosticController = class DiagnosticController {
    constructor(db) {
        this.db = db;
    }
    submit(b) { const learner = this.db.getUser(b.learnerId); if (!learner || learner.role !== 'learner')
        throw new common_1.NotFoundException('Learner not found.'); const score = b.score; const level = score <= 40 ? 'BEGINNER' : score <= 75 ? 'INTERMEDIATE' : 'ADVANCED'; learner.learnerLevel = level; const row = { id: this.db.id('d'), learnerId: b.learnerId, score, level, submittedAt: new Date().toISOString() }; this.db.diagnostics.push(row); return { success: true, data: row }; }
    get(learnerId) { return { success: true, data: this.db.diagnostics.filter((d) => d.learnerId === learnerId) }; }
};
exports.DiagnosticController = DiagnosticController;
__decorate([
    (0, common_1.Post)('submit'),
    (0, roles_decorator_1.Roles)('superuser', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit diagnostic quiz and categorize learner' }),
    (0, swagger_1.ApiBody)({ type: dto_1.SubmitDiagnosticDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SubmitDiagnosticDto]),
    __metadata("design:returntype", void 0)
], DiagnosticController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('learner/:learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Get learner diagnostic results' }),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiagnosticController.prototype, "get", null);
exports.DiagnosticController = DiagnosticController = __decorate([
    (0, swagger_1.ApiTags)('Diagnostic'),
    (0, common_1.Controller)('diagnostic'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], DiagnosticController);
//# sourceMappingURL=diagnostic.controller.js.map