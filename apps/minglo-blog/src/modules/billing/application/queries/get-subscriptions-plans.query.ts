import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { PAYMENT_SERVICE } from '@app/payments';
import { GetSubscriptionPlansViewDto } from '@app/payments/view-dto';
import { firstValueFrom } from 'rxjs';

export class GetSubscriptionsPlansQuery {
  constructor() {}
}

@QueryHandler(GetSubscriptionsPlansQuery)
export class GetSubscriptionsPlansQueryHandler implements IQueryHandler<
  GetSubscriptionsPlansQuery,
  GetSubscriptionPlansViewDto
> {
  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetSubscriptionsPlansQueryHandler.name);
  }

  async execute(): Promise<GetSubscriptionPlansViewDto> {
    this.logger.log(`Get Subscription plans START`, 'execute');

    const plans = await firstValueFrom(
      this.paymentClient.send<GetSubscriptionPlansViewDto>('get_plans', {}),
    );

    this.logger.log(`Get Subscription plans DONE`, 'execute');

    return plans;
  }
}
