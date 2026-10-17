import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataStore } from '../store/data.store';
import { JwtTokenService } from '../modules/auth/jwt-token.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: JwtTokenService,
    private readonly db: DataStore,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const token = this.extractBearer(req.headers?.authorization);
    if (!token) throw new UnauthorizedException('Missing Authorization Bearer token. Please sign in.');

    const payload = this.tokens.verifyAccess(token);
    const user = this.db.getUser(payload.sub);
    if (!user || user.status !== 'active') throw new UnauthorizedException('The authenticated account is no longer active.');
    if (user.role !== payload.role) throw new UnauthorizedException('Your account role changed. Please sign in again.');
    if (user.role === 'admin' && (user.adminTeam || '') !== (payload.adminTeam || '')) {
      throw new UnauthorizedException('Your admin division changed. Please sign in again.');
    }

    // JWT is the source of identity. Legacy headers are overwritten so old
    // controllers/services remain compatible without trusting browser input.
    req.user = this.db.safeUser(user);
    req.auth = payload;
    req.userId = user.id;
    req.userRole = user.role;
    req.headers['x-user-id'] = user.id;
    req.headers['x-role'] = user.role;
    if (user.adminTeam) req.headers['x-admin-team'] = user.adminTeam;
    req.headers['x-user-email'] = user.email;
    return true;
  }

  private extractBearer(value?: string | string[]) {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) return '';
    const match = String(raw).match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : '';
  }
}
