import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';
import { configValidationUtility, Environments } from '@app/dynamic-config';

@Injectable()
export class PaymentsConfig {
  @IsEnum(Environments, {
    message:
      'Set environment variable NODE_ENV. Allowed values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: Environments;

  @IsNotEmpty({ message: 'Set environment variable PAYMENTS_SERVICE_HOST' })
  tcpHost: string;

  @IsNumber({}, { message: 'Set environment variable PAYMENTS_SERVICE_TCP_PORT' })
  tcpPort: number;

  @IsNotEmpty({
    message: 'Set env variable PAYMENTS_DB_URL, example: localhost:3000',
  })
  databaseUrl: string;

  @IsNotEmpty({ message: 'Set environment variable PAYMENTS_STRIPE_SECRET_KEY' })
  stripeSecretKey: string;

  @IsNotEmpty({ message: 'Set environment variable PAYMENTS_STRIPE_PUBLIC_KEY' })
  stripePublicKey: string;

  @IsNotEmpty({ message: 'Set environment variable PAYMENTS_STRIPE_WEBHOOK_SECRET' })
  webHookSecret: string;

  @IsNotEmpty({ message: 'Set environment variable PAYMENTS_FRONTEND_URL' })
  frontendUrl: string;

  // Throttler
  @ValidateIf((o) => o.throttleTtl !== undefined)
  @IsNumber({}, { message: 'Set environment variable PAYMENTS_THROTTLE_TTL (seconds)' })
  throttleTtl: number;

  @ValidateIf((o) => o.throttleLimit !== undefined)
  @IsNumber({}, { message: 'Set environment variable PAYMENTS_THROTTLE_LIMIT (number)' })
  throttleLimit: number;

  //testing
  @IsBoolean({
    message: 'Set environment variable PAYMENTS_TESTING_MODULE (boolean), example: true',
  })
  testingModule: boolean;

  //swagger
  @IsBoolean({
    message: 'Set environment variable PAYMENTS_SWAGGER (boolean), example: true',
  })
  swagger: boolean;

  constructor(
    private readonly configService: ConfigService<any, true>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaymentsConfig.name);

    this.env = this.configService.get('NODE_ENV');

    this.tcpHost = this.configService.get('PAYMENTS_SERVICE_HOST');
    this.logger.log(`PAYMENTS_SERVICE_HOST is ${this.tcpHost}`, 'constructor');

    this.tcpPort = Number(this.configService.get('PAYMENTS_SERVICE_TCP_PORT'));
    this.logger.log(`PAYMENTS_SERVICE_TCP_PORT is ${this.tcpPort}`, 'constructor');

    this.databaseUrl = this.configService.get('PAYMENTS_DB_URL');
    this.logger.log(`PAYMENTS_DB_URL is ${this.databaseUrl}`, 'constructor');

    this.stripeSecretKey = this.configService.get('PAYMENTS_STRIPE_SECRET_KEY');
    this.stripePublicKey = this.configService.get('PAYMENTS_STRIPE_PUBLIC_KEY');
    this.webHookSecret = this.configService.get('PAYMENTS_STRIPE_WEBHOOK_SECRET');

    this.frontendUrl = this.configService.get('PAYMENTS_FRONTEND_URL');
    this.logger.log(`PAYMENTS_FRONTEND_URL is ${this.frontendUrl}`, 'constructor');

    this.throttleTtl = Number(this.configService.get('PAYMENTS_THROTTLE_TTL'));
    this.throttleLimit = Number(this.configService.get('PAYMENTS_THROTTLE_LIMIT'));

    this.testingModule = configValidationUtility.convertToBoolean(
      this.configService.get('PAYMENTS_TESTING_MODULE'),
    ) as boolean;
    this.logger.log(`PAYMENTS_TESTING_MODULE connection is ${this.testingModule}`, 'constructor');

    this.swagger = configValidationUtility.convertToBoolean(
      this.configService.get('PAYMENTS_SWAGGER'),
    ) as boolean;

    configValidationUtility.validateConfig(this);
    this.logger.log(`PaymentsServiceConfig successfully validated`, 'constructor');
  }
}
