import { Module } from '@nestjs/common';
import { MingloPaymentsTcpController } from './api/minglo-payments-tcp.controller';

@Module({
  imports: [],
  controllers: [MingloPaymentsTcpController],
  providers: [],
})
export class MingloPaymentModule {}
