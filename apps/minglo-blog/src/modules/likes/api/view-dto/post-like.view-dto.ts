import { ApiProperty } from '@nestjs/swagger';

export class PostLikeViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  likedAt: string;
}
