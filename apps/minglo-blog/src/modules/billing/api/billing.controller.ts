import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetSubscriptionsPlansQuery } from '../application/queries';
import { GetPaymentHistoryQuery } from '../application/queries';
import { GetCurrentSubscriptionQuery } from '../application/queries';
import { GetSubscriptionPlansViewDto } from '@app/payments/view-dto';
import { PaymentHistoryViewDto } from '@app/payments/view-dto';
import { CurrentSubscriptionInfoViewDto } from '@app/payments/view-dto';
import {
  ApiCreateStripeCheckout,
  ApiGetSubscriptionPlans,
  ApiGetPaymentHistory,
  ApiGetCurrentSubscription,
  ApiToggleAutoRenewal,
} from '../../../core/decorators/swagger';
import { CreateStripeCheckoutInputDto } from './input-dto/create-stripe-checkout.input-dto';
import { GetPaymentHistoryInputDto } from './input-dto/get-payment-history.input-dto';
import { ToggleAutoRenewalInputDto } from './input-dto/toggle-auto-renewal.input-dto';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { CreateStripeCheckoutCommand, ToggleAutoRenewalCommand } from '../application/usecases';
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

  @Get('history')
  @ApiGetPaymentHistory()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async getPaymentHistory(
    @CurrentUser() user: ActiveUserDto,
    @Query() query: GetPaymentHistoryInputDto,
  ): Promise<PaymentHistoryViewDto> {
    this.logger.log(`New GET /billing/history request, userId=${user.userId}`, 'getPaymentHistory');
    return this.queryBus.execute(
      new GetPaymentHistoryQuery(user.userId, query.page, query.pageSize),
    );
  }

  @Get('current')
  @ApiGetCurrentSubscription()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentSubscription(
    @CurrentUser() user: ActiveUserDto,
  ): Promise<CurrentSubscriptionInfoViewDto> {
    this.logger.log(
      `New GET /billing/current request, userId=${user.userId}`,
      'getCurrentSubscription',
    );
    return this.queryBus.execute(new GetCurrentSubscriptionQuery(user.userId));
  }

  @Patch('auto-renewal')
  @ApiToggleAutoRenewal()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async toggleAutoRenewal(
    @CurrentUser() user: ActiveUserDto,
    @Body() dto: ToggleAutoRenewalInputDto,
  ): Promise<void> {
    this.logger.log(
      `New PATCH /billing/auto-renewal request, userId=${user.userId}`,
      'toggleAutoRenewal',
    );
    return this.commandBus.execute(new ToggleAutoRenewalCommand(user.userId, dto.autoRenewal));
  }
}
