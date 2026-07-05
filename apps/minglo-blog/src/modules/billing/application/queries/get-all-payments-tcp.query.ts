import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaymentSortField } from '@app/payments/enums';
import { PAYMENT_SERVICE } from '@app/payments';
import { AllPaymentsViewDto } from '@app/payments/view-dto';
import { PAYMENTS_TCP_PATTERNS } from '@app/payments/constants';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

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

  async execute(query: GetAllPaymentsTcpQuery): Promise<AllPaymentsViewDto> {
    try {
      return await firstValueFrom(
        this.paymentClient.send<AllPaymentsViewDto>(PAYMENTS_TCP_PATTERNS.GET_ALL_PAYMENTS, query),
      );
    } catch (error) {
      // временно — увидеть реальную причину без искажений
      console.error('🔥 RAW TCP ERROR:', error);
      throw new DomainException({
        code: error?.code ?? DomainExceptionCode.InternalServerError,
        message: error?.message ?? 'Payment Service is unavailable',
        extensions: error?.extensions ?? [],
      });
    }
  }
}
