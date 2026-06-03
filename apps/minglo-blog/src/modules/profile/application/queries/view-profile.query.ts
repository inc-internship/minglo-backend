import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { ProfileQueryRepository } from '../../infrastructure/queries/profile.query.repository';
import { ProfileViewDto } from '../../api/view-dto';

export class ViewProfileQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(ViewProfileQuery)
export class ViewProfileHandler implements IQueryHandler<ViewProfileQuery, ProfileViewDto> {
  constructor(
    private readonly profileQueryRepo: ProfileQueryRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ViewProfileQuery.name);
  }

  async execute(command: ViewProfileQuery): Promise<ProfileViewDto> {
    const { id } = command;
    this.logger.log(`Check profile`, 'execute');
    return await this.profileQueryRepo.getProfile(id);
  }
}
