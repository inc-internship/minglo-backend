import { ApiProperty } from '@nestjs/swagger';

export class TotalCountRegisteredUsersViewDto {
  @ApiProperty()
  totalCount: number;
}
