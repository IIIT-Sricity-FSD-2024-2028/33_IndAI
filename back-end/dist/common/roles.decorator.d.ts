export declare const ROLES_KEY = "roles";
export type Role = 'superuser' | 'admin' | 'instructor' | 'provider' | 'learner';
export declare const roleAliases: Record<string, Role>;
export declare function normalizeRole(value?: string | string[]): Role | '';
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
