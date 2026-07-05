import { NestFactory } from '@nestjs/core';
import { initAppModule } from './init-app-module';
import { loggerSetup } from '@app/logger/logger.setup';
import { MessengerConfig } from './core/messenger.config';
import { appSetup } from './app.setup';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule);

  const config = app.get<MessengerConfig>(MessengerConfig);

  const { port, env } = config;

  app.useWebSocketAdapter(new IoAdapter(app));

  appSetup(app, config.swagger);

  const { logger } = await loggerSetup(app);

  await app.listen(port);

  logger.log(`Messenger Service started: port: ${port} | env: ${env}`, 'bootstrap');
}
bootstrap();
