import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import { LoggerConfig } from './logger.config';

const customLevels = {
  levels: { trace: 5, debug: 4, info: 3, warn: 2, error: 1, fatal: 0 },
};

const timeFormat = 'YYYY-MM-DD HH:mm:ss';
const { combine, prettyPrint, timestamp, errors, colorize } = winston.format;

@Injectable()
export class WinstonService {
  private logger: winston.Logger;

  constructor(
    private loggerConfig: LoggerConfig,
    private serviceName: string,
  ) {
    const consoleTransport = new winston.transports.Console({
      format: combine(
        timestamp({ format: timeFormat }),
        errors({ stack: true }),
        prettyPrint(),
        colorize({ all: true, colors: { trace: 'yellow' } }),
      ),
    });

    const transports: Transport[] = [consoleTransport];

    if (loggerConfig.isProduction) {
      transports.push(
        new winston.transports.Http({
          host: loggerConfig.loggerHost,
          path: loggerConfig.loggerUrlPath,
          ssl: true,
        }),
      );
    }

    this.logger = winston.createLogger({
      format: winston.format.timestamp({ format: timeFormat }),
      level: loggerConfig.loggerLevel,
      levels: customLevels.levels,
      transports,
      defaultMeta: { serviceName: this.serviceName },
    });
  }

  trace(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.log('trace', message, { sourceName, functionName, requestId });
  }

  debug(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.debug(message, { sourceName, functionName, requestId });
  }

  info(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.info(message, { sourceName, functionName, requestId });
  }

  warn(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.warn(message, { sourceName, functionName, requestId });
  }

  error(
    message: string,
    requestId: string | null,
    functionName?: string,
    sourceName?: string,
    stack?: string,
  ) {
    this.logger.error(message, { sourceName, functionName, requestId, stack });
  }

  fatal(
    message: string,
    requestId: string | null,
    functionName?: string,
    sourceName?: string,
    stack?: string,
  ) {
    this.logger.log('fatal', message, { sourceName, functionName, requestId, stack });
  }
}
