import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AdminPostsPageType } from '../../api/view-dto/admin-post.view-dto';
import { PostsQueryInput } from '../../api/input-dto/posts-query.input';
import { AdminQueryRepository } from '../../infrastructure/admin.query-repository';

export class GetAllPostsQuery {
  constructor(public readonly input: PostsQueryInput) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsQueryHandler implements IQueryHandler<
  GetAllPostsQuery,
  AdminPostsPageType
> {
  constructor(private readonly adminQueryRepo: AdminQueryRepository) {}

  async execute({ input }: GetAllPostsQuery): Promise<AdminPostsPageType> {
    const { posts, totalCount } = await this.adminQueryRepo.findPostsList(input);
    return AdminPostsPageType.mapToView(posts, totalCount, input.pageSize);
  }
}
