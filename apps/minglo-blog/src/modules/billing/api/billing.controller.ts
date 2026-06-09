import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetSubscriptionsPlansQuery } from '../application/queries';
import { GetSubscriptionPlansViewDto } from '@app/payments/view-dto';
import { ApiCreateStripeCheckout, ApiGetSubscriptionPlans } from '../../../core/decorators/swagger';
import { CreateStripeCheckoutInputDto } from './input-dto/create-stripe-checkout.input-dto';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { CreateStripeCheckoutCommand } from '../application/usecases';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(BillingController.name);
  }

  @Get('plans')
  @ApiGetSubscriptionPlans()
  @HttpCode(HttpStatus.OK)
  async getSubscriptionPlans(): Promise<GetSubscriptionPlansViewDto> {
    this.logger.log(`New GET subscription plans request received`, 'getSubscriptionPlans');
    return this.queryBus.execute<GetSubscriptionsPlansQuery, GetSubscriptionPlansViewDto>(
      new GetSubscriptionsPlansQuery(),
    );
  }

  @Post('checkout/stripe')
  @ApiCreateStripeCheckout()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async createStripeCheckout(
    @CurrentUser() user: ActiveUserDto,
    @Body() dto: CreateStripeCheckoutInputDto,
  ): Promise<{ checkoutUrl: string }> {
    this.logger.log(
      `New POST /checkout/stripe request, userId=${user.userId}`,
      'createStripeCheckout',
    );
    return this.commandBus.execute(new CreateStripeCheckoutCommand(user.userId, dto.planId));
  }
}
