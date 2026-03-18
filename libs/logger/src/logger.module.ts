import { DynamicModule, Global, Module } from '@nestjs/common';
import { ContextLogger } from './logger.service';
import { WinstonService } from './winston.service';
import { LoggerConfig } from './logger.config';
import { AsyncLocalStorageService } from './async-local-storage/async-local-storage.service';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        ContextLogger,
        AsyncLocalStorageService,
        LoggerConfig,
        {
          provide: WinstonService,
          useFactory: (loggerConfig: LoggerConfig) => {
            return new WinstonService(loggerConfig, serviceName);
          },
          inject: [LoggerConfig],
        },
      ],
      exports: [ContextLogger],
    };
  }
}
