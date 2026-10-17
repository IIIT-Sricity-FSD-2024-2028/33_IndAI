import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'crypto';
import { User } from '../../store/data.store';

export type JwtTokenType = 'access' | 'refresh';

export interface JwtPayload {
  sub: string;
  email: string;
  role: User['role'];
  adminTeam?: User['adminTeam'];
  type: JwtTokenType;
  jti: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

@Injectable()
export class JwtTokenService {
  private readonly logger = new Logger('JWT');
  private readonly issuer = 'indai-api';
  private readonly audience = 'indai-web';
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor() {
    this.accessSecret = this.resolveSecret('JWT_SECRET');
    this.refreshSecret = this.resolveSecret('JWT_REFRESH_SECRET');
    this.accessTtlSeconds = this.parseDuration(process.env.JWT_ACCESS_EXPIRES_IN || '15m', 15 * 60);
    this.refreshTtlSeconds = this.parseDuration(process.env.JWT_REFRESH_EXPIRES_IN || '7d', 7 * 24 * 60 * 60);
  }

  private resolveSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET') {
    const configured = String(process.env[name] || '').trim();
    if (configured.length >= 32 && !/replace|change[_-]?me/i.test(configured)) return configured;
    if(process.env.NODE_ENV==='production')throw Error(name+' must be configured with a 32+ character random secret in production.');
    const generated = randomBytes(64).toString('hex');
    this.logger.warn(`${name} is not configured. A temporary runtime-only secret was generated. Set a 32+ character value in back-end/.env before deployment.`);
    return generated;
  }

  private parseDuration(value: string, fallback: number) {
    const raw = String(value || '').trim().toLowerCase();
    if (/^\d+$/.test(raw)) return Math.max(60, Number(raw));
    const match = raw.match(/^(\d+)\s*(s|m|h|d)$/);
    if (!match) return fallback;
    const n = Number(match[1]);
    const multiplier = match[2] === 'd' ? 86400 : match[2] === 'h' ? 3600 : match[2] === 'm' ? 60 : 1;
    return Math.max(60, n * multiplier);
  }

  private encode(value: unknown) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private signData(data: string, secret: string) {
    return createHmac('sha256', secret).update(data).digest('base64url');
  }

  private sign(user: User, type: JwtTokenType, ttlSeconds: number) {
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(user.adminTeam ? { adminTeam: user.adminTeam } : {}),
      type,
      jti: randomUUID(),
      iat: now,
      exp: now + ttlSeconds,
      iss: this.issuer,
      aud: this.audience,
    };
    const header = { alg: 'HS256', typ: 'JWT' };
    const unsigned = `${this.encode(header)}.${this.encode(payload)}`;
    const secret = type === 'access' ? this.accessSecret : this.refreshSecret;
    return { token: `${unsigned}.${this.signData(unsigned, secret)}`, payload };
  }

  issueTokenPair(user: User) {
    const access = this.sign(user, 'access', this.accessTtlSeconds);
    const refresh = this.sign(user, 'refresh', this.refreshTtlSeconds);
    return {
      accessToken: access.token,
      refreshToken: refresh.token,
      accessPayload: access.payload,
      refreshPayload: refresh.payload,
      accessExpiresIn: this.accessTtlSeconds,
      refreshExpiresIn: this.refreshTtlSeconds,
    };
  }

  verifyAccess(token: string) {
    return this.verify(token, 'access');
  }

  verifyRefresh(token: string) {
    return this.verify(token, 'refresh');
  }

  private verify(token: string, expectedType: JwtTokenType): JwtPayload {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) throw new UnauthorizedException('Invalid JWT format.');
    const [encodedHeader, encodedPayload, signature] = parts;
    let header: any;
    let payload: JwtPayload;
    try {
      header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
      payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid JWT payload.');
    }
    if (header?.alg !== 'HS256' || header?.typ !== 'JWT') throw new UnauthorizedException('Unsupported JWT algorithm.');
    if (payload?.type !== expectedType) throw new UnauthorizedException(`Expected a ${expectedType} token.`);
    if (payload?.iss !== this.issuer || payload?.aud !== this.audience) throw new UnauthorizedException('JWT issuer/audience mismatch.');
    if (!payload?.sub || !payload?.jti || !payload?.exp) throw new UnauthorizedException('JWT is missing required claims.');
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) throw new UnauthorizedException('JWT has expired.');
    if (payload.iat > now + 60) throw new UnauthorizedException('JWT issued-at time is invalid.');

    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const secret = expectedType === 'access' ? this.accessSecret : this.refreshSecret;
    const expected = this.signData(unsigned, secret);
    const a = Buffer.from(expected);
    const b = Buffer.from(signature || '');
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('JWT signature verification failed.');
    return payload;
  }
}
