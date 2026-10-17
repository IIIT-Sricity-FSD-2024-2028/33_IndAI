import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { DataStore, User } from '../../store/data.store';
import { normalizeRole } from '../../common/roles.decorator';
import { verifyPassword } from '../../common/password.util';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto';
import { LoginDto } from './dto';
import { JwtTokenService } from './jwt-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DataStore,
    private readonly usersService: UsersService,
    private readonly tokens: JwtTokenService,
  ) {}

  login(dto: LoginDto) {
    const user = this.db.findUserByEmail(dto.email);
    if (!user || !verifyPassword(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    if (user.status === 'pending') throw new UnauthorizedException('Account is pending Super Admin approval.');
    if (user.status === 'suspended' || user.status === 'disabled') throw new UnauthorizedException('Account is not active.');

    const requestedRole = normalizeRole(dto.role);
    if (requestedRole && requestedRole !== user.role) {
      throw new BadRequestException(`These credentials belong to a '${user.role}' account. Select the correct role.`);
    }

    return this.createAuthenticatedSession(user);
  }

  register(dto: CreateUserDto) {
    const user = this.usersService.create(dto, true) as User;
    // Instructor, Provider and Admin registrations are intentionally pending
    // and must not receive authenticated tokens before approval.
    if (user.status !== 'active') {
      return { user, pendingApproval: true };
    }
    return this.createAuthenticatedSession(this.db.getUser(user.id)!);
  }

  refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token cookie is missing. Please sign in again.');
    const payload = this.tokens.verifyRefresh(refreshToken);
    const session = this.db.refreshSessions.find((s:any) => s.jti === payload.jti && s.userId === payload.sub);
    if (!session || session.revokedAt) throw new UnauthorizedException('Refresh session is no longer valid.');
    if (new Date(session.expiresAt).getTime() <= Date.now()) throw new UnauthorizedException('Refresh session has expired.');
    if (session.tokenHash !== this.hashToken(refreshToken)) throw new UnauthorizedException('Refresh token does not match the active session.');

    const user = this.db.getUser(payload.sub);
    if (!user || user.status !== 'active') throw new UnauthorizedException('Account is not active.');
    if (user.role !== payload.role || (user.adminTeam || '') !== (payload.adminTeam || '')) {
      throw new UnauthorizedException('Account permissions changed. Please sign in again.');
    }

    session.revokedAt = new Date().toISOString();
    session.revokedReason = 'ROTATED';
    return this.createAuthenticatedSession(user, payload.jti);
  }

  logout(refreshToken?: string, userId?: string) {
    let revoked = 0;
    if (refreshToken) {
      try {
        const payload = this.tokens.verifyRefresh(refreshToken);
        for (const session of this.db.refreshSessions) {
          if (session.jti === payload.jti && !session.revokedAt) {
            session.revokedAt = new Date().toISOString();
            session.revokedReason = 'LOGOUT';
            revoked++;
          }
        }
      } catch {
        // Logout is idempotent: an expired/invalid refresh cookie can still be cleared.
      }
    }
    if (!refreshToken && userId) {
      for (const session of this.db.refreshSessions) {
        if (session.userId === userId && !session.revokedAt) {
          session.revokedAt = new Date().toISOString();
          session.revokedReason = 'LOGOUT_ALL';
          revoked++;
        }
      }
    }
    if (userId) this.db.audit('USER_LOGOUT', userId, { revokedRefreshSessions: revoked });
    return { loggedOut: true, revokedRefreshSessions: revoked };
  }

  me(userId: string) {
    const user = this.db.getUser(userId);
    if (!user) throw new BadRequestException('User not found.');
    return this.db.safeUser(user);
  }

  meAs(requesterId: string, targetId?: string) {
    const requester = this.db.getUser(requesterId);
    if (!requester || requester.status !== 'active') throw new UnauthorizedException('Authenticated user is not active.');
    if (!targetId || targetId === requesterId) return this.db.safeUser(requester);
    if (!['superuser', 'admin', 'instructor'].includes(requester.role)) {
      throw new ForbiddenException('You can only view your own authenticated profile.');
    }
    return this.me(targetId);
  }

  private createAuthenticatedSession(user: User, rotatedFromJti?: string) {
    const pair = this.tokens.issueTokenPair(user);
    this.db.refreshSessions.push({
      id: this.db.id('refresh'),
      userId: user.id,
      jti: pair.refreshPayload.jti,
      tokenHash: this.hashToken(pair.refreshToken),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(pair.refreshPayload.exp * 1000).toISOString(),
      rotatedFromJti: rotatedFromJti || null,
      revokedAt: null,
    });
    this.cleanupRefreshSessions(user.id);
    this.db.audit('JWT_SESSION_ISSUED', user.id, {
      accessJti: pair.accessPayload.jti,
      refreshJti: pair.refreshPayload.jti,
      accessExpiresAt: new Date(pair.accessPayload.exp * 1000).toISOString(),
    });
    return {
      user: this.db.safeUser(user),
      session: {
        userId: user.id,
        role: user.role,
        adminTeam: user.adminTeam || null,
        email: user.email,
        loginAt: new Date().toISOString(),
      },
      accessToken: pair.accessToken,
      accessTokenExpiresIn: pair.accessExpiresIn,
      refreshToken: pair.refreshToken,
      refreshTokenExpiresIn: pair.refreshExpiresIn,
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private cleanupRefreshSessions(userId: string) {
    const now = Date.now();
    this.db.refreshSessions = this.db.refreshSessions.filter((s:any) => {
      if (s.userId !== userId) return true;
      const expired = new Date(s.expiresAt).getTime() <= now;
      const oldRevoked = s.revokedAt && now - new Date(s.revokedAt).getTime() > 24 * 60 * 60 * 1000;
      return !expired && !oldRevoked;
    });
  }
}
