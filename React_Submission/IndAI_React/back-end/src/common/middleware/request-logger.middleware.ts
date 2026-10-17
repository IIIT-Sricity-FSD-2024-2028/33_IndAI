import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const started = Date.now();
    const requestId = String(req.headers['x-request-id'] || 'NO_REQUEST_ID');

    res.on('finish', () => {
      const duration = Date.now() - started;
      // JwtAuthGuard runs after middleware but before the response finishes,
      // therefore req.user is available here for protected APIs.
      const user = (req as any).user;
      const role = user?.role || 'GUEST';
      const userId = user?.id || 'anonymous';
      const message = `[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} role=${role} user=${userId} ${duration}ms`;

      if (res.statusCode >= 500) this.logger.error(message);
      else if (res.statusCode >= 400) this.logger.warn(message);
      else this.logger.log(message);
    });

    next();
  }
}
