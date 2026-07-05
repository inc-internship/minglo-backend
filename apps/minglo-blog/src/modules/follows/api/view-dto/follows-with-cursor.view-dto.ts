import { ApiProperty } from '@nestjs/swagger';
import { FollowViewDto } from './follow.view-dto';

export class FollowsWithCursorViewDto {
  @ApiProperty({ type: () => [FollowViewDto] })
  items: FollowViewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;

  @ApiProperty()
  hasNextPage: boolean;
}
