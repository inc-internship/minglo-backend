import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { AccessGuard } from '../guards/access.guard';
import { ApiSecurityGetDevicesDecorator } from '../../../core/decorators/swagger';
import { GetDevicesQuery } from '../application/queries/get-devices.query';
import { SessionViewDto } from './view-dto/session-view.dto';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly queryBus: QueryBus,
    private logger: LoggerService,
  ) {
    this.logger.setContext(SessionsController.name);
  }

  @Get()
  @ApiSecurityGetDevicesDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async getDevices(@CurrentUser() user: ActiveUserDto): Promise<SessionViewDto[]> {
    this.logger.log('Get devices', 'getDevices');
    return this.queryBus.execute<GetDevicesQuery, SessionViewDto[]>(new GetDevicesQuery(user));
  }
}
