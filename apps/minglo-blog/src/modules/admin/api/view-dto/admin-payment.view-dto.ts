import { Field, ObjectType } from '@nestjs/graphql';
import { PaymentHistoryViewDto, PaymentItemViewDto } from '@app/payments/view-dto';
import { PaginatedType } from './paginated.view-dto';

@ObjectType()
export class AdminPaymentItemType {
  @Field() id: string;
  @Field() paymentDate: string;
  @Field(() => String, { nullable: true }) subscriptionExpiresAt: string | null;
  @Field() amount: string;
  @Field() planName: string;
  @Field() paymentSystem: string;
  @Field() status: string;
  @Field(() => String, { nullable: true }) failureReason: string | null;

  static mapToView(item: PaymentItemViewDto): AdminPaymentItemType {
    const dto = new AdminPaymentItemType();
    dto.id = item.id;
    dto.paymentDate = item.paymentDate;
    dto.subscriptionExpiresAt = item.subscriptionExpiresAt;
    dto.amount = item.amount;
    dto.planName = item.planName;
    dto.paymentSystem = item.paymentSystem;
    dto.status = item.status;
    dto.failureReason = item.failureReason;
    return dto;
  }
}

@ObjectType()
export class PaymentsPageType extends PaginatedType(AdminPaymentItemType) {
  static mapToView(dto: PaymentHistoryViewDto): PaymentsPageType {
    const result = new PaymentsPageType();
    result.items = dto.items.map((i) => AdminPaymentItemType.mapToView(i));
    result.totalCount = dto.totalCount;
    result.pagesCount = dto.pagesCount;
    result.page = dto.page;
    return result;
  }
}
