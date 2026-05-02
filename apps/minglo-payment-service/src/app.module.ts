import { DynamicModule, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DynamicConfigModule } from '@app/dynamic-config';
import { AsyncLocalStorageService, LoggerModule, RequestContextMiddleware } from '@app/logger';
import { ExceptionsModule } from '@app/exceptions';
import { ScheduleModule } from '@nestjs/schedule';
import { MingloPaymentModule, PaymentsCoreModule } from './modules';
import { PaymentsConfig } from './modules/core/payments.config';
import { PaymentTestModule } from './modules/testing/testing.module';
import { PaymentTestController } from './modules/testing/api/testing.controller';

@Module({
  imports: [
    DynamicConfigModule,
    PaymentsCoreModule,
    LoggerModule.forRoot('MINGLO-PAYMENTS'),
    ExceptionsModule,
    ScheduleModule.forRoot(),
    MingloPaymentModule,
  ],
  controllers: [],
  providers: [AsyncLocalStorageService],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }

  static async forRoot(config: PaymentsConfig): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [...(config.testingModule ? [PaymentTestModule] : [])],
      controllers: [...(config.testingModule ? [PaymentTestController] : [])],
    };
  }
}
