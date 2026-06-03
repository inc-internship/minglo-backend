import { Module } from '@nestjs/common';
import { PaymentTestController } from './api/testing.controller';

@Module({
  imports: [],
  controllers: [PaymentTestController],
  providers: [],
  exports: [],
})
export class PaymentTestModule {}
