import { NestFactory } from '@nestjs/core';
import { loggerSetup } from '../../minglo-blog/src/setup/logger.setup';
import { initAppModule } from './init-app-module';
import { MediaConfig } from './modules/core/media.config';
import { appSetup } from './setup';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule, { bufferLogs: true });

  const mediaConfig = app.get<MediaConfig>(MediaConfig);

  appSetup(app, mediaConfig.swagger);

  const { logger } = await loggerSetup(app);

  const { httpPort, tcpPort, env } = mediaConfig;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: tcpPort,
    },
  });

  await app.listen(httpPort);

  logger.log(
    `Media Service started: HTTP: ${httpPort} | TCP: ${tcpPort} | env: ${env}`,
    'bootstrap',
  );
}
bootstrap();
