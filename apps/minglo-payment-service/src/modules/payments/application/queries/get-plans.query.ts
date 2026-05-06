import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSubscriptionPlansViewDto } from '@app/payments/view-dto';
import { PrismaPaymentService } from '../../../../database';
import { LoggerService } from '@app/logger';
import { SubscriptionPlanMapper } from '../mappers';

export class GetPlansQuery {
  constructor() {}
}

@QueryHandler(GetPlansQuery)
export class GetPlansQueryHandler implements IQueryHandler<
  GetPlansQuery,
  GetSubscriptionPlansViewDto
> {
  constructor(
    private readonly prisma: PrismaPaymentService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetPlansQueryHandler.name);
  }

  async execute(): Promise<GetSubscriptionPlansViewDto> {
    this.logger.log(`get_plans START`, 'execute');
    const plans = await this.prisma.plan.findMany({ where: { isActive: true } });

    this.logger.log(`get_plans DONE, plans count: ${plans.length}`, 'execute');
    return SubscriptionPlanMapper.toListViewDto(plans);
  }
}
