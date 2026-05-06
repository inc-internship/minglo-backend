import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup, pipesSetup, swaggerSetup } from '@app/setup';
import { cookiesSetup } from './cookies.setup';
import { CoreConfig } from '../core/core.config';
import {
  MINGLO_BLOG_SWAGGER_DESCRIPTION,
  MINGLO_BLOG_SWAGGER_PREFIX,
  MINGLO_BLOG_SWAGGER_TITLE,
  MINGLO_BLOG_SWAGGER_VERSION,
} from './constants';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  globalPrefixSetup(app);
  pipesSetup(app);

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  cookiesSetup(app, coreConfig.cookieParser);

  swaggerSetup(app, {
    isEnabled: isSwaggerEnabled,
    title: MINGLO_BLOG_SWAGGER_TITLE,
    description: MINGLO_BLOG_SWAGGER_DESCRIPTION,
    prefix: MINGLO_BLOG_SWAGGER_PREFIX,
    version: MINGLO_BLOG_SWAGGER_VERSION,
  });
}
