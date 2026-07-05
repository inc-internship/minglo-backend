import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DynamicModule } from '@nestjs/common';
import { MessengerConfig } from './core/messenger.config';

export async function initAppModule(): Promise<DynamicModule> {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const messengerConfig = appContext.get<MessengerConfig>(MessengerConfig);
  await appContext.close();
  return AppModule.forRoot(messengerConfig);
}
