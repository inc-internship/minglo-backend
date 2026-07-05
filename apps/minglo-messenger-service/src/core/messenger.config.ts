import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';
import { configValidationUtility, Environments } from '@app/dynamic-config';

@Injectable()
export class MessengerConfig {
  @IsEnum(Environments, {
    message:
      'Set environment variable NODE_ENV. Allowed values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: Environments;

  @IsNumber({}, { message: 'Set environment variable MESSENGER_PORT' })
  port: number;

  @IsNotEmpty({
    message: 'Set env variable MESSENGER_DB_URL, example: postgresql://user:pass@host:5432/db',
  })
  databaseUrl: string;

  @IsNotEmpty({ message: 'Set environment variable ACCESS_SECRET' })
  accessSecret: string;

  @IsNotEmpty({ message: 'Set environment variable MINGLO_BLOG_URL' })
  mingloBlogUrl: string;

  // Throttler
  @ValidateIf((o) => o.throttleTtl !== undefined)
  @IsNumber({}, { message: 'Set environment variable MESSENGER_THROTTLE_TTL (seconds)' })
  throttleTtl: number;

  @ValidateIf((o) => o.throttleLimit !== undefined)
  @IsNumber({}, { message: 'Set environment variable MESSENGER_THROTTLE_LIMIT (number)' })
  throttleLimit: number;

  //testing
  @IsBoolean({
    message: 'Set environment variable MESSENGER_TESTING_MODULE (boolean), example: true',
  })
  testingModule: boolean;

  //swagger
  @IsBoolean({
    message: 'Set environment variable MESSENGER_SWAGGER (boolean), example: true',
  })
  swagger: boolean;

  @IsNotEmpty({ message: 'Set environment variable RABBITMQ_URL' })
  rabbitmqUrl: string;

  // CORS
  @IsBoolean({ message: 'Set environment variable MINGLO_CORS (boolean), example: true' })
  cors: boolean;

  @ValidateIf((o) => o.cors === true)
  @IsNotEmpty({ message: 'Set environment variable MINGLO_CORS_ORIGINS (comma-separated)' })
  corsOrigins: string[];

  @IsBoolean({
    message: 'Set environment variable MINGLO_CORS_CREDENTIALS (boolean), example: true',
  })
  corsCredentials: boolean;

  constructor(
    private readonly configService: ConfigService<any, true>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MessengerConfig.name);

    this.env = this.configService.get('NODE_ENV');

    this.port = Number(this.configService.get('MESSENGER_PORT'));
    this.logger.log(`MESSENGER_PORT is ${this.port}`, 'constructor');

    this.databaseUrl = this.configService.get('MESSENGER_DB_URL');
    this.logger.log(`MESSENGER_DB_URL is ${this.databaseUrl}`, 'constructor');

    this.accessSecret = this.configService.get('ACCESS_SECRET');

    this.mingloBlogUrl = this.configService.get('MINGLO_BLOG_URL');
    this.logger.log(`MINGLO_BLOG_URL is ${this.mingloBlogUrl}`, 'constructor');

    this.throttleTtl = Number(this.configService.get('MESSENGER_THROTTLE_TTL'));
    this.throttleLimit = Number(this.configService.get('MESSENGER_THROTTLE_LIMIT'));

    this.testingModule = configValidationUtility.convertToBoolean(
      this.configService.get('MESSENGER_TESTING_MODULE'),
    ) as boolean;
    this.logger.log(`MESSENGER_TESTING_MODULE is ${this.testingModule}`, 'constructor');

    this.swagger = configValidationUtility.convertToBoolean(
      this.configService.get('MESSENGER_SWAGGER'),
    ) as boolean;

    this.rabbitmqUrl = this.configService.get('RABBITMQ_URL');
    this.logger.log(`RABBITMQ_URL is ${this.rabbitmqUrl}`, 'constructor');

    this.cors = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_CORS'),
    ) as boolean;

    const rawOrigins = this.configService.get<string>('MINGLO_CORS_ORIGINS') ?? '';
    this.corsOrigins = rawOrigins
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    this.corsCredentials = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_CORS_CREDENTIALS'),
    ) as boolean;

    configValidationUtility.validateConfig(this);
    this.logger.log(`MessengerServiceConfig successfully validated`, 'constructor');
  }
}
