import { NestFactory } from '@nestjs/core';
import { MingloMediaServiceModule } from './minglo-media-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MingloMediaServiceModule);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
