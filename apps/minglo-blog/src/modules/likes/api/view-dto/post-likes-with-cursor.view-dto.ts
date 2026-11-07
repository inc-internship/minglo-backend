import { ApiProperty } from '@nestjs/swagger';
import { PostLikeViewDto } from './post-like.view-dto';

export class PostLikesWithCursorViewDto {
  @ApiProperty({ type: () => [PostLikeViewDto] })
  items: PostLikeViewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;

  @ApiProperty()
  hasNextPage: boolean;
}
