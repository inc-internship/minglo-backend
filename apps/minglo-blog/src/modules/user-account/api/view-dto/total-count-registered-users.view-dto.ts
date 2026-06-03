import { ApiProperty } from '@nestjs/swagger';

export class TotalCountRegisteredUsersViewDto {
  @ApiProperty({ type: Number })
  totalCount: number;
}
