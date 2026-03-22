import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ActiveUserDto } from '../../../../../core/decorators/auth/dto/active-user.dto';
import { LoggerService } from '@app/logger';
import { UserQueryRepository } from '../../../infrastructure/queries/user.query.repository';
import { UserMeViewDto } from '../../../api/view-dto/user-me.view-dto';

export class MeQuery {
  constructor(public readonly user: ActiveUserDto) {}
}

@QueryHandler(MeQuery)
export class MeUseCase implements IQueryHandler<MeQuery> {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(MeUseCase.name);
  }

  async execute(command: MeQuery): Promise<UserMeViewDto> {
    const { user } = command;
    return await this.userQueryRepository.getById(user.userId);
  }
}
