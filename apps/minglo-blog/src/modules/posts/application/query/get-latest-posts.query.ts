import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto';
import { LoggerService } from '@app/logger';
import { PostQueryRepository } from '../../infrastructure/query';

export class GetLatestPostsQuery {}

@QueryHandler(GetLatestPostsQuery)
export class GetLatestPostsQueryHandler implements IQueryHandler<
  GetLatestPostsQuery,
  PostViewDto[]
> {
  constructor(
    private readonly queryRepo: PostQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetLatestPostsQueryHandler.name);
  }

  async execute(): Promise<PostViewDto[]> {
    const posts = await this.queryRepo.findLatestPosts();

    this.logger.log(`latest posts | count=${posts.length}`);

    return posts;
  }
}
