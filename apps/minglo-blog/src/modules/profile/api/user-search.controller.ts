import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { OptionalAccessGuard } from '../../user-account/guards/optional-access.guard';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { ApiSearchUsersDecorator } from '../../../core/decorators/swagger/users';
import { SearchUsersQueryInputDto } from './input-dto';
import { UsersSearchWithCursorViewDto } from './view-dto';
import { GetUsersSearchQuery } from '../application/queries';

@Controller('users')
export class UserSearchController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserSearchController.name);
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
}