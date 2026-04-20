import { Injectable } from '@nestjs/common';
import { PostMediaFileViewDto, PostOwnerViewDto, PostViewDto } from '../../api/view-dto';
import { PostMediaFile, PostWithMediaFileAndUserData } from '../../../../../prisma/types';

@Injectable()
export class PostViewMapper {
  toView(post: PostWithMediaFileAndUserData): PostViewDto {
    return {
      id: post.publicId,
      description: post.description,
      images: post.postsMediaFiles.map((pf: PostMediaFile) => PostMediaFileViewDto.create(pf)),
      owner: PostOwnerViewDto.create(post.user),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  toViewList(posts: PostWithMediaFileAndUserData[]): PostViewDto[] {
    return posts.map((post) => this.toView(post));
  }
}
