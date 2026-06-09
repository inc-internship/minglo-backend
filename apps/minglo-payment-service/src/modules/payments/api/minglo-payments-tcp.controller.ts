import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetSubscriptionPlansViewDto } from '@app/payments/view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetPlansQuery } from '../application/queries';
import { CreateStripeCheckoutInputDto } from './input-dto/create-stripe-checkout.input-dto';
import { CreateStripeCheckoutCommand } from '../application/usecases';

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
}
