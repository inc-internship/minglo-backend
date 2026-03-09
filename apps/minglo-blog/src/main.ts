import { NestFactory } from '@nestjs/core';
import { initAppModule } from './init-app-module';
import { CoreConfig } from './core/core.config';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule);

  // todo: Trust Proxy
  //  ✅ Правильная настройка trust proxy для NestJS
  // const server = app.getHttpAdapter().getInstance();
  // server.set('trust proxy', true); // Настроить на Express инстансе
  // todo: // Подключаем cookie-parser глобально
  // app.use(cookieParser());

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  appSetup(app, coreConfig.swagger);

  //todo: enableCors ?
  // app.enableCors({
  //   origin: true,
  //   credentials: true, // ← важно для cookies
  // });

  const port = coreConfig.port;

  await app.listen(port, () => {
    console.log('App starting listen port:', port);
    console.log('App environment (NODE_ENV):', coreConfig.env);
  });
}

bootstrap();
