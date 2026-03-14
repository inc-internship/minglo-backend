import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { configValidationUtility } from '@app/dynamic-config';

@Injectable()
export class EmailConfig {
  @IsNotEmpty({
    message: 'MAIL_SERVICE is required (e.g., Gmail)',
  })
  service: string;

  @IsNotEmpty({
    message: 'MAIL_ADDRESS is required (e.g., example@gmail.com)',
  })
  address: string;

  @IsNotEmpty({
    message: 'MAIL_PASS is required (set a secure password)',
  })
  password: string;

  @IsNotEmpty({
    message: 'MAIL_FROM is required (e.g., "Account Name" <example@gmail.com>)',
  })
  from: string;

  constructor(private configService: ConfigService<any, true>) {
    this.service = this.configService.get('MAIL_SERVICE');
    this.address = this.configService.get('MAIL_ADDRESS');
    this.password = this.configService.get('MAIL_PASS');
    this.from = this.configService.get('MAIL_FROM');

    configValidationUtility.validateConfig(this);
  }
}
