import { INestApplication } from '@nestjs/common';
import { pipesSetup, swaggerSetup } from '@app/setup';
import {
  MEDIA_SWAGGER_DESCRIPTION,
  MEDIA_SWAGGER_PREFIX,
  MEDIA_SWAGGER_TITLE,
  MEDIA_SWAGGER_VERSION,
} from '@app/media/constants';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  swaggerSetup(app, {
    isEnabled: isSwaggerEnabled,
    title: MEDIA_SWAGGER_TITLE,
    version: MEDIA_SWAGGER_VERSION,
    description: MEDIA_SWAGGER_DESCRIPTION,
    prefix: MEDIA_SWAGGER_PREFIX,
  });
}
