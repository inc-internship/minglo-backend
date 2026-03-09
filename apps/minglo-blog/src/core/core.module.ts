import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreConfig } from './core.config';
import { MingloDataBaseConfig } from '../database/database.config';
import { PrismaModule } from '../database/prisma.module';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [CqrsModule, PrismaModule],
  providers: [CoreConfig, MingloDataBaseConfig],
  exports: [CoreConfig, CqrsModule],
})
export class CoreModule {}
