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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const data_store_1 = require("../../store/data.store");
function assertFutureWithin365(dateValue) { const d = new Date(String(dateValue || '')); const now = new Date(); now.setHours(0, 0, 0, 0); const max = new Date(now); max.setDate(max.getDate() + 365); if (!Number.isFinite(d.getTime()) || d <= now || d > max)
    throw new common_1.BadRequestException('Due date must be within the next 365 days.'); }
let AssignmentsService = class AssignmentsService {
    constructor(db) {
        this.db = db;
    }
    findAll() { return this.db.assignments; }
    findOne(id) { const row = this.db.assignments.find((x) => x.id === id); if (!row)
        throw new common_1.NotFoundException('Assignment not found.'); return row; }
    findByLearner(learnerId) { return this.db.assignments.filter((a) => (a.studentIds || []).includes(learnerId)); }
    create(body) {
        const instructor = this.db.getUser(body.instructorId);
        if (!instructor || instructor.role !== 'instructor')
            throw new common_1.NotFoundException('Instructor not found.');
        assertFutureWithin365(body.dueDate);
        for (const id of body.studentIds || []) {
            if (!this.db.ensureLearnerExists(id))
                throw new common_1.NotFoundException(`Learner not found: ${id}`);
        }
        const row = { id: this.db.id('a'), completedIds: [], status: 'active', ...body, title: body.title.trim(), description: body.description.trim(), createdAt: new Date().toISOString() };
        this.db.assignments.push(row);
        return row;
    }
    update(id, body) { const row = this.findOne(id); if (body.instructorId) {
        const instructor = this.db.getUser(body.instructorId);
        if (!instructor || instructor.role !== 'instructor')
            throw new common_1.NotFoundException('Instructor not found.');
    } if (body.dueDate)
        assertFutureWithin365(body.dueDate); for (const sid of body.studentIds || []) {
        if (!this.db.ensureLearnerExists(sid))
            throw new common_1.NotFoundException(`Learner not found: ${sid}`);
    } Object.assign(row, body); return row; }
    submit(id, learnerId, body = {}) { const row = this.findOne(id); if (!learnerId)
        throw new common_1.BadRequestException('learnerId is required.'); if (!this.db.ensureLearnerExists(learnerId))
        throw new common_1.NotFoundException('Learner not found.'); if (row.studentIds?.length && !row.studentIds.includes(learnerId))
        throw new common_1.BadRequestException('Learner is not assigned to this assignment.'); row.submissions = row.submissions || []; if (row.submissions.some((s) => s.learnerId === learnerId))
        throw new common_1.ConflictException('Assignment already submitted by this learner.'); row.submissions.push({ learnerId, submittedAt: new Date().toISOString(), ...body }); return row; }
    approve(id, learnerId) { const row = this.findOne(id); if (!this.db.ensureLearnerExists(learnerId))
        throw new common_1.NotFoundException('Learner not found.'); row.completedIds = [...new Set([...(row.completedIds || []), learnerId])]; const learner = this.db.getUser(learnerId); if (learner)
        learner.skillPoints = (learner.skillPoints || 0) + (row.skillPoints || 0); return row; }
    remove(id) { const idx = this.db.assignments.findIndex((x) => x.id === id); if (idx === -1)
        throw new common_1.NotFoundException('Assignment not found.'); this.db.assignments.splice(idx, 1); return { id }; }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map