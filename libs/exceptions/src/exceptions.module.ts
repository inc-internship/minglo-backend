import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from '@app/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from '@app/exceptions/filters/domain-exceptions.filter';

@Module({
  providers: [
    { provide: APP_FILTER, useClass: AllHttpExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainHttpExceptionsFilter },
  ],
})
export class ExceptionsModule {}
