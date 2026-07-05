import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanViewDto {
  @ApiProperty({ example: 'plan_id' })
  public id: string;

  @ApiProperty({ example: '1 Day' })
  public name: string;

  @ApiProperty({ example: 1 })
  public durationDays: number;

  @ApiProperty({ example: '10.00' })
  public price: string;

  @ApiProperty({ example: 'USD' })
  public currency: string;
}

export class GetSubscriptionPlansViewDto {
  @ApiProperty({ type: () => [SubscriptionPlanViewDto] })
  data: SubscriptionPlanViewDto[];
}
