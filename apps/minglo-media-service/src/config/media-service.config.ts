import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { configValidationUtility } from '@app/dynamic-config';

@Injectable()
export class MediaServiceConfig {
  @IsNumber({}, { message: 'Set environment variable MEDIA_HTTP_PORT' })
  httpPort: number;

  @IsNumber({}, { message: 'Set environment variable MEDIA_TCP_PORT' })
  tcpPort: number;

  @IsNotEmpty({
    message: 'Set env variable MEDIA_DB_URL, example: localhost:3000',
  })
  databaseUrl: string;

  @IsString({ message: 'Set environment variable S3_BUCKET_NAME' })
  bucketName: string;

  @IsString({ message: 'Set environment variable S3_REGION' })
  region: string;

  @IsString({ message: 'Set environment variable S3_ACCESS_KEY_ID' })
  accessKeyId: string;

  @IsString({ message: 'Set environment variable S3_SECRET_ACCESS_KEY' })
  secretKey: string;

  @IsString({ message: 'Set environment variable MEDIA_ACCESS_SECRET' })
  accessSecret: string;

  constructor(
    private readonly configService: ConfigService<any, true>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MediaServiceConfig.name);

    this.httpPort = this.configService.get('MEDIA_HTTP_PORT');
    this.logger.log('MEDIA_HTTP_PORT', 'constructor');

    this.tcpPort = this.configService.get('MEDIA_TCP_PORT');
    this.logger.log('MEDIA_TCP_PORT', 'constructor');

    this.databaseUrl = this.configService.get('S3_BUCKET_NAME');
    this.logger.log('S3_BUCKET_NAME', 'constructor');

    this.region = this.configService.get('S3_REGION');
    this.logger.log('S3_REGION', 'constructor');

    this.accessKeyId = this.configService.get('S3_ACCESS_KEY_ID');

    this.secretKey = this.configService.get('MEDIA_HTTP_PORT');

    this.accessSecret = this.configService.get('S3_SECRET_ACCESS_KEY');

    configValidationUtility.validateConfig(this);
    this.logger.log(`MediaServiceConfig successfully validated`, 'constructor');
  }
}
