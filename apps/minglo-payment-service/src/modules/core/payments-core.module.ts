import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentsConfig } from './payments.config';
import { PrismaPaymentsModule } from '../../database';

@Global()
@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRootAsync({
      useFactory: (config: PaymentsConfig) => [
        {
          ttl: config.throttleTtl,
          limit: config.throttleLimit,
        },
      ],
      inject: [PaymentsConfig],
    }),
    PrismaPaymentsModule,
  ],
  providers: [PaymentsConfig],
  exports: [CqrsModule, ThrottlerModule, PaymentsConfig, PrismaPaymentsModule],
})
export class PaymentsCoreModule {}
