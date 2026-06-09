import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@app/payments/enums';

export class SubscriptionViewDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  planName: string;

  @ApiProperty({ type: String })
  price: string;

  @ApiProperty({ enum: SubscriptionStatus, enumName: 'SubscriptionStatus' })
  status: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  startDate: string | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  endDate: string | null;

  @ApiProperty({ type: Boolean })
  autoRenewal: boolean;
}

/** Returned by payments-service over TCP (no accountType) */
export class SubscriptionInfoViewDto {
  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  expiresAt: string | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  nextPaymentDate: string | null;

  @ApiProperty({ type: () => [SubscriptionViewDto] })
  subscriptions: SubscriptionViewDto[];
}

/** Returned to HTTP client by minglo-blog (includes accountType) */
export class CurrentSubscriptionInfoViewDto {
  @ApiProperty({ type: String })
  accountType: string;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  expiresAt: string | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  nextPaymentDate: string | null;

  @ApiProperty({ type: () => [SubscriptionViewDto] })
  subscriptions: SubscriptionViewDto[];
}
