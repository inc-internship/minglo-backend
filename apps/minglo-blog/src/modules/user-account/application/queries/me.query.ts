import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { UserQueryRepository } from '../../infrastructure/queries/user.query.repository';
import { MeViewDto } from '../../api/view-dto/me-view.dto';
import { ActiveUserDto } from '../../../../core/decorators/auth/dto';

export class MeQuery {
  constructor(public readonly user: ActiveUserDto) {}
}

@QueryHandler(MeQuery)
export class MeHandler implements IQueryHandler<MeQuery> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(MeQuery.name);
  }

  async execute(command: MeQuery): Promise<MeViewDto> {
    const { user } = command;
    return await this.userQueryRepository.getById(user.userId);
  }
}
