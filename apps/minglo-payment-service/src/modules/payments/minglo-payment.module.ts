import { Module } from '@nestjs/common';
import { MingloPaymentsTcpController } from './api/minglo-payments-tcp.controller';
import { GetPlansQueryHandler } from './application/queries';
import { CreateStripeCheckoutUseCase, StripeWebhookUseCase } from './application/usecases';
import { PrismaPaymentsModule } from '../../database';
import { StripeModule } from '../stripe/stripe.module';
import { PaymentsRepository } from './infrastructure';
import { SubscriptionActivatedHandler } from './application/events';
import { RmqPublisherModule } from '../rmq/rmq-publisher.module';

const queries = [GetPlansQueryHandler];
const commands = [CreateStripeCheckoutUseCase, StripeWebhookUseCase];
const events = [SubscriptionActivatedHandler];

@Module({
  imports: [StripeModule, PrismaPaymentsModule, RmqPublisherModule],
  controllers: [MingloPaymentsTcpController],
  providers: [...queries, ...commands, ...events, PaymentsRepository],
})
export class MingloPaymentModule {}
