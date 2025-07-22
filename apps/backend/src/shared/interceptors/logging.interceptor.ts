import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Log request details for admin dashboard
        console.log({
          timestamp: new Date().toISOString(),
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          responseTime: `${responseTime}ms`,
          userAgent: request.headers['user-agent'],
          apiKey: request.apiKey
            ? `${request.apiKey.key.substring(0, 8)}...`
            : 'none',
        });
      }),
    );
  }
}
