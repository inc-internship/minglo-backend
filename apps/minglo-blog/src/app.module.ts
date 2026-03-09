import { DynamicModule, Module } from '@nestjs/common';
import { DynamicConfigModule } from '@app/dynamic-config';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { MingloTestModule } from './modules/testing/testing.module';
import { MingloTestController } from './modules/testing/api/testing.controller';
import { ExceptionsModule } from '@app/exceptions';

@Module({
  imports: [DynamicConfigModule, CoreModule, ExceptionsModule, UserModule, PostModule],
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
