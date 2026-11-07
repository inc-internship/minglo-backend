import { ApiProperty } from '@nestjs/swagger';
import { PaymentSortField } from '@app/payments/enums';

export class GetAllPaymentsInputDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({ enum: PaymentSortField })
  sortBy: PaymentSortField;

  @ApiProperty({ type: [String], required: false })
  userIds?: string[];
}
