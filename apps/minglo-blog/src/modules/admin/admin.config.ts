import { configValidationUtility } from '@app/dynamic-config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString } from 'class-validator';

@Injectable()
export class AdminConfig {
  @IsString({ message: 'Set ADMIN_EMAIL' })
  email: string;

  @IsString({ message: 'Set ADMIN_PASSWORD' })
  password: string;

  constructor(private configService: ConfigService<any, true>) {
    this.email = this.configService.get('ADMIN_EMAIL');
    this.password = this.configService.get('ADMIN_PASSWORD');

    configValidationUtility.validateConfig(this);
  }
}
