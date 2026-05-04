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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
function ageFromDate(dateString) {
    if (!dateString)
        return null;
    const dob = new Date(dateString);
    if (!Number.isFinite(dob.getTime()))
        return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate()))
        age--;
    return age;
}
let UsersService = class UsersService {
    constructor(db) {
        this.db = db;
    }
    findAll() { return this.db.users.map(u => this.db.safeUser(u)); }
    findByRole(role) {
        const normalized = (0, roles_decorator_1.normalizeRole)(role);
        if (!normalized)
            throw new common_1.BadRequestException('Invalid role.');
        return this.db.users.filter(u => u.role === normalized).map(u => this.db.safeUser(u));
    }
    findOne(id) {
        const user = this.db.getUser(id);
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        return this.db.safeUser(user);
    }
    create(dto) {
        const role = (0, roles_decorator_1.normalizeRole)(dto.role);
        if (!role)
            throw new common_1.BadRequestException('Invalid role.');
        const normalizedEmail = dto.email.toLowerCase().trim();
        if (this.db.findUserByEmail(normalizedEmail))
            throw new common_1.ConflictException('Email already registered.');
        if (dto.dateOfBirth && ageFromDate(dto.dateOfBirth) < 10) {
            throw new common_1.BadRequestException('You must be at least 10 years old.');
        }
        if (role === 'learner') {
            if (dto.institution && dto.studentId) {
                const institution = dto.institution.trim().toLowerCase();
                const studentId = dto.studentId.trim().toLowerCase();
                const duplicateStudent = this.db.users.some(u => u.role === 'learner' && String(u.institution || '').trim().toLowerCase() === institution && String(u.studentId || '').trim().toLowerCase() === studentId);
                if (duplicateStudent)
                    throw new common_1.ConflictException('Student ID already exists for this institution.');
            }
        }
        if (role === 'instructor') {
            if (!dto.institution)
                throw new common_1.BadRequestException('Institution / Organization is required for instructors.');
            if (!dto.expertise)
                throw new common_1.BadRequestException('Expertise / Specialization is required for instructors.');
            if (!dto.yearsExp)
                throw new common_1.BadRequestException('Years of experience is required for instructors.');
        }
        if (role === 'provider') {
            if (!dto.organization)
                throw new common_1.BadRequestException('Organization name is required for course providers.');
        }
        if (role === 'admin') {
            if (!dto.institution)
                throw new common_1.BadRequestException('Institution is required for admins.');
            if (!dto.authCode)
                throw new common_1.BadRequestException('Authorization code is required.');
            if (!dto.accessLevel)
                throw new common_1.BadRequestException('Admin access level is required.');
        }
        if (dto.instructorId) {
            const instructor = this.db.getUser(dto.instructorId);
            if (!instructor || instructor.role !== 'instructor')
                throw new common_1.NotFoundException('Instructor not found.');
        }
        const startingBalance = dto.startingBalance ?? (role === 'learner' ? 100000 : 0);
        const user = {
            id: this.db.id('u'),
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            email: normalizedEmail,
            password: dto.password,
            role,
            status: dto.status || 'active',
            skillPoints: 0,
            startingBalance,
            virtualBalance: startingBalance,
            portfolioValue: startingBalance,
            tradingLimit: dto.tradingLimit ?? (role === 'learner' ? 150000 : 0),
            instructorId: dto.instructorId,
            organization: dto.organization,
            expertise: dto.expertise,
            ...dto,
        };
        this.db.users.push(user);
        return this.db.safeUser(user);
    }
    update(id, dto) {
        const user = this.db.getUser(id);
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        if (dto.email) {
            const existing = this.db.findUserByEmail(dto.email);
            if (existing && existing.id !== id)
                throw new common_1.ConflictException('Email already registered.');
            dto.email = dto.email.toLowerCase().trim();
        }
        if (dto.instructorId) {
            const instructor = this.db.getUser(dto.instructorId);
            if (!instructor || instructor.role !== 'instructor')
                throw new common_1.NotFoundException('Instructor not found.');
        }
        Object.assign(user, dto);
        return this.db.safeUser(user);
    }
    remove(id) {
        const idx = this.db.users.findIndex(u => u.id === id);
        if (idx === -1)
            throw new common_1.NotFoundException('User not found.');
        this.db.users.splice(idx, 1);
        return { id };
    }
    portfolio(id) {
        const portfolio = this.db.refreshPortfolio(id);
        if (!portfolio)
            throw new common_1.NotFoundException('Learner not found.');
        return portfolio;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], UsersService);
//# sourceMappingURL=users.service.js.map