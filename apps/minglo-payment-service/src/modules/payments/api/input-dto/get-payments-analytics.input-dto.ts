import { ApiProperty } from '@nestjs/swagger';

export class GetPaymentsAnalyticsInputDto {
  @ApiProperty()
  dateFrom: string;

  @ApiProperty()
  dateTo: string;
}
