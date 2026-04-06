import { DynamicModule, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DynamicConfigModule } from '@app/dynamic-config';
import { AsyncLocalStorageService, LoggerModule, RequestContextMiddleware } from '@app/logger';
import { MediaCoreModule, MediaModule } from './modules';
import { MediaConfig } from './modules/core/media.config';
import { MediaTestModule } from './modules/testing/testing.module';
import { MediaTestController } from './modules/testing/api/testing.controller';

@Module({
  imports: [
    DynamicConfigModule,
    MediaCoreModule,
    LoggerModule.forRoot('MINGLO-MEDIA'),
    MediaModule,
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

  //todo: check or delete
  static async forRoot(mediaConfig: MediaConfig): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [...(mediaConfig.testingModule ? [MediaTestModule] : [])],
      controllers: [...(mediaConfig.testingModule ? [MediaTestController] : [])],
    };
  }
}
