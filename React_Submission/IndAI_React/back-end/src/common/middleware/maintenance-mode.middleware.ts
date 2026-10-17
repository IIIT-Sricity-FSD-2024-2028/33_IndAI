import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { DataStore } from '../../store/data.store';
import { JwtTokenService } from '../../modules/auth/jwt-token.service';

@Injectable()
export class MaintenanceModeMiddleware implements NestMiddleware {
  constructor(private readonly db: DataStore, private readonly tokens: JwtTokenService) {}

  private isEnabled() {
    return process.env.MAINTENANCE_MODE === 'true' || this.db.config?.maintenanceMode === true;
  }

  private isVerifiedSuperAdmin(req: Request) {
    const auth = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization;
    const match = String(auth || '').match(/^Bearer\s+(.+)$/i);
    if (!match) return false;
    try {
      const payload = this.tokens.verifyAccess(match[1].trim());
      const user = this.db.getUser(payload.sub);
      return Boolean(user && user.status === 'active' && user.role === 'superuser' && payload.role === 'superuser');
    } catch {
      return false;
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.isEnabled()) return next();

    // Login/refresh and Razorpay webhooks remain available so the protected
    // Super Admin can troubleshoot and payment callbacks are never dropped.
    if (
      req.method === 'OPTIONS' ||
      req.originalUrl.startsWith('/api/payments/razorpay/webhook') ||
      req.originalUrl.startsWith('/api/auth/login') ||
      req.originalUrl.startsWith('/api/auth/refresh') ||
      req.originalUrl.startsWith('/api/docs') ||
      this.isVerifiedSuperAdmin(req)
    ) {
      return next();
    }

    res.setHeader('Retry-After', '60');
    res.setHeader('X-IndAI-Maintenance-Mode', 'true');
    return res.status(503).json({
      statusCode: 503,
      error: 'Service Unavailable',
      maintenance: true,
      message: 'IndAI is currently undergoing maintenance. Please try again shortly.',
      requestId: req.headers['x-request-id'],
    });
  }
}
