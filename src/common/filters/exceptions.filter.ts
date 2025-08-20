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
    const message: any = exception instanceof Error ? exception.message : null;

    if (exception instanceof CustomError) {
      status = exception.statusCode;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    response.status(status ?? HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      message: message ?? 'An unexpected error occurred.',
      timestamp: new Date().toISOString(),
    });
  }
}
