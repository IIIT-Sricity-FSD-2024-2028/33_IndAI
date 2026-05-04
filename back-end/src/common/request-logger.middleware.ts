import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('API');
  use(req: Request, res: Response, next: NextFunction) {
    const started = Date.now();
    res.on('finish', () => {
      const role = req.headers['x-role'] || 'no-role';
      this.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} role=${role} ${Date.now() - started}ms`);
    });
    next();
  }
}
