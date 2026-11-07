import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { ProfileQueryRepository } from '../../infrastructure/queries/profile.query.repository';
import { UsersSearchWithCursorViewDto } from '../../api/view-dto';

export class GetUsersSearchQuery {
  constructor(
    public readonly username: string,
    public readonly currentUserPublicId: string | null,
    public readonly cursor?: string,
  ) {}
}

@QueryHandler(GetUsersSearchQuery)
export class GetUsersSearchQueryHandler
  implements IQueryHandler<GetUsersSearchQuery, UsersSearchWithCursorViewDto>
{
  constructor(
    private readonly profileQueryRepo: ProfileQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetUsersSearchQueryHandler.name);
  }

  async execute({ username, currentUserPublicId, cursor }: GetUsersSearchQuery): Promise<UsersSearchWithCursorViewDto> {
    this.logger.log(`SearchUsers username=${username}`, 'execute');
    return this.profileQueryRepo.searchUsers(username, currentUserPublicId, cursor);
  }
}