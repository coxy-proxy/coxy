import { CanActivate, ExecutionContext, Injectable, TooManyRequestsException } from '@nestjs/common';

interface Counter {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly ttlMs = 60_000; // 1 minute
  private readonly limit = 5; // 5 requests per ttl per key
  private readonly buckets = new Map<string, Counter>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    const route = req.method + ' ' + (req.route?.path || req.originalUrl || req.url);
    const key = `${ip}::${route}`;

    const now = Date.now();
    const cur = this.buckets.get(key);
    if (!cur || cur.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.ttlMs });
      return true;
    }
    if (cur.count >= this.limit) {
      throw new TooManyRequestsException('Too many requests, please try again later');
    }
    cur.count++;
    return true;
  }
}
