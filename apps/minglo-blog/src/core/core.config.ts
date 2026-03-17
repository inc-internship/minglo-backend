import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNumber, IsString, ValidateIf } from 'class-validator';
import { configValidationUtility, Environments } from '@app/dynamic-config';

@Injectable()
export class CoreConfig {
  @IsEnum(Environments, {
    message:
      'Set environment variable NODE_ENV. Allowed values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string;

  @IsNumber(
    {},
    {
      message: 'Set environment variable MINGLO_PORT (number), example: 3000',
    },
  )
  port: number;

  @IsBoolean({
    message: 'Set environment variable MINGLO_TESTING_MODULE (boolean), example: true',
  })
  testingModule: boolean;

  @IsBoolean({
    message: 'Set environment variable MINGLO_SWAGGER (boolean), example: true',
  })
  swagger: boolean;

  @IsBoolean({
    message: 'Set environment variable MINGLO_TRUST_PROXY (boolean), example: true',
  })
  trustProxy: boolean;

  @IsBoolean({
    message: 'Set environment variable MINGLO_COOKIE_PARSER (boolean), example: true',
  })
  cookieParser: boolean;

  @IsBoolean({
    message: 'Set environment variable MINGLO_CORS (boolean), example: true',
  })
  cors: boolean;

  @ValidateIf((o) => o.cors)
  @IsString({
    message:
      'Set environment variable MINGLO_CORS_ORIGINS (string), example: http://localhost:3000,https://minglo.com',
  })
  corsOrigins: string;

  @ValidateIf((o) => o.cors)
  @IsBoolean({
    message: 'Set environment variable MINGLO_CORS_CREDENTIALS (boolean), example: true',
  })
  corsCredentials: boolean;

  // Throttler
  @ValidateIf((o) => o.throttleTtl !== undefined)
  @IsNumber({}, { message: 'Set environment variable MINGLO_THROTTLE_TTL (seconds)' })
  throttleTtl: number;

  @ValidateIf((o) => o.throttleLimit !== undefined)
  @IsNumber({}, { message: 'Set environment variable MINGLO_THROTTLE_LIMIT (number)' })
  throttleLimit: number;

  //ACCESS TOKEN
  @IsString({ message: 'Set environment variable ACCESS_SECRET' })
  accessSecret: string;
  @IsNumber({}, { message: 'Set environment variable MAX_AGE_ACCESS_TOKEN' })
  maxAgeAccessToken: number;

  //REFRESH TOKEN
  @IsString({ message: 'Set environment variable REFRESH_SECRET' })
  refreshSecret: string;
  @IsNumber({}, { message: 'Set environment variable MAX_AGE_REFRESH_TOKEN' })
  maxAgeRefreshToken: number;

  constructor(private configService: ConfigService<any, true>) {
    this.env = this.configService.get('NODE_ENV');
    this.port = Number(this.configService.get('MINGLO_PORT'));
    this.testingModule = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_TESTING_MODULE'),
    ) as boolean;
    this.swagger = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_SWAGGER'),
    ) as boolean;
    this.cookieParser = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_COOKIE_PARSER'),
    ) as boolean;
    this.trustProxy = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_TRUST_PROXY'),
    ) as boolean;

    this.cors = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_CORS'),
    ) as boolean;
    this.corsOrigins = this.configService.get('MINGLO_CORS_ORIGINS');
    this.corsCredentials = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_CORS_CREDENTIALS'),
    ) as boolean;
    this.throttleTtl = Number(this.configService.get('MINGLO_THROTTLE_TTL'));
    this.throttleLimit = Number(this.configService.get('MINGLO_THROTTLE_LIMIT'));

    this.accessSecret = this.configService.get('ACCESS_SECRET');
    this.maxAgeAccessToken = Number(this.configService.get('MAX_AGE_ACCESS_TOKEN'));

    this.refreshSecret = this.configService.get('REFRESH_SECRET');
    this.maxAgeRefreshToken = Number(this.configService.get('MAX_AGE_REFRESH_TOKEN'));
    configValidationUtility.validateConfig(this);
  }
}
