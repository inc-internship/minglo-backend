import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@app/logger';
import { PAYMENT_SERVICE, PAYMENTS_TCP_PATTERNS } from '@app/payments';
import { PaymentHistoryViewDto } from '@app/payments/view-dto';
import { firstValueFrom } from 'rxjs';

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
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetPaymentHistoryQueryHandler.name);
  }

  async execute({
    userId,
    page,
    pageSize,
  }: GetPaymentHistoryQuery): Promise<PaymentHistoryViewDto> {
    this.logger.log(`GET payment history START userId=${userId}`, 'execute');

    const result = await firstValueFrom(
      this.paymentClient.send<PaymentHistoryViewDto>(PAYMENTS_TCP_PATTERNS.GET_PAYMENT_HISTORY, {
        userId,
        page,
        pageSize,
      }),
    );

    this.logger.log(`GET payment history DONE`, 'execute');
    return result;
  }
}
