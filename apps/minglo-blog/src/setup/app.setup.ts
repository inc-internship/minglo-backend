import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from '@app/setup/global-prefix.setup';
import { pipesSetup } from './pipes.setup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  globalPrefixSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
  pipesSetup(app);
}
