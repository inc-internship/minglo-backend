import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from '@app/setup/global-prefix.setup';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipesSetup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  globalPrefixSetup(app);
  pipesSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}
