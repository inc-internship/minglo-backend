import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from '@app/setup/global-prefix.setup';
import { pipesSetup } from './pipes.setup';
import { cookiesSetup } from './cookies.setup';
import { CoreConfig } from '../core/core.config';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  globalPrefixSetup(app);
  pipesSetup(app);

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  cookiesSetup(app, coreConfig.cookieParser);

  swaggerSetup(app, isSwaggerEnabled);
}
