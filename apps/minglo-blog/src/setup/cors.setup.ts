import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function corsSetup(app: INestApplication, isCorsEnabled: boolean, options: CorsOptions) {
  if (isCorsEnabled) {
    app.enableCors(options);
  }
}
