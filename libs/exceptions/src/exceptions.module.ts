import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from '@app/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from '@app/exceptions/filters/domain-exceptions.filter';
import { LoggerService } from '@app/logger';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (logger: LoggerService) => {
        return new AllHttpExceptionsFilter(logger);
      },
      inject: [LoggerService],
    },
    {
      provide: APP_FILTER,
      useFactory: (logger: LoggerService) => {
        return new DomainHttpExceptionsFilter(logger);
      },
      inject: [LoggerService],
    },
  ],
})
export class ExceptionsModule {}
