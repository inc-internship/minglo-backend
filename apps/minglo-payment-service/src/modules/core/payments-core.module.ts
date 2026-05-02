import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentsConfig } from './payments.config';

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
  ],
  providers: [PaymentsConfig],
  exports: [CqrsModule, ThrottlerModule, PaymentsConfig],
})
export class PaymentsCoreModule {}
