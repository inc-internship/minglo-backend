import { ActiveUserDto } from '../../../../core/decorators/auth/dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { SessionQueryRepository } from '../../infrastructure/queries/session.query.repository';
import { GetDevicesViewDto } from '../../api/view-dto/get-devices-view.dto';

export class GetDevicesQuery {
  constructor(public readonly user: ActiveUserDto) {}
}

@QueryHandler(GetDevicesQuery)
export class GetDevicesHandler implements IQueryHandler<GetDevicesQuery> {
  constructor(
    private readonly sessionQueryRepo: SessionQueryRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(GetDevicesQuery.name);
  }

  async execute({ user }: GetDevicesQuery): Promise<GetDevicesViewDto[]> {
    const { userId } = user;
    this.logger.log('take all device', 'execute');
    return await this.sessionQueryRepo.getDevices(userId);
  }
}
