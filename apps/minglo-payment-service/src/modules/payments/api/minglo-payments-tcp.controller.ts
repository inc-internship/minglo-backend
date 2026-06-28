import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { GetSubscriptionPlansViewDto } from '@app/payments/view-dto';
import { PaymentHistoryViewDto, SubscriptionInfoViewDto } from '@app/payments/view-dto';
import { ExpiringSubscriptionDto } from '@app/payments';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  GetPlansQuery,
  GetPaymentHistoryQuery,
  GetCurrentSubscriptionQuery,
  GetExpiringSubscriptionsQuery,
} from '../application/queries';
import { CreateStripeCheckoutInputDto } from './input-dto/create-stripe-checkout.input-dto';
import { GetPaymentHistoryInputDto } from './input-dto/get-payment-history.input-dto';
import { ToggleAutoRenewalInputDto } from './input-dto/toggle-auto-renewal.input-dto';
import {
  CreateStripeCheckoutCommand,
  StripeWebhookCommand,
  ToggleAutoRenewalCommand,
  DeleteUserDataCommand,
} from '../application/usecases';
import { PAYMENTS_TCP_PATTERNS } from '@app/payments';

@Controller()
export class MingloPaymentsTcpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MingloPaymentsTcpController.name);
  }

  @MessagePattern('get_plans')
  async getPlans(): Promise<GetSubscriptionPlansViewDto> {
    this.logger.log(`New GET_PLANS request received`, 'getPlans');
    return this.queryBus.execute<GetPlansQuery, GetSubscriptionPlansViewDto>(new GetPlansQuery());
  }

  @MessagePattern('create_stripe_checkout')
  async createStripeCheckout(
    @Payload() dto: CreateStripeCheckoutInputDto,
  ): Promise<{ checkoutUrl: string }> {
    this.logger.log(
      `New CREATE_STRIPE_CHECKOUT request, userId=${dto.userId}`,
      'createStripeCheckout',
    );
    return this.commandBus.execute(new CreateStripeCheckoutCommand(dto.userId, dto.planId));
  }

  @EventPattern(PAYMENTS_TCP_PATTERNS.STRIPE_WEBHOOK)
  async handleStripeWebhook(
    @Payload() data: { rawBodyBase64: string; signature: string },
  ): Promise<void> {
    this.logger.log('Stripe webhook event received via TCP', 'handleStripeWebhook');
    const rawBody = Buffer.from(data.rawBodyBase64, 'base64');
    await this.commandBus.execute(new StripeWebhookCommand(rawBody, data.signature));
  }

  @MessagePattern(PAYMENTS_TCP_PATTERNS.GET_PAYMENT_HISTORY)
  async getPaymentHistory(
    @Payload() dto: GetPaymentHistoryInputDto,
  ): Promise<PaymentHistoryViewDto> {
    this.logger.log(
      `New GET_PAYMENT_HISTORY request, userId=${dto.userId} page=${dto.page}`,
      'getPaymentHistory',
    );
    return this.queryBus.execute(new GetPaymentHistoryQuery(dto.userId, dto.page, dto.pageSize));
  }

  @MessagePattern(PAYMENTS_TCP_PATTERNS.GET_CURRENT_SUBSCRIPTION)
  async getCurrentSubscription(
    @Payload() dto: { userId: string },
  ): Promise<SubscriptionInfoViewDto> {
    this.logger.log(
      `New GET_CURRENT_SUBSCRIPTION request, userId=${dto.userId}`,
      'getCurrentSubscription',
    );
    return this.queryBus.execute(new GetCurrentSubscriptionQuery(dto.userId));
  }

  @MessagePattern(PAYMENTS_TCP_PATTERNS.TOGGLE_AUTO_RENEWAL)
  async toggleAutoRenewal(@Payload() dto: ToggleAutoRenewalInputDto): Promise<null> {
    this.logger.log(
      `New TOGGLE_AUTO_RENEWAL request, userId=${dto.userId} autoRenewal=${dto.autoRenewal}`,
      'toggleAutoRenewal',
    );
    await this.commandBus.execute(new ToggleAutoRenewalCommand(dto.userId, dto.autoRenewal));
    return null;
  }

  @MessagePattern(PAYMENTS_TCP_PATTERNS.GET_EXPIRING_SUBSCRIPTIONS)
  async getExpiringSubscriptions(
    @Payload() dto: { days: number },
  ): Promise<ExpiringSubscriptionDto[]> {
    this.logger.log(
      `New GET_EXPIRING_SUBSCRIPTIONS request, days=${dto.days}`,
      'getExpiringSubscriptions',
    );
    return this.queryBus.execute(new GetExpiringSubscriptionsQuery(dto.days));
  }

  @EventPattern(PAYMENTS_TCP_PATTERNS.DELETE_USER_DATA)
  async deleteUserData(@Payload() data: { userId: string }): Promise<void> {
    this.logger.log(`Received DELETE_USER_DATA for userId=${data.userId}`, 'deleteUserData');
    await this.commandBus.execute(new DeleteUserDataCommand(data.userId));
  }
}
