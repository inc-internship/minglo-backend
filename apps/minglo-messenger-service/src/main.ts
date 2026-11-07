import { NestFactory } from '@nestjs/core';
import { initAppModule } from './init-app-module';
import { loggerSetup } from '@app/logger/logger.setup';
import { MessengerConfig } from './core/messenger.config';
import { appSetup } from './app.setup';
import { WsMessengerAdapter } from './ws.adapter';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule);

  const config = app.get<MessengerConfig>(MessengerConfig);

  if (config.cors) {
    app.enableCors({
      origin: config.corsOrigins,
      credentials: config.corsCredentials,
    });
  }

  app.useWebSocketAdapter(new WsMessengerAdapter(app));

  appSetup(app, config.swagger);

  const { logger } = await loggerSetup(app);

  await app.listen(config.port);

  logger.log(`Messenger Service started: port: ${config.port} | env: ${config.env}`, 'bootstrap');
}
bootstrap();
