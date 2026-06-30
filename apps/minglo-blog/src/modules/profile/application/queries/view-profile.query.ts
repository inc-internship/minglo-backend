import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { ProfileQueryRepository } from '../../infrastructure/queries/profile.query.repository';
import { ProfileViewDto } from '../../api/view-dto';
import { ActiveUserDto } from '../../../../core/decorators/auth/dto';

export class ViewProfileQuery {
  constructor(
    public readonly id: string,
    public readonly currentUser: ActiveUserDto | null,
  ) {}
}

@QueryHandler(ViewProfileQuery)
export class ViewProfileHandler implements IQueryHandler<ViewProfileQuery, ProfileViewDto> {
  constructor(
    private readonly profileQueryRepo: ProfileQueryRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ViewProfileQuery.name);
  }

  async execute(query: ViewProfileQuery): Promise<ProfileViewDto> {
    const { id, currentUser } = query;
    this.logger.log(`Check profile, viewer=${currentUser?.userId ?? 'anonymous'}`, 'execute');
    return await this.profileQueryRepo.getProfile(id, currentUser?.userId ?? null);
  }
}
