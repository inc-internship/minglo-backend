import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreConfig } from './core.config';
import { MingloDataBaseConfig } from '../database/database.config';
import { PrismaModule } from '../database/prisma.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserConfig } from './user.config';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => [
        {
          ttl: coreConfig.throttleTtl,
          limit: coreConfig.throttleLimit,
        },
      ],
      inject: [CoreConfig],
    }),
    PrismaModule,
  ],
  providers: [
    CoreConfig,
    UserConfig,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    MingloDataBaseConfig,
  ],
  exports: [CoreConfig, CqrsModule, ThrottlerModule, UserConfig],
})
export class CoreModule {}
