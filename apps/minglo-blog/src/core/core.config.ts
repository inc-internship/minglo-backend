import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { configValidationUtility, Environments } from '@app/dynamic-config';

@Injectable()
export class CoreConfig {
  @IsEnum(Environments, {
    message:
      'Set env variable NODE_ENV, example: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string;

  @IsNumber(
    {},
    {
      message: 'Set env variable MINGLO_PORT, example: 3000',
    },
  )
  port: number;

  @IsBoolean({
    message: 'Set Env variable MINGLO_TESTING_MODULE, example: true',
  })
  testingModule: boolean;

  @IsBoolean({
    message: 'Set Env variable MINGLO_SWAGGER, example: true',
  })
  swagger: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.env = this.configService.get('NODE_ENV');
    this.port = Number(this.configService.get('MINGLO_PORT'));
    this.testingModule = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_TESTING_MODULE'),
    ) as boolean;
    this.swagger = configValidationUtility.convertToBoolean(
      this.configService.get('MINGLO_SWAGGER'),
    ) as boolean;

    configValidationUtility.validateConfig(this);
  }
}
