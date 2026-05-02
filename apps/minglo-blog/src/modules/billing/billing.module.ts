import { Module } from '@nestjs/common';
import { BillingController } from './api/billing.controller';
import { PaymentsHttpClient } from './infrastructure/payments-http.client';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [BillingController],
  providers: [PaymentsHttpClient],
})
export class BillingModule {}
