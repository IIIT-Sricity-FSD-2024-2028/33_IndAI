import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { DataStore } from '../../store/data.store';

@Injectable()
export class AdminAuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger('ADMIN-AUDIT');
  private readonly mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

  constructor(private readonly db: DataStore) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.mutatingMethods.has(req.method)) return next();

    const requestId = String(req.headers['x-request-id'] || 'NO_REQUEST_ID');
    const started = Date.now();

    res.on('finish', () => {
      // Identity is read only after JwtAuthGuard has verified the Bearer token.
      // Public login/register calls therefore do not become admin audit events.
      const actor = (req as any).user;
      if (!actor || !['admin', 'superuser'].includes(actor.role)) return;

      const adminTeam = actor.role === 'superuser' ? 'SUPER_ADMIN' : actor.adminTeam || 'UNASSIGNED_ADMIN';
      const details = {
        requestId,
        method: req.method,
        route: req.originalUrl,
        statusCode: res.statusCode,
        succeeded: res.statusCode < 400,
        adminTeam,
        durationMs: Date.now() - started,
        identitySource: 'VERIFIED_JWT',
      };

      // Never copy request bodies, passwords, JWTs, Razorpay secrets, card data
      // or other sensitive values into the audit log.
      this.db.audit('ADMIN_HTTP_ACTION', actor.id, details);
      this.logger.log(`[${requestId}] ${adminTeam} ${actor.email} ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
    });

    next();
  }
}
