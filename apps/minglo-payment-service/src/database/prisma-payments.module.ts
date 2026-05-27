import { Global, Module } from '@nestjs/common';
import { PrismaPaymentService } from './prisma-payment.service';

@Global()
@Module({
  providers: [PrismaPaymentService],
  exports: [PrismaPaymentService],
})
export class PrismaPaymentsModule {}
