import { NestFactory } from '@nestjs/core';
import { loggerSetup } from '../../minglo-blog/src/setup/logger.setup';
import { initAppModule } from './init-app-module';
import { MediaConfig } from './modules/core/media.config';
import { appSetup } from './setup';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule, { bufferLogs: true });

  const mediaConfig = app.get<MediaConfig>(MediaConfig);

  appSetup(app, mediaConfig.swagger);

  const { logger } = await loggerSetup(app);

  const { httpPort, env } = mediaConfig;

  await app.listen(httpPort, () => {
    logger.log(`Minglo Media Service started on port ${httpPort} [env: ${env}]`, 'bootstrap');
  });
}
bootstrap();
