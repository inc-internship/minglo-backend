import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PaymentStatus, PaymentSystem } from '@app/payments/enums';
import { AllPaymentsViewDto, AllPaymentItemViewDto } from '@app/payments/view-dto';
import { PaymentSortField } from '@app/payments/enums';
import { PaymentsRepository } from '../../infrastructure';

export class GetAllPaymentsQuery {
  constructor(
    public readonly page: number,
    public readonly pageSize: number,
    public readonly sortBy: PaymentSortField,
    public readonly userIds?: string[],
  ) {}
}

@QueryHandler(GetAllPaymentsQuery)
export class GetAllPaymentsQueryHandler implements IQueryHandler<
  GetAllPaymentsQuery,
  AllPaymentsViewDto
> {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetAllPaymentsQueryHandler.name);
  }

  async execute({
    page,
    pageSize,
    sortBy,
    userIds,
  }: GetAllPaymentsQuery): Promise<AllPaymentsViewDto> {
    this.logger.log(
      `get_all_payments START page=${page} pageSize=${pageSize} sortBy=${sortBy}`,
      'execute',
    );

    const { payments, totalCount } = await this.repo.findAllPayments(
      page,
      pageSize,
      sortBy,
      userIds,
    );

    const items: AllPaymentItemViewDto[] = payments.map((p) => ({
      id: p.id,
      userId: p.userId,
      paymentDate: p.createdAt.toISOString(),
      amount: Number(p.amount).toFixed(2),
      planName: p.subscription.plan.name,
      paymentSystem: p.paymentSystem as PaymentSystem,
      status: p.status as PaymentStatus,
    }));

    const pagesCount = Math.ceil(totalCount / pageSize) || 1;

    this.logger.log(`get_all_payments DONE totalCount=${totalCount}`, 'execute');

    return { items, totalCount, page, pageSize, pagesCount };
  }
}
