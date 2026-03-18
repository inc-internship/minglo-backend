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

  await loggerSetup(app);

  const port = coreConfig.port;

  await app.listen(port, () => {
    console.log('Minglo starting listen port:', coreConfig.port);
    console.log('Minglo environment (NODE_ENV):', coreConfig.env);
  });
}

bootstrap();
