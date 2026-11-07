import { Field, InputType, Int } from '@nestjs/graphql';
import { PaymentSortField } from '../enums/admin-payment-sort.enum';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class PaymentsQueryInput {
  @IsInt()
  @Min(1)
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @Field(() => Int, { defaultValue: 6 })
  pageSize: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  search?: string;

  @IsEnum(PaymentSortField)
  @Field(() => PaymentSortField, { defaultValue: PaymentSortField.DATE_DESC })
  sortBy: PaymentSortField;
}
