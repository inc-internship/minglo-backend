import { NestFactory } from '@nestjs/core';
import { initAppModule } from './init-app-module';
import { PaymentsConfig } from './modules/core/payments.config';
import { appSetup } from './app.setup';
import { loggerSetup } from '@app/logger/logger.setup';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule, {
    // Stripe webhook ТРЕБУЕТ rawBody для верификации подписи (HMAC-SHA256).
    rawBody: true,
    bufferLogs: true,
  });

  const paymentsConfig = app.get<PaymentsConfig>(PaymentsConfig);

  const { tcpPort, env } = paymentsConfig;

  appSetup(app, paymentsConfig.swagger);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: tcpPort,
    },
  });

  const { logger } = await loggerSetup(app);

  await app.init();
  await app.startAllMicroservices();

  logger.log(`Media Service started: TCP: ${tcpPort} | env: ${env}`, 'bootstrap');
}
bootstrap();
