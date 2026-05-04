"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRoleHeader = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ApiRoleHeader = () => (0, common_1.applyDecorators)((0, swagger_1.ApiHeader)({
    name: 'x-role',
    required: true,
    description: 'Role for RBAC. Accepted: SUPER_USER, ADMIN, INSTRUCTOR, COURSE_PROVIDER, LEARNER. Lowercase frontend aliases also work: superuser, admin, instructor, provider, learner.',
    schema: { type: 'string', enum: ['SUPER_USER', 'ADMIN', 'INSTRUCTOR', 'COURSE_PROVIDER', 'LEARNER', 'superuser', 'admin', 'instructor', 'provider', 'learner'] },
}), (0, swagger_1.ApiHeader)({
    name: 'x-user-id',
    required: false,
    description: 'Optional current user id used by the frontend session. Useful for owner checks and demo traceability.',
    schema: { type: 'string', example: 'u6' },
}), (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden: missing or unauthorized role header' }));
exports.ApiRoleHeader = ApiRoleHeader;
//# sourceMappingURL=swagger-role-header.js.map