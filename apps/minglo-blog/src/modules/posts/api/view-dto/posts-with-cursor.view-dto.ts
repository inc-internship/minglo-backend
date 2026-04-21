import { ApiProperty } from '@nestjs/swagger';
import { PostViewDto } from './post.view-dto';

export class PostsWithCursorViewDto {
  @ApiProperty()
  items: PostViewDto[];

  @ApiProperty()
  nextCursor: string | null;

  @ApiProperty()
  hasNextPage: boolean;
}
