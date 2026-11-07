import { DynamicModule, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DynamicConfigModule } from 'libs/dynamic-config/src';
import { AsyncLocalStorageService, LoggerModule, RequestContextMiddleware } from 'libs/logger/src';
import { ExceptionsModule } from 'libs/exceptions/src';
import { ScheduleModule } from '@nestjs/schedule';
import { MessengerConfig } from './core/messenger.config';
import { MessengerCoreModule } from './core/messenger-core.module';
import { MESSENGER_SERVICE } from '@app/messenger';
import { MessengerModule } from './modules/messenger/messenger.module';
import { MessengerTestModule } from './modules/testing/testing.module';
import { MessengerTestController } from './modules/testing/api/testing.controller';

@Module({
  imports: [
    DynamicConfigModule,
    LoggerModule.forRoot(MESSENGER_SERVICE),
    ExceptionsModule,
    ScheduleModule.forRoot(),
    MessengerCoreModule,
    MessengerModule,
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

  static async forRoot(config: MessengerConfig): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [...(config.testingModule ? [MessengerTestModule] : [])],
      controllers: [...(config.testingModule ? [MessengerTestController] : [])],
    };
  }
}
