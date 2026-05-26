import '../../../newrelic.js';
import { NestFactory } from '@nestjs/core';
import { initAppModule } from './init-app-module';
import { CoreConfig } from './core/core.config';
import { appSetup } from './setup/app.setup';
import { proxySetup } from './setup/proxy.setup';
import { cookiesSetup } from './setup/cookies.setup';
import { corsSetup } from './setup/cors.setup';
import { loggerSetup } from './setup/logger.setup';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule, { bufferLogs: true });

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  proxySetup(app, coreConfig.trustProxy);

  cookiesSetup(app, coreConfig.cookieParser);

  appSetup(app, coreConfig.swagger);

  corsSetup(app, coreConfig.cors, {
    origin: coreConfig.corsOrigins,
    credentials: coreConfig.corsCredentials,
  });

  const { logger } = await loggerSetup(app);

  const { port, env } = coreConfig;

  await app.listen(port, () => {
    logger.log(
      `Minglo-Blog app starting listen port: ${port}, environment (NODE_ENV): ${env}`,
      'bootstrap',
    );
  });
}

bootstrap();
