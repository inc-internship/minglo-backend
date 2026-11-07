import { ApiProperty } from '@nestjs/swagger';

export class UserSearchItemViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  isFollowing: boolean;
}