import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggerService } from '@app/logger';
import {
  AllExceptionsFilter,
  DomainExceptionsFilter,
  MulterExceptionsFilter,
  ThrottlerExceptionsFilter,
} from '@app/exceptions/filters';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (logger: LoggerService) => {
        return new AllExceptionsFilter(logger);
      },
      inject: [LoggerService],
    },
    {
      provide: APP_FILTER,
      useFactory: (logger: LoggerService) => {
        return new ThrottlerExceptionsFilter(logger);
      },
      inject: [LoggerService],
    },
    {
      provide: APP_FILTER,
      useFactory: (logger: LoggerService) => {
        return new DomainExceptionsFilter(logger);
      },
      inject: [LoggerService],
    },
    {
      provide: APP_FILTER,
      useFactory: (logger: LoggerService) => {
        return new MulterExceptionsFilter(logger);
      },
      inject: [LoggerService],
    },
  ],
})
export class ExceptionsModule {}
