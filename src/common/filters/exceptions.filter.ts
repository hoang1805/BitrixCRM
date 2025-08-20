/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CustomError } from '../errors/custom.error';
import { Response } from 'express';
import { LogService } from '../services/log.service';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LogService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let status: any = null;
    let message = '';
    if (exception instanceof CustomError) {
      message = exception.message;
    } else if (exception instanceof HttpException) {
      const exceptionResponse: string | object = exception.getResponse();
      message =
        typeof exceptionResponse == 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, any>).message ||
            'An unexpected error occurred.';
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (exception instanceof CustomError) {
      status = exception.statusCode;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    response.status(status ?? HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      message: Array.isArray(message)
        ? message[0]
        : (message ?? 'An unexpected error occurred.'),
      timestamp: new Date().toISOString(),
    });
  }
}
