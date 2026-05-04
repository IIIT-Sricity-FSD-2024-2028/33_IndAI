import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { normalizeRole, ROLES_KEY, Role } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!allowed || allowed.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const role = normalizeRole(req.headers['x-role']);

    if (!role) {
      throw new ForbiddenException('Missing x-role header. Allowed values: SUPER_USER, ADMIN, INSTRUCTOR, COURSE_PROVIDER, LEARNER.');
    }
    if (!allowed.includes(role)) {
      throw new ForbiddenException(`Role '${req.headers['x-role']}' is not allowed for this API.`);
    }

    req.userRole = role;
    return true;
  }
}
