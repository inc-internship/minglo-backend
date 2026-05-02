import { Module } from '@nestjs/common';
import { MingloPaymentsController } from './api/minglo-payments.controller';

@Module({
  imports: [],
  controllers: [MingloPaymentsController],
  providers: [],
})
export class MingloPaymentModule {}
