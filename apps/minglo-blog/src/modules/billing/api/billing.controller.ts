import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { QueryBus } from '@nestjs/cqrs';
import { GetSubscriptionsPlansQuery } from '../application/queries';
import { GetSubscriptionPlansViewDto } from '@app/payments/view-dto';
import { ApiGetSubscriptionPlans } from '../../../core/decorators/swagger';

@Controller('billing')
export class BillingController {
  constructor(
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
}
