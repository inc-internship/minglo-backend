import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from '@app/setup/global-prefix.setup';
import { swaggerSetup } from './swagger.setup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  globalPrefixSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}
