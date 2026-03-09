import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNumber } from 'class-validator';
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

  //todo: add swagger
  // @IsBoolean({
  //   message:
  //     'Set Env variable APP_SWAGGER to enable/disable Swagger, example: true, available values: true, false',
  // })
  // appSwagger: boolean;

  //todo: add testing module
  // @IsBoolean({
  //   message: 'Set Env variable APP_TESTING_MODULE, example: true',
  // })
  // appTestingModule: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.env = this.configService.get('NODE_ENV');
    this.port = Number(this.configService.get('MINGLO_PORT'));

    // this.appSwagger = configValidationUtility.convertToBoolean(
    //   this.configService.get('APP_SWAGGER'),
    // ) as boolean;

    // this.appTestingModule = configValidationUtility.convertToBoolean(
    //   this.configService.get('APP_TESTING_MODULE'),
    // ) as boolean;

    configValidationUtility.validateConfig(this);
  }
}
