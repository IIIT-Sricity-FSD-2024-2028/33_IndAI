import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiResponse } from '@nestjs/swagger';

export const ApiRoleHeader = () => applyDecorators(
  ApiHeader({
    name: 'x-role',
    required: true,
    description: 'Role for RBAC. Accepted: SUPER_USER, ADMIN, INSTRUCTOR, COURSE_PROVIDER, LEARNER. Lowercase frontend aliases also work: superuser, admin, instructor, provider, learner.',
    schema: { type: 'string', enum: ['SUPER_USER', 'ADMIN', 'INSTRUCTOR', 'COURSE_PROVIDER', 'LEARNER', 'superuser', 'admin', 'instructor', 'provider', 'learner'] },
  }),
  ApiHeader({
    name: 'x-user-id',
    required: false,
    description: 'Optional current user id used by the frontend session. Useful for owner checks and demo traceability.',
    schema: { type: 'string', example: 'u6' },
  }),
  ApiResponse({ status: 403, description: 'Forbidden: missing or unauthorized role header' }),
);
