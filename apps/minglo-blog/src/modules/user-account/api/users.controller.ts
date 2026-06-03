import { Controller, Delete, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import {
  ApiDeleteUserDecorator,
  ApiUsersTotalCountDecorator,
} from '../../../core/decorators/swagger/users';
import { TotalCountRegisteredUsersViewDto } from './view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { GetTotalRegisteredUserCountQuery } from '../application/queries';
import { AccessGuard } from '../guards/access.guard';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { DeleteUserCommand } from '../application/usecases';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersController.name);
  }

  @Get('total-count')
  @ApiUsersTotalCountDecorator()
  @HttpCode(HttpStatus.OK)
  async getTotalRegisteredUsersCount(): Promise<TotalCountRegisteredUsersViewDto> {
    this.logger.log(
      'Get total registered users count request received',
      'getTotalRegisteredUsersCount',
    );
    return this.queryBus.execute<
      GetTotalRegisteredUserCountQuery,
      TotalCountRegisteredUsersViewDto
    >(new GetTotalRegisteredUserCountQuery());
  }

  @Delete('me')
  @ApiDeleteUserDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser() user: ActiveUserDto): Promise<void> {
    this.logger.log(`Delete user: ${user.userId}`, 'deleteMe');
    return this.commandBus.execute<DeleteUserCommand, void>(new DeleteUserCommand(user));
  }
}
