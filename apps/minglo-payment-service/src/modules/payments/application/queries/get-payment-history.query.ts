import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PaymentHistoryViewDto, PaymentItemViewDto } from '@app/payments/view-dto';
import { PaymentsRepository } from '../../infrastructure';
import { PaymentStatus, PaymentSystem } from '@app/payments';

export class GetPaymentHistoryQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number,
    public readonly pageSize: number,
  ) {}
}

@QueryHandler(GetPaymentHistoryQuery)
export class GetPaymentHistoryQueryHandler implements IQueryHandler<
  GetPaymentHistoryQuery,
  PaymentHistoryViewDto
> {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetPaymentHistoryQueryHandler.name);
  }

  async execute({
    userId,
    page,
    pageSize,
  }: GetPaymentHistoryQuery): Promise<PaymentHistoryViewDto> {
    this.logger.log(
      `get_payment_history START userId=${userId} page=${page} pageSize=${pageSize}`,
      'execute',
    );

    const { payments, totalCount } = await this.repo.findPaymentHistory(userId, page, pageSize);

    const items: PaymentItemViewDto[] = payments.map((p) => ({
      id: p.id,
      paymentDate: p.createdAt.toISOString(),
      subscriptionExpiresAt: p.subscription.endDate?.toISOString() ?? null,
      amount: Number(p.amount).toFixed(2),
      planName: p.subscription.plan.name,
      paymentSystem: p.paymentSystem as PaymentSystem,
      status: p.status as PaymentStatus,
      failureReason: p.failureReason ?? null,
    }));

    const pagesCount = Math.ceil(totalCount / pageSize) || 1;

    this.logger.log(`get_payment_history DONE totalCount=${totalCount}`, 'execute');

    return { items, totalCount, page, pageSize, pagesCount };
  }
}
