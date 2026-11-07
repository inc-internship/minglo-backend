import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedType } from './paginated.view-dto';

export interface GlobalPaymentRawItem {
  id: string;
  username: string;
  avatarUrl: string | null;
  paymentDate: string;
  amount: string;
  planName: string;
  paymentSystem: string;
  status: string;
}

@ObjectType()
export class GlobalPaymentItemType {
  @Field() id: string;
  @Field() username: string;
  @Field(() => String, { nullable: true }) avatarUrl: string | null;
  @Field() paymentDate: string;
  @Field() amount: string;
  @Field() planName: string;
  @Field() paymentSystem: string;
  @Field() status: string;

  static mapToView(item: GlobalPaymentRawItem): GlobalPaymentItemType {
    const dto = new GlobalPaymentItemType();
    dto.id = item.id;
    dto.username = item.username;
    dto.avatarUrl = item.avatarUrl;
    dto.paymentDate = item.paymentDate;
    dto.amount = item.amount;
    dto.planName = item.planName;
    dto.paymentSystem = item.paymentSystem;
    dto.status = item.status;
    return dto;
  }
}

@ObjectType()
export class GlobalPaymentsPageType extends PaginatedType(GlobalPaymentItemType) {
  static mapToView(
    items: GlobalPaymentRawItem[],
    totalCount: number,
    pagesCount: number,
    page: number,
  ): GlobalPaymentsPageType {
    const result = new GlobalPaymentsPageType();
    result.items = items.map((i) => GlobalPaymentItemType.mapToView(i));
    result.totalCount = totalCount;
    result.pagesCount = pagesCount;
    result.page = page;
    return result;
  }
}
