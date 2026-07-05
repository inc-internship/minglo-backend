import { ApiProperty } from '@nestjs/swagger';
import { FeedPostWithData } from '../../../../../prisma/types';
import { PostMediaFileViewDto } from './post-media-file.view-dto';

class FeedPostOwnerViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;
}

export class FeedPostViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: () => [PostMediaFileViewDto] })
  images: PostMediaFileViewDto[];

  @ApiProperty({ type: FeedPostOwnerViewDto })
  owner: FeedPostOwnerViewDto;

  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  commentsCount: number;

  @ApiProperty()
  isLiked: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static mapToView(post: FeedPostWithData, currentUserId: number): FeedPostViewDto {
    const dto = new FeedPostViewDto();
    dto.id = post.publicId;
    dto.description = post.description;
    dto.images = post.postsMediaFiles.map((f) => PostMediaFileViewDto.create(f));
    dto.owner = {
      id: post.user.publicId,
      login: post.user.login,
      avatarUrl: post.user.profile?.avatar?.urlThumbnail ?? null,
    };
    dto.likesCount = post._count.likes;
    dto.commentsCount = post._count.comments;
    dto.isLiked = post.likes.some((l) => l.userId === currentUserId);
    dto.createdAt = post.createdAt.toISOString();
    dto.updatedAt = post.updatedAt.toISOString();
    return dto;
  }
}
