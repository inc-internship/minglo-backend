import { ApiProperty } from '@nestjs/swagger';
import { PostViewDto } from './post.view-dto';

export class PostsWithCursorViewDto {
  @ApiProperty({
    type: () => [PostViewDto],
  })
  items: PostViewDto[];

  @ApiProperty({
    type: String,
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty()
  hasNextPage: boolean;
}
