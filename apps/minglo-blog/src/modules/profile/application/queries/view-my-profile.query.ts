import { ActiveUserDto } from '../../../../core/decorators/auth/dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { ProfileQueryRepository } from '../../infrastructure/queries/profile.query.repository';
import { MyProfileViewDto } from '../../api/view-dto';

export class ViewMyProfileQuery {
  constructor(public readonly user: ActiveUserDto) {}
}

@QueryHandler(ViewMyProfileQuery)
export class ViewMyProfileHandler implements IQueryHandler<ViewMyProfileQuery, MyProfileViewDto> {
  constructor(
    private readonly profileQueryRepo: ProfileQueryRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(ViewMyProfileQuery.name);
  }

  async execute({ user }: ViewMyProfileQuery): Promise<MyProfileViewDto> {
    const { userId } = user;
    this.logger.log(`Check my profile`, 'execute');
    return await this.profileQueryRepo.getMyProfile(userId);
  }
}
