import { Injectable } from '@nestjs/common';
import { IsNumber, IsString } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '@app/dynamic-config';

@Injectable()
export class UserConfig {
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
    this.accessSecret = this.configService.get('ACCESS_SECRET');
    this.maxAgeAccessToken = Number(this.configService.get('MAX_AGE_ACCESS_TOKEN'));

    this.refreshSecret = this.configService.get('REFRESH_SECRET');
    this.maxAgeRefreshToken = Number(this.configService.get('MAX_AGE_REFRESH_TOKEN'));
    configValidationUtility.validateConfig(this);
  }
}
