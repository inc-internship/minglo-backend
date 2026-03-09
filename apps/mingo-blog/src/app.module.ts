import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DynamicConfigModule } from '@app/dynamic-config';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';

@Module({
  imports: [DynamicConfigModule, CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
// export class AppModule {}
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [],
      //todo: добавить testingModule imports: [...(coreConfig.appTestingModule ? [TestingModule] : [])],
    };
  }
}
