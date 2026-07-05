import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PostWithUserAndMedia } from '../../../../../prisma/types';

@ObjectType()
export class AdminPostType {
  @Field() id: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field() createdAt: string;
  @Field() userId: string;
  @Field() username: string;
  @Field(() => [String]) imageUrls: string[];

  static mapToView(post: PostWithUserAndMedia): AdminPostType {
    const dto = new AdminPostType();
    dto.id = post.publicId;
    dto.description = post.description;
    dto.createdAt = post.createdAt.toISOString();
    dto.userId = post.user.publicId;
    dto.username = post.user.login;
    dto.imageUrls = post.postsMediaFiles.sort((a, b) => a.order - b.order).map((m) => m.url);
    return dto;
  }
}

@ObjectType()
export class AdminPostsPageType {
  @Field(() => [AdminPostType]) items: AdminPostType[];
  @Field(() => Int) totalCount: number;
  @Field(() => String, { nullable: true }) nextCursor: string | null;
  @Field() hasNextPage: boolean;

  static mapToView(
    posts: PostWithUserAndMedia[],
    totalCount: number,
    pageSize: number,
  ): AdminPostsPageType {
    const hasNextPage = posts.length > pageSize;
    const page = hasNextPage ? posts.slice(0, pageSize) : posts;

    const dto = new AdminPostsPageType();
    dto.items = page.map((p) => AdminPostType.mapToView(p));
    dto.totalCount = totalCount;
    dto.hasNextPage = hasNextPage;
    dto.nextCursor = hasNextPage ? page[page.length - 1].publicId : null;
    return dto;
  }
}
