import { ActiveUserDto } from '../../../../core/decorators/auth/dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { SessionQueryRepository } from '../../infrastructure/queries/session.query.repository';
import { SessionViewDto } from '../../api/view-dto/session-view.dto';

export class GetDevicesQuery {
  constructor(public readonly user: ActiveUserDto) {}
}

@QueryHandler(GetDevicesQuery)
export class GetDevicesHandler implements IQueryHandler<GetDevicesQuery, SessionViewDto[]> {
  constructor(
    private readonly sessionQueryRepo: SessionQueryRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(GetDevicesQuery.name);
  }

  async execute({ user }: GetDevicesQuery): Promise<SessionViewDto[]> {
    const { userId } = user;
    this.logger.log('take all device', 'execute');
    return await this.sessionQueryRepo.getSession(userId);
  }
}
