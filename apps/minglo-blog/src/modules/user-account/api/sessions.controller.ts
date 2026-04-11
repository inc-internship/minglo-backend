import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { AccessGuard } from '../guards/access.guard';
import {
  ApiSessionDeleteDeviceDecorator,
  ApiSessionGetDevicesDecorator,
  ApiSessionTerminateAllOtherSessionsDecorator,
} from '../../../core/decorators/swagger';
import { GetDevicesQuery } from '../application/queries/get-devices.query';
import { SessionViewDto } from './view-dto/session-view.dto';
import { DeleteSessionCommand, TerminateAllOtherSessionsCommand } from '../application/usecases';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private logger: LoggerService,
  ) {
    this.logger.setContext(SessionsController.name);
  }

  @Get()
  @ApiSessionGetDevicesDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async getDevices(@CurrentUser() user: ActiveUserDto): Promise<SessionViewDto[]> {
    this.logger.log('Get devices', 'getDevices');
    return this.queryBus.execute<GetDevicesQuery, SessionViewDto[]>(new GetDevicesQuery(user));
  }

  @Delete(':deviceId')
  @ApiSessionDeleteDeviceDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(
    @CurrentUser() user: ActiveUserDto,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    this.logger.log(`'delete session by ${deviceId}', 'deleteSession'`);
    return this.commandBus.execute<DeleteSessionCommand, void>(
      new DeleteSessionCommand(user, deviceId),
    );
  }

  @Delete()
  @ApiSessionTerminateAllOtherSessionsDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSessions(@CurrentUser() user: ActiveUserDto): Promise<void> {
    this.logger.log(`'delete All other session usersId${user.userId}', 'deleteSessions'`);
    return this.commandBus.execute<TerminateAllOtherSessionsCommand, void>(
      new TerminateAllOtherSessionsCommand(user),
    );
  }
}
