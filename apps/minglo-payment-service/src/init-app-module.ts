import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DynamicModule } from '@nestjs/common';
import { PaymentsConfig } from './modules/core/payments.config';

export async function initAppModule(): Promise<DynamicModule> {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const paymentsConfig = appContext.get<PaymentsConfig>(PaymentsConfig);
  await appContext.close();
  return AppModule.forRoot(paymentsConfig);
}
