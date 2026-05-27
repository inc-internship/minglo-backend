import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TotalCountRegisteredUsersViewDto } from '../../api/view-dto';
import { UserQueryRepository } from '../../infrastructure/queries';
import { LoggerService } from '@app/logger';

export class GetTotalRegisteredUserCountQuery {
  constructor() {}
}

@QueryHandler(GetTotalRegisteredUserCountQuery)
export class GetTotalRegisteredUserCountQueryHandler implements IQueryHandler<
  GetTotalRegisteredUserCountQuery,
  TotalCountRegisteredUsersViewDto
> {
  constructor(
    private readonly usersQueryRepo: UserQueryRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(): Promise<TotalCountRegisteredUsersViewDto> {
    this.logger.log('Get Total Registered Users Count START', 'execute');

    const totalCount = await this.usersQueryRepo.getTotalRegisteredCount();

    this.logger.log(`GetTotalRegisteredUserCount SUCCESS count=${totalCount}`, 'execute');

    return { totalCount };
  }
}
