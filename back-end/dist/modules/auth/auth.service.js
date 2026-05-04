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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const data_store_1 = require("../../store/data.store");
const roles_decorator_1 = require("../../common/roles.decorator");
let AuthService = class AuthService {
    constructor(db) {
        this.db = db;
    }
    login(dto) {
        const user = this.db.findUserByEmail(dto.email);
        if (!user || user.password !== dto.password) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        if (user.status === 'pending')
            throw new common_1.UnauthorizedException('Account is pending approval.');
        if (user.status === 'suspended' || user.status === 'disabled')
            throw new common_1.UnauthorizedException('Account is not active.');
        const requestedRole = (0, roles_decorator_1.normalizeRole)(dto.role);
        if (requestedRole && requestedRole !== user.role) {
            throw new common_1.BadRequestException(`These credentials belong to a '${user.role}' account. Select the correct role.`);
        }
        return {
            user: this.db.safeUser(user),
            session: { userId: user.id, role: user.role, email: user.email, loginAt: new Date().toISOString() },
        };
    }
    me(userId) {
        const user = this.db.getUser(userId);
        if (!user)
            throw new common_1.BadRequestException('User not found.');
        return this.db.safeUser(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], AuthService);
//# sourceMappingURL=auth.service.js.map