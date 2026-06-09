import { Module } from '@nestjs/common';
import { BillingController } from './api/billing.controller';
import { StripeWebhookController } from './api/stripe-webhook.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CoreConfig } from '../../core/core.config';
import { PAYMENT_SERVICE } from '@app/payments';
import {
  GetSubscriptionsPlansQueryHandler,
  GetPaymentHistoryQueryHandler,
  GetCurrentSubscriptionQueryHandler,
} from './application/queries';
import {
  CreateStripeCheckoutUseCase,
  ActivateSubscriptionUseCase,
  ToggleAutoRenewalUseCase,
} from './application/usecases';
import { SubscriptionConsumerController } from './api/subscription-consumer.controller';
import { UserAccountModule } from '../user-account/user-account.module';

const queries = [
  GetSubscriptionsPlansQueryHandler,
  GetPaymentHistoryQueryHandler,
  GetCurrentSubscriptionQueryHandler,
];
const commands = [
  CreateStripeCheckoutUseCase,
  ActivateSubscriptionUseCase,
  ToggleAutoRenewalUseCase,
];

@Module({
  imports: [
    UserAccountModule,
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
  controllers: [BillingController, StripeWebhookController, SubscriptionConsumerController],
  providers: [...queries, ...commands],
})
export class BillingModule {}
