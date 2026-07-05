import { ApiProperty } from '@nestjs/swagger';

export class FollowViewDto {
  @ApiProperty({ description: 'Public ID of the user' })
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ description: 'ISO date when the follow was created' })
  followedAt: string;
}
