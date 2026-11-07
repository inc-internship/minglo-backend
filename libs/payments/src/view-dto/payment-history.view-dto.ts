import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentSystem } from '@app/payments/enums';

export class PaymentItemViewDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, format: 'date-time' })
  paymentDate: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  subscriptionExpiresAt: string | null;

  @ApiProperty({ type: String })
  amount: string;

  @ApiProperty({ type: String })
  planName: string;

  @ApiProperty({ enum: PaymentSystem, enumName: 'PaymentSystem' })
  paymentSystem: PaymentSystem;

  @ApiProperty({ enum: PaymentStatus, enumName: 'PaymentStatus' })
  status: PaymentStatus;

  @ApiProperty({ nullable: true, type: String })
  failureReason: string | null;
}

export class PaymentHistoryViewDto {
  @ApiProperty({ type: () => [PaymentItemViewDto] })
  items: PaymentItemViewDto[];

  @ApiProperty({ type: Number })
  totalCount: number;

  @ApiProperty({ type: Number })
  page: number;

  @ApiProperty({ type: Number })
  pageSize: number;

  @ApiProperty({ type: Number })
  pagesCount: number;
}
