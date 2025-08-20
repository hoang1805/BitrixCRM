import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LogService } from '../services/log.service';
import { CustomError } from '../errors/custom.error';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LogService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const now = Date.now();
    const method = request.method;
    const url = request.originalUrl;
    const statusCode = response.statusCode;

    return next.handle().pipe(
      tap(() =>
        this.logger.info(`${Date.now() - now}ms - SUCCESS`, {
          method,
          url,
          statusCode,
        }),
      ),
      catchError((error) => {
        let status: any = null;
        let message: any = error instanceof Error ? error.message : null;

        if (error instanceof CustomError) {
          status = error.statusCode;
        } else if (error instanceof HttpException) {
          status = error.getStatus();
          const _message = error.getResponse()?.['message'];

          if (_message) {
            const _message = error.getResponse()?.['message'];
            if (Array.isArray(_message)) {
              message = _message.join('. ');
            }

            if (typeof _message == 'string') {
              message = _message;
            }
          }
        }

        this.logger.error(
          `${Date.now() - now}ms - ${message ?? 'An unexpected error occurred.'}`,
          {
            method,
            url,
            statusCode: status ?? 500,
          },
        );

        return throwError(() => error);
      }),
    );
  }
}
