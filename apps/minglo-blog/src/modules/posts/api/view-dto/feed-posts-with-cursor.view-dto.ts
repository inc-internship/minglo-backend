import { ApiProperty } from '@nestjs/swagger';
import { FeedPostViewDto } from './feed-post.view-dto';

export class FeedPostsWithCursorViewDto {
  @ApiProperty({ type: () => [FeedPostViewDto] })
  items: FeedPostViewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;

  @ApiProperty()
  hasNextPage: boolean;
}