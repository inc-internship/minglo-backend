import { Module } from '@nestjs/common';
import { BillingController } from './api/billing.controller';

@Module({
  imports: [],
  controllers: [BillingController],
  providers: [],
})
export class BillingModule {}
