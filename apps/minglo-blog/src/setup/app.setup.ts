import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from '@app/setup/global-prefix.setup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  globalPrefixSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}
