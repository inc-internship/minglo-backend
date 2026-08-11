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
  SubscriptionPendingUseCase,
} from './application/usecases';
import { SubscriptionConsumerController } from './api/subscription-consumer.controller';
import { UserAccountModule } from '../user-account/user-account.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserDeletedHandler } from '../user-account/application/events/user-deleted.handler';
import { NotificationSchedulerService } from './application/services/notification-scheduler.service';
import { GetAllPaymentsTcpQueryHandler } from './application/queries/get-all-payments-tcp.query';
import { GetPaymentsAnalyticsTcpQueryHandler } from './application/queries/get-payments-analytics-tcp.query';

const queries = [
  GetSubscriptionsPlansQueryHandler,
  GetPaymentHistoryQueryHandler,
  GetCurrentSubscriptionQueryHandler,
  GetAllPaymentsTcpQueryHandler,
  GetPaymentsAnalyticsTcpQueryHandler,
];

const commands = [
  CreateStripeCheckoutUseCase,
  ActivateSubscriptionUseCase,
  ToggleAutoRenewalUseCase,
  SubscriptionPendingUseCase,
];
const events = [UserDeletedHandler];

const jobs = [NotificationSchedulerService];

@Module({
  imports: [
    UserAccountModule,
    NotificationsModule,
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
  providers: [...queries, ...commands, ...events, ...jobs],
})
export class BillingModule {}
