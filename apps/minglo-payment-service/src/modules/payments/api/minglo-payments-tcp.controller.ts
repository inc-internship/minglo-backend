import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { MessagePattern } from '@nestjs/microservices';
import { GetSubscriptionPlansViewDto } from '@app/payments/view-dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetPlansQuery } from '../application/queries';

@Controller()
export class MingloPaymentsTcpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MingloPaymentsTcpController.name);
  }

  @MessagePattern('get_plans')
  async getPlans(): Promise<GetSubscriptionPlansViewDto> {
    this.logger.log(`New GET_PLANS request received`, 'getPlans');
    return this.queryBus.execute<GetPlansQuery, GetSubscriptionPlansViewDto>(new GetPlansQuery());
  }
}
