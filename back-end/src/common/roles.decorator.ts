import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type Role = 'superuser' | 'admin' | 'instructor' | 'provider' | 'learner';

export const roleAliases: Record<string, Role> = {
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

export function normalizeRole(value?: string | string[]): Role | '' {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return '';
  const trimmed = String(raw).trim();
  return roleAliases[trimmed] || roleAliases[trimmed.toUpperCase()] || roleAliases[trimmed.toLowerCase()] || '';
}

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
