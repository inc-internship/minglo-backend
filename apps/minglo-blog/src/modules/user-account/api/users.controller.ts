import { Controller, Delete, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import {
  ApiDeleteUserDecorator,
  ApiSearchUsersDecorator,
  ApiUsersTotalCountDecorator,
} from '../../../core/decorators/swagger/users';
import { TotalCountRegisteredUsersViewDto } from './view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { GetTotalRegisteredUserCountQuery } from '../application/queries';
import { AccessGuard } from '../guards/access.guard';
import { OptionalAccessGuard } from '../guards/optional-access.guard';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { DeleteUserCommand } from '../application/usecases';
import { SearchUsersQueryInputDto } from '../../profile/api/input-dto';
import { UsersSearchWithCursorViewDto } from '../../profile/api/view-dto';
import { GetUsersSearchQuery } from '../../profile/application/queries';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersController.name);
  }

  @Get('search')
  @ApiSearchUsersDecorator()
  @UseGuards(OptionalAccessGuard)
  @HttpCode(HttpStatus.OK)
  async searchUsers(
    @Query() query: SearchUsersQueryInputDto,
    @CurrentUser() currentUser: ActiveUserDto | null,
  ): Promise<UsersSearchWithCursorViewDto> {
    this.logger.log(`SearchUsers username=${query.username}`, 'searchUsers');
    return this.queryBus.execute<GetUsersSearchQuery, UsersSearchWithCursorViewDto>(
      new GetUsersSearchQuery(query.username, currentUser?.userId ?? null, query.cursor),
    );
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
