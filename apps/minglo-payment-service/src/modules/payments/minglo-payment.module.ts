import { Module } from '@nestjs/common';
import { MingloPaymentsTcpController } from './api/minglo-payments-tcp.controller';
import {
  GetPlansQueryHandler,
  GetPaymentHistoryQueryHandler,
  GetCurrentSubscriptionQueryHandler,
} from './application/queries';
import {
  CreateStripeCheckoutUseCase,
  StripeWebhookUseCase,
  ToggleAutoRenewalUseCase,
} from './application/usecases';
import { PrismaPaymentsModule } from '../../database';
import { StripeModule } from '../stripe/stripe.module';
import { PaymentsRepository } from './infrastructure';
import { SubscriptionActivatedHandler } from './application/events';
import { RmqPublisherModule } from '../rmq/rmq-publisher.module';
import { SubscriptionsJob } from './application/jobs/subscriptions.job';

const queries = [
  GetPlansQueryHandler,
  GetPaymentHistoryQueryHandler,
  GetCurrentSubscriptionQueryHandler,
];
const commands = [CreateStripeCheckoutUseCase, StripeWebhookUseCase, ToggleAutoRenewalUseCase];
const events = [SubscriptionActivatedHandler];
const jobs = [SubscriptionsJob];

@Module({
  imports: [StripeModule, PrismaPaymentsModule, RmqPublisherModule],
  controllers: [MingloPaymentsTcpController],
  providers: [...queries, ...commands, ...events, ...jobs, PaymentsRepository],
})
export class MingloPaymentModule {}
