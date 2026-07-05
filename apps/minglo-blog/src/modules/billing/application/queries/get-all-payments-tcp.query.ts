import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentSortField } from '@app/payments/enums';
import { PAYMENT_SERVICE } from '@app/payments';
import { AllPaymentsViewDto } from '@app/payments/view-dto';
import { PAYMENTS_TCP_PATTERNS } from '@app/payments/constants';
import { tcpCall } from '@app/exceptions';

export class GetAllPaymentsTcpQuery {
  constructor(
    public readonly page: number,
    public readonly pageSize: number,
    public readonly sortBy: PaymentSortField,
    public readonly userIds?: string[],
  ) {}
}

@QueryHandler(GetAllPaymentsTcpQuery)
export class GetAllPaymentsTcpQueryHandler implements IQueryHandler<
  GetAllPaymentsTcpQuery,
  AllPaymentsViewDto
> {
  constructor(@Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy) {}

  execute(query: GetAllPaymentsTcpQuery): Promise<AllPaymentsViewDto> {
    return tcpCall(
      this.paymentClient.send(PAYMENTS_TCP_PATTERNS.GET_ALL_PAYMENTS, query),
      'Payment Service is unavailable',
    );
  }
}
