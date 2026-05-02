import { DynamicModule, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DynamicConfigModule } from '@app/dynamic-config';
import { AsyncLocalStorageService, LoggerModule, RequestContextMiddleware } from '@app/logger';
import { ExceptionsModule } from '@app/exceptions';
import { ScheduleModule } from '@nestjs/schedule';
import { MingloPaymentModule, PaymentsCoreModule } from './modules';
import { PaymentsConfig } from './modules/core/payments.config';

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
    console.log('config', config); //todo: delete
    return {
      module: AppModule,
      imports: [], //todo:  imports: [...(config.testingModule ? [MediaTestModule] : [])],
      controllers: [], //todo:  controllers: [...(config.testingModule ? [MediaTestController] : [])],
    };
  }
}
