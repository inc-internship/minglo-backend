import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto';
import { LoggerService } from '@app/logger';
import { PostQueryRepository } from '../../infrastructure/query';

export class GetPostByIdQuery {
  constructor(public readonly postPublicId: string) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery, PostViewDto> {
  constructor(
    private readonly queryRepo: PostQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetPostByIdQueryHandler.name);
  }

  async execute({ postPublicId }: GetPostByIdQuery): Promise<PostViewDto> {
    this.logger.log(`GetPostById START | postId=${postPublicId}`, 'execute');

    const post = await this.queryRepo.findByPublicIdOrFail(postPublicId);

    this.logger.log(`GetPostById OK | postId=${postPublicId}`, 'execute');

    return post;
  }
}
