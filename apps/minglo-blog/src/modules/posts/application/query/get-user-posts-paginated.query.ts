import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PostQueryRepository } from '../../infrastructure/query';
import { PostsWithCursorViewDto } from '../../api/view-dto';

export class GetUserPostsPaginatedQuery {
  constructor(
    public userId: string,
    public cursor?: string,
  ) {}
}

@QueryHandler(GetUserPostsPaginatedQuery)
export class GetUserPostsPaginatedQueryHandler implements IQueryHandler<
  GetUserPostsPaginatedQuery,
  PostsWithCursorViewDto
> {
  constructor(
    private readonly postsQueryRepo: PostQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetUserPostsPaginatedQueryHandler.name);
  }

  async execute({ userId, cursor }: GetUserPostsPaginatedQuery): Promise<PostsWithCursorViewDto> {
    this.logger.log(`posts:list START userId=${userId}`, 'execute');

    const posts = await this.postsQueryRepo.findUserPosts(userId, cursor);

    this.logger.log(`posts:list DONE userId=${userId} count=${posts.items.length}`, 'execute');

    return posts;
  }
}
