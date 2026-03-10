import { NestFactory } from '@nestjs/core';
import { MicroAppModule } from './micro-app.module';

async function bootstrap() {
  const app = await NestFactory.create(MicroAppModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
