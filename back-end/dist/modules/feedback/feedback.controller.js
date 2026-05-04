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
exports.FeedbackController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
const swagger_role_header_1 = require("../../common/swagger-role-header");
const dto_1 = require("./dto");
let FeedbackController = class FeedbackController {
    constructor(db) {
        this.db = db;
    }
    all() { return { success: true, data: this.db.feedback }; }
    learner(id) { return { success: true, data: this.db.feedback.filter((f) => f.learnerId === id) }; }
    create(b) { const instructor = this.db.getUser(b.instructorId); if (!instructor || instructor.role !== 'instructor')
        throw new common_1.NotFoundException('Instructor not found.'); if (!this.db.ensureLearnerExists(b.learnerId))
        throw new common_1.NotFoundException('Learner not found.'); const row = { id: this.db.id('f'), rating: 0, ...b, message: b.message.trim(), createdAt: new Date().toISOString() }; this.db.feedback.push(row); return { success: true, data: row }; }
    update(id, b) { const row = this.db.feedback.find((f) => f.id === id); if (!row)
        throw new common_1.NotFoundException('Feedback not found.'); Object.assign(row, b); return { success: true, data: row }; }
    remove(id) { const i = this.db.feedback.findIndex((f) => f.id === id); if (i === -1)
        throw new common_1.NotFoundException('Feedback not found.'); this.db.feedback.splice(i, 1); return { success: true, data: { id } }; }
};
exports.FeedbackController = FeedbackController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "all", null);
__decorate([
    (0, common_1.Get)('learner/:learnerId'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor', 'learner'),
    __param(0, (0, common_1.Param)('learnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "learner", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiOperation)({ summary: 'Create feedback' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateFeedbackDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateFeedbackDto]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateFeedbackDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateFeedbackDto]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('superuser', 'admin', 'instructor'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "remove", null);
exports.FeedbackController = FeedbackController = __decorate([
    (0, swagger_1.ApiTags)('Feedback'),
    (0, common_1.Controller)('feedback'),
    (0, swagger_role_header_1.ApiRoleHeader)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], FeedbackController);
//# sourceMappingURL=feedback.controller.js.map