import { INestApplication } from '@nestjs/common';
import { pipesSetup, swaggerSetup } from 'libs/setup/src';
import {
  MESSENGER_SWAGGER_VERSION,
  MESSENGER_SWAGGER_PREFIX,
  MESSENGER_SWAGGER_TITLE,
  MESSENGER_SWAGGER_DESCRIPTION,
} from '@app/messenger';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  swaggerSetup(app, {
    isEnabled: isSwaggerEnabled,
    title: MESSENGER_SWAGGER_TITLE,
    prefix: MESSENGER_SWAGGER_PREFIX,
    description: MESSENGER_SWAGGER_DESCRIPTION,
    version: MESSENGER_SWAGGER_VERSION,
  });
}
