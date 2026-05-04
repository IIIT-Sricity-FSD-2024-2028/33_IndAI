"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.roleAliases = exports.ROLES_KEY = void 0;
exports.normalizeRole = normalizeRole;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
exports.roleAliases = {
    superuser: 'superuser',
    super_user: 'superuser',
    SUPER_USER: 'superuser',
    'SUPER USER': 'superuser',
    admin: 'admin',
    ADMIN: 'admin',
    instructor: 'instructor',
    INSTRUCTOR: 'instructor',
    provider: 'provider',
    course_provider: 'provider',
    COURSE_PROVIDER: 'provider',
    'COURSE PROVIDER': 'provider',
    learner: 'learner',
    LEARNER: 'learner',
};
function normalizeRole(value) {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw)
        return '';
    const trimmed = String(raw).trim();
    return exports.roleAliases[trimmed] || exports.roleAliases[trimmed.toUpperCase()] || exports.roleAliases[trimmed.toLowerCase()] || '';
}
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
//# sourceMappingURL=roles.decorator.js.map