import { ApiProperty } from '@nestjs/swagger';

class CommentAuthorViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;
}

export class CommentViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ type: CommentAuthorViewDto })
  author: CommentAuthorViewDto;

  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  repliesCount: number;

  @ApiProperty()
  isLiked: boolean;

  @ApiProperty()
  isOwn: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}