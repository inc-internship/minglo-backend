import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DynamicModule } from '@nestjs/common';
import { MediaConfig } from './modules/core/media.config';

export async function initAppModule(): Promise<DynamicModule> {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const mediaConfig = appContext.get<MediaConfig>(MediaConfig);
  await appContext.close();
  return AppModule.forRoot(mediaConfig);
}
