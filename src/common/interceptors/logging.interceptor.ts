import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, finalize, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, originalUrl } = request;
    const start = Date.now();

    return next.handle().pipe(
      catchError((err) => {
        this.logger.error(`${method} ${originalUrl} -> ERROR`, err.stack);
        return throwError(() => err);
      }),
      finalize(() => {
        const ms = Date.now() - start;
        const statusCode = response.statusCode;
        this.logger.log(`${method} ${originalUrl} ${statusCode} +${ms}ms`);
      }),
    );
  }
}
