import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly requests = new Map<string, RateLimitEntry>();

  private positiveInt(value: string | undefined, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
  }

  private clientKey(req: Request) {
    // Use the network address rather than a caller supplied identity header so a
    // client cannot avoid the limiter by forging browser identity headers.
    return req.ip || req.socket.remoteAddress || 'unknown-client';
  }

  private isSensitiveRoute(path: string) {
    return [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/users/register',
      '/api/payments/razorpay/pro/order',
      '/api/payments/razorpay/pro/verify',
      '/api/payments/razorpay/b2b/',
      '/api/superuser/approvals/',
    ].some((route) => path.startsWith(route));
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS' || req.originalUrl.startsWith('/api/payments/razorpay/webhook')) {
      return next();
    }

    const now = Date.now();
    const windowMs = this.positiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000);
    const sensitive = this.isSensitiveRoute(req.originalUrl);
    const limit = sensitive
      ? this.positiveInt(process.env.RATE_LIMIT_SENSITIVE_MAX, 10)
      : this.positiveInt(process.env.RATE_LIMIT_GENERAL_MAX, 300);

    const bucket = sensitive ? 'sensitive' : 'general';
    const key = `${this.clientKey(req)}:${bucket}`;
    let entry = this.requests.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
    }

    entry.count += 1;
    this.requests.set(key, entry);

    // Small cleanup to prevent stale demo buckets from accumulating forever.
    if (this.requests.size > 1000) {
      for (const [storedKey, stored] of this.requests.entries()) {
        if (now >= stored.resetAt) this.requests.delete(storedKey);
      }
    }

    const remaining = Math.max(limit - entry.count, 0);
    const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > limit) {
      res.setHeader('Retry-After', String(resetSeconds));
      return res.status(429).json({
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Too many requests. Please try again in ${resetSeconds} seconds.`,
        requestId: req.headers['x-request-id'],
      });
    }

    next();
  }
}
