import '../../../newrelic.js';
import { NestFactory } from '@nestjs/core';
import { initAppModule } from './init-app-module';
import { CoreConfig } from './core/core.config';
import { appSetup } from './setup/app.setup';
import { proxySetup } from './setup/proxy.setup';
import { cookiesSetup } from './setup/cookies.setup';
import { corsSetup } from './setup/cors.setup';
import { loggerSetup } from '@app/logger/logger.setup';
import { WsAdapter } from './setup/ws.adapter';
import { RABBITMQ_QUEUES } from '@app/payments';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule, {
    rawBody: true, // required for Stripe webhook signature verification
    bufferLogs: true,
  });

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  proxySetup(app, coreConfig.trustProxy);

  cookiesSetup(app, coreConfig.cookieParser);

  appSetup(app, coreConfig.swagger);

  corsSetup(app, coreConfig.cors, {
    origin: coreConfig.corsOrigins,
    credentials: coreConfig.corsCredentials,
  });

  app.useWebSocketAdapter(new WsAdapter(app));

  const { logger } = await loggerSetup(app);

  const { port, env } = coreConfig;

  logger.log(
    `Connecting RMQ consumer: url=${coreConfig.rabbitmqUrl}, queue=${RABBITMQ_QUEUES.SUBSCRIPTION_ACTIVATED}`,
    'bootstrap',
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [coreConfig.rabbitmqUrl],
      queue: RABBITMQ_QUEUES.SUBSCRIPTION_ACTIVATED,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  logger.log('All microservices started', 'bootstrap');

  await app.listen(port, () => {
    logger.log(
      `Minglo-Blog app starting listen port: ${port}, environment (NODE_ENV): ${env}`,
      'bootstrap',
    );
  });
}

bootstrap();
