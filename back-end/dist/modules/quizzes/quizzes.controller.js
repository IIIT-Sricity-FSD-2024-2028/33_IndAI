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
exports.QuizzesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let QuizzesController = class QuizzesController {
    constructor(db) {
        this.db = db;
    }
    all() { return { success: true, data: this.db.quizzes }; }
    one(id) { const q = this.db.quizzes.find((x) => x.id === id); if (!q)
        throw new common_1.NotFoundException('Quiz not found.'); return { success: true, data: q }; }
    create(b) { if (b.courseId && !this.db.ensureCourseExists(b.courseId))
        throw new common_1.NotFoundException('Course not found.'); if (Array.isArray(b.questions)) {
        for (const question of b.questions) {
            if (!question.q || !Array.isArray(question.options) || question.options.length < 2)
                throw new common_1.BadRequestException('Question and options are required.');
            if (question.ans === undefined || question.ans >= question.options.length)
                throw new common_1.BadRequestException('Correct answer must match one option.');
        }
    } const q = { id: this.db.id('q'), questions: [], ...b, createdAt: new Date().toISOString() }; this.db.quizzes.push(q); return { success: true, data: q }; }
    update(id, b) { const q = this.db.quizzes.find((x) => x.id === id); if (!q)
        throw new common_1.NotFoundException('Quiz not found.'); if (b.courseId && !this.db.ensureCourseExists(b.courseId))
        throw new common_1.NotFoundException('Course not found.'); if (Array.isArray(b.questions)) {
        for (const question of b.questions) {
            if (!question.q || !Array.isArray(question.options) || question.options.length < 2)
                throw new common_1.BadRequestException('Question and options are required.');
            if (question.ans === undefined || question.ans >= question.options.length)
                throw new common_1.BadRequestException('Correct answer must match one option.');
        }
    } Object.assign(q, b); return { success: true, data: q }; }
    remove(id) { const i = this.db.quizzes.findIndex((x) => x.id === id); if (i === -1)
        throw new common_1.NotFoundException('Quiz not found.'); this.db.quizzes.splice(i, 1); return { success: true, data: { id } }; }
    submit(id, b) { const q = this.db.quizzes.find((x) => x.id === id); if (!q)
        throw new common_1.NotFoundException('Quiz not found.'); if (!this.db.ensureLearnerExists(b.learnerId))
        throw new common_1.NotFoundException('Learner not found.'); const answers = b.answers || []; const score = (q.questions || []).reduce((s, question, i) => s + (answers[i] === question.ans ? 1 : 0), 0); return { success: true, data: { quizId: id, learnerId: b.learnerId, score, total: (q.questions || []).length } }; }
};
exports.QuizzesController = QuizzesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "all", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider', 'learner'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "one", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider'),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateQuizDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateQuizDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider'),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateQuizDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateQuizDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'provider'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)('superuser', 'learner'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit quiz answers' }),
    (0, swagger_1.ApiBody)({ type: dto_1.SubmitQuizDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SubmitQuizDto]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "submit", null);
exports.QuizzesController = QuizzesController = __decorate([
    (0, swagger_1.ApiTags)('Quizzes'),
    (0, common_1.Controller)('quizzes'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], QuizzesController);
//# sourceMappingURL=quizzes.controller.js.map