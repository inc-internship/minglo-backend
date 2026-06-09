import { Module } from '@nestjs/common';
import { BillingController } from './api/billing.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CoreConfig } from '../../core/core.config';
import { PAYMENT_SERVICE } from '@app/payments';
import { GetSubscriptionsPlansQueryHandler } from './application/queries';
import { CreateStripeCheckoutUseCase } from './application/usecases';

const queries = [GetSubscriptionsPlansQueryHandler];
const commands = [CreateStripeCheckoutUseCase];

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PAYMENT_SERVICE,
        useFactory: (config: CoreConfig) => ({
          transport: Transport.TCP,
          options: {
            host: config.paymentsTcpHost,
            port: config.paymentsTcpPort,
          },
        }),
        inject: [CoreConfig],
      },
    ]),
  ],
  controllers: [BillingController],
  providers: [...queries, ...commands],
})
export class BillingModule {}
