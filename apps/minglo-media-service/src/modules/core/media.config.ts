import { Injectable } from '@nestjs/common';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { configValidationUtility, Environments } from '@app/dynamic-config';

@Injectable()
export class MediaConfig {
  @IsEnum(Environments, {
    message:
      'Set environment variable NODE_ENV. Allowed values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: Environments;

  @IsNumber({}, { message: 'Set environment variable MEDIA_HTTP_PORT' })
  httpPort: number;

  @IsNumber({}, { message: 'Set environment variable MEDIA_TCP_PORT' })
  tcpPort: number;

  @IsNotEmpty({
    message: 'Set env variable MEDIA_DB_URL, example: localhost:3000',
  })
  databaseUrl: string;

  @IsNotEmpty({ message: 'Set environment variable S3_BUCKET_NAME' })
  bucketName: string;

  @IsNotEmpty({ message: 'Set environment variable S3_REGION' })
  region: string;

  @IsNotEmpty({ message: 'Set environment variable S3_ACCESS_KEY_ID' })
  accessKeyId: string;

  @IsNotEmpty({ message: 'Set environment variable S3_SECRET_ACCESS_KEY' })
  secretKey: string;

  @IsNotEmpty({ message: 'Set environment variable MEDIA_ACCESS_SECRET' })
  accessSecret: string;

  // Throttler
  @ValidateIf((o) => o.throttleTtl !== undefined)
  @IsNumber({}, { message: 'Set environment variable MEDIA_THROTTLE_TTL (seconds)' })
  throttleTtl: number;

  @ValidateIf((o) => o.throttleLimit !== undefined)
  @IsNumber({}, { message: 'Set environment variable MEDIA_THROTTLE_LIMIT (number)' })
  throttleLimit: number;

  //testing
  @IsBoolean({
    message: 'Set environment variable MEDIA_TESTING_MODULE (boolean), example: true',
  })
  testingModule: boolean;

  //swagger
  @IsBoolean({
    message: 'Set environment variable MEDIA_SWAGGER (boolean), example: true',
  })
  swagger: boolean;

  constructor(
    private readonly configService: ConfigService<any, true>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MediaConfig.name);

    this.env = this.configService.get('NODE_ENV');

    this.httpPort = Number(this.configService.get('MEDIA_HTTP_PORT'));
    this.logger.log(`MEDIA_HTTP_PORT is ${this.httpPort}`, 'constructor');

    this.tcpPort = Number(this.configService.get('MEDIA_TCP_PORT'));
    this.logger.log(`MEDIA_TCP_PORT is ${this.tcpPort}`, 'constructor');

    this.databaseUrl = this.configService.get('MEDIA_DB_URL');
    this.logger.log(`MEDIA_DB_URL is ${this.databaseUrl}`, 'constructor');

    this.bucketName = this.configService.get('S3_BUCKET_NAME');
    this.logger.log(`S3_BUCKET_NAME is ${this.bucketName}`, 'constructor');

    this.region = this.configService.get('S3_REGION');
    this.logger.log(`S3_REGION is ${this.region}`, 'constructor');

    this.accessKeyId = this.configService.get('S3_ACCESS_KEY_ID');
    this.secretKey = this.configService.get('S3_SECRET_ACCESS_KEY');

    this.accessSecret = this.configService.get('MEDIA_ACCESS_SECRET');

    this.throttleTtl = Number(this.configService.get('MEDIA_THROTTLE_TTL'));
    this.throttleLimit = Number(this.configService.get('MEDIA_THROTTLE_LIMIT'));

    this.testingModule = configValidationUtility.convertToBoolean(
      this.configService.get('MEDIA_TESTING_MODULE'),
    ) as boolean;
    this.logger.log(`MEDIA_TESTING_MODULE connection is ${this.testingModule}`, 'constructor');

    this.swagger = configValidationUtility.convertToBoolean(
      this.configService.get('MEDIA_SWAGGER'),
    ) as boolean;

    configValidationUtility.validateConfig(this);
    this.logger.log(`MediaServiceConfig successfully validated`, 'constructor');
  }
}
