import { NestFactory } from '@nestjs/core';
import { initAppModule } from './init-app-module';
import { PaymentsConfig } from './modules/core/payments.config';
import { appSetup } from './app.setup';
import { loggerSetup } from '@app/logger/logger.setup';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule, {
    // Stripe webhook ТРЕБУЕТ rawBody для верификации подписи (HMAC-SHA256).
    rawBody: true,
    bufferLogs: true,
  });

  const paymentsConfig = app.get<PaymentsConfig>(PaymentsConfig);

  const { port, env } = paymentsConfig;

  appSetup(app, paymentsConfig.swagger);

  const { logger } = await loggerSetup(app);

  await app.listen(port);

  logger.log(`Media Service started: HTTP: ${port} | env: ${env}`, 'bootstrap');
}
bootstrap();
