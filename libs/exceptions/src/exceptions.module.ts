import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from '@app/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from '@app/exceptions/filters/domain-exceptions.filter';
import { ContextLogger } from '@app/logger';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (logger: ContextLogger) => {
        return new AllHttpExceptionsFilter(logger);
      },
      inject: [ContextLogger],
    },
    {
      provide: APP_FILTER,
      useFactory: (logger: ContextLogger) => {
        return new DomainHttpExceptionsFilter(logger);
      },
      inject: [ContextLogger],
    },
  ],
})
export class ExceptionsModule {}
