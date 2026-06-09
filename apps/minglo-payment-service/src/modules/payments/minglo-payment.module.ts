import { Module } from '@nestjs/common';
import { MingloPaymentsTcpController } from './api/minglo-payments-tcp.controller';
import { GetPlansQueryHandler } from './application/queries';

const queries = [GetPlansQueryHandler];

@Module({
  imports: [],
  controllers: [MingloPaymentsTcpController],
  providers: [...queries],
})
export class MingloPaymentModule {}
