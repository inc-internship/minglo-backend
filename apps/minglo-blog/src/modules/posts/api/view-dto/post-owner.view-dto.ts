import { ApiProperty } from '@nestjs/swagger';

export class PostOwnerViewDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  login: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
}
