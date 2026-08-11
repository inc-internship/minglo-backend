import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PAYMENT_SERVICE } from '@app/payments';
import { PaymentsAnalyticsItemViewDto } from '@app/payments/view-dto';
import { PAYMENTS_TCP_PATTERNS } from '@app/payments/constants';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class GetPaymentsAnalyticsTcpQuery {
  constructor(
    public readonly dateFrom: string,
    public readonly dateTo: string,
  ) {}
}

@QueryHandler(GetPaymentsAnalyticsTcpQuery)
export class GetPaymentsAnalyticsTcpQueryHandler implements IQueryHandler<
  GetPaymentsAnalyticsTcpQuery,
  PaymentsAnalyticsItemViewDto[]
> {
  constructor(@Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy) {}

  async execute(query: GetPaymentsAnalyticsTcpQuery): Promise<PaymentsAnalyticsItemViewDto[]> {
    try {
      return await firstValueFrom(
        this.paymentClient.send<PaymentsAnalyticsItemViewDto[]>(
          PAYMENTS_TCP_PATTERNS.GET_PAYMENTS_ANALYTICS,
          query,
        ),
      );
    } catch (error) {
      throw new DomainException({
        code: error?.code ?? DomainExceptionCode.InternalServerError,
        message: error?.message ?? 'Payment Service is unavailable',
        extensions: error?.extensions ?? [],
      });
    }
  }
}
