import { ApiProperty } from '@nestjs/swagger';
import { CommentViewDto } from './comment.view-dto';

export class CommentsWithCursorViewDto {
  @ApiProperty({ type: () => [CommentViewDto] })
  items: CommentViewDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;

  @ApiProperty()
  hasNextPage: boolean;
}