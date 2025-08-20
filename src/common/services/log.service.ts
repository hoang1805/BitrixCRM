/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class LogService {
  private readonly logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ timestamp, level, message, ...meta }) => {
        const details =
          typeof message === 'string' ? message : JSON.stringify(message);

        return `[${timestamp}] ${level.toUpperCase()}: ${
          meta.method ? `${meta.method} ${meta.url} ${meta?.statusCode}` : ''
        } - ${details} `;
      }),
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/all.log' }),
    ],
  });

  info(message: string, meta?: Record<string, any>) {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    this.logger.error(message, meta);
  }
}
