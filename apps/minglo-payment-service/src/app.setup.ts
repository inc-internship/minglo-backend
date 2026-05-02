import { INestApplication } from '@nestjs/common';
import { pipesSetup, swaggerSetup } from 'libs/setup/src';
import {
  PAYMENTS_SWAGGER_DESCRIPTION,
  PAYMENTS_SWAGGER_PREFIX,
  PAYMENTS_SWAGGER_TITLE,
  PAYMENTS_SWAGGER_VERSION,
} from '@app/payments';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  swaggerSetup(app, {
    isEnabled: isSwaggerEnabled,
    title: PAYMENTS_SWAGGER_TITLE,
    prefix: PAYMENTS_SWAGGER_PREFIX,
    description: PAYMENTS_SWAGGER_DESCRIPTION,
    version: PAYMENTS_SWAGGER_VERSION,
  });
}
