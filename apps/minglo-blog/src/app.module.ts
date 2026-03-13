import { DynamicModule, Module } from '@nestjs/common';
import { DynamicConfigModule } from '@app/dynamic-config';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { MingloTestModule } from './modules/testing/testing.module';
import { MingloTestController } from './modules/testing/api/testing.controller';
import { ExceptionsModule } from '@app/exceptions';
import { UserAccountModule } from './modules/user-account/user-account.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    DynamicConfigModule,
    CoreModule,
    ThrottlerModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => [
        {
          ttl: coreConfig.throttleTtl,
          limit: coreConfig.throttleLimit,
        },
      ],
      inject: [CoreConfig],
    }),
    ExceptionsModule,
    UserAccountModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [...(coreConfig.testingModule ? [MingloTestModule] : [])],
      controllers: [...(coreConfig.testingModule ? [MingloTestController] : [])],
    };
  }
}
