import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsString, ValidateIf } from 'class-validator';
import { configValidationUtility, Environments } from '@app/dynamic-config';

enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

@Injectable()
export class LoggerConfig {
  @IsEnum(LogLevel, {
    message:
      'Set env variable LOGGER_LEVEL. Allowed values: trace, debug, info, warn, error, fatal',
  })
  loggerLevel: string;

  @IsBoolean()
  isProduction: boolean;

  @ValidateIf((o) => o.isProduction)
  @IsString({
    message:
      'Set env variable LOGGER_HOST (New Relic endpoint host), example: log-api.newrelic.com',
  })
  loggerHost: string;

  @ValidateIf((o) => o.isProduction)
  @IsString({
    message:
      'Set env variable LOGGER_URL_PATH (New Relic endpoint path), example: /log/v1?Api-Key=YOUR_KEY',
  })
  loggerUrlPath: string;

  constructor(private configService: ConfigService<any, true>) {
    const env = this.configService.get('ENV');

    this.isProduction = env === Environments.PRODUCTION;
    this.loggerLevel = this.configService.get('LOGGER_LEVEL') || LogLevel.DEBUG;
    this.loggerHost = this.configService.get('LOGGER_HOST');
    this.loggerUrlPath = this.configService.get('LOGGER_URL_PATH');

    configValidationUtility.validateConfig(this);
  }
}
