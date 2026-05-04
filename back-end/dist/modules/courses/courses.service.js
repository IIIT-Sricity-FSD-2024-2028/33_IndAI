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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const data_store_1 = require("../../store/data.store");
let CoursesService = class CoursesService {
    constructor(db) {
        this.db = db;
    }
    findAll() { return this.db.courses; }
    findPublished() { return this.db.courses.filter((c) => c.status === 'published'); }
    findByProvider(providerId) { return this.db.courses.filter((c) => c.providerId === providerId); }
    findOne(id) { const row = this.db.courses.find((x) => x.id === id); if (!row)
        throw new common_1.NotFoundException('Course not found.'); return row; }
    create(body) {
        const provider = this.db.getUser(body.providerId);
        if (!provider || provider.role !== 'provider')
            throw new common_1.NotFoundException('Provider not found.');
        if (this.db.courses.some((c) => String(c.title).trim().toLowerCase() === body.title.trim().toLowerCase()))
            throw new common_1.ConflictException('Course title already exists.');
        const row = { id: this.db.id('c'), status: 'draft', enrolledCount: 0, completedCount: 0, rating: 0, ...body, title: body.title.trim(), description: body.description.trim(), createdAt: new Date().toISOString() };
        this.db.courses.push(row);
        return row;
    }
    update(id, body) { const row = this.findOne(id); if (body.providerId) {
        const provider = this.db.getUser(body.providerId);
        if (!provider || provider.role !== 'provider')
            throw new common_1.NotFoundException('Provider not found.');
    } if (body.title && this.db.courses.some((c) => c.id !== id && String(c.title).trim().toLowerCase() === body.title.trim().toLowerCase()))
        throw new common_1.ConflictException('Course title already exists.'); Object.assign(row, body); return row; }
    remove(id) { const idx = this.db.courses.findIndex((x) => x.id === id); if (idx === -1)
        throw new common_1.NotFoundException('Course not found.'); this.db.courses.splice(idx, 1); return { id }; }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], CoursesService);
//# sourceMappingURL=courses.service.js.map