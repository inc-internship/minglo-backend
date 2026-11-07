import { ApiProperty } from '@nestjs/swagger';

export class GetPaymentHistoryInputDto {
  @ApiProperty({ type: String })
  userId: string;
  @ApiProperty({ type: Number })
  page: number;
  @ApiProperty({ type: Number })
  pageSize: number;
}
