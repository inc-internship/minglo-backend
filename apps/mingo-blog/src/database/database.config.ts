import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '@app/dynamic-config';

@Injectable()
export class MingoDataBaseConfig {
  @IsNotEmpty({
    message: 'Set env variable MINGO_DB_URL, example: localhost:3000',
  })
  url: string;

  constructor(private configService: ConfigService<any, true>) {
    this.url = this.configService.get('MINGO_DB_URL');
    configValidationUtility.validateConfig(this);
  }
}
