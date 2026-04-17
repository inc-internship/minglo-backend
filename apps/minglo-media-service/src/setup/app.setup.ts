import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipesSetup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}
