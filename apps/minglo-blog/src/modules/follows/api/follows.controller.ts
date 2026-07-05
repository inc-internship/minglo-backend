import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { FollowUserCommand, UnfollowUserCommand } from '../application/usecases';
import { GetFollowersQuery, GetFollowingQuery } from '../application/queries';
import { GetFollowsQueryInputDto } from './input-dto';
import { FollowsWithCursorViewDto } from './view-dto';
import {
  ApiFollowUserDecorator,
  ApiGetFollowersDecorator,
  ApiGetFollowingDecorator,
  ApiUnfollowUserDecorator,
} from '../../../core/decorators/swagger/follows';

@Controller('users')
export class FollowsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(FollowsController.name);
  }

  @Post(':userId/follow')
  @ApiFollowUserDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async follow(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: ActiveUserDto,
  ): Promise<void> {
    this.logger.log(`Follow user=${userId} by=${currentUser.userId}`, 'follow');
    return this.commandBus.execute<FollowUserCommand, void>(
      new FollowUserCommand(currentUser.userId, userId),
    );
  }

  @Delete(':userId/follow')
  @ApiUnfollowUserDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollow(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: ActiveUserDto,
  ): Promise<void> {
    this.logger.log(`Unfollow user=${userId} by=${currentUser.userId}`, 'unfollow');
    return this.commandBus.execute<UnfollowUserCommand, void>(
      new UnfollowUserCommand(currentUser.userId, userId),
    );
  }

  @Get(':userId/followers')
  @ApiGetFollowersDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async getFollowers(
    @Param('userId') userId: string,
    @Query() query: GetFollowsQueryInputDto,
  ): Promise<FollowsWithCursorViewDto> {
    this.logger.log(`GetFollowers userId=${userId}`, 'getFollowers');
    return this.queryBus.execute<GetFollowersQuery, FollowsWithCursorViewDto>(
      new GetFollowersQuery(userId, query.cursor),
    );
  }

  @Get(':userId/following')
  @ApiGetFollowingDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async getFollowing(
    @Param('userId') userId: string,
    @Query() query: GetFollowsQueryInputDto,
  ): Promise<FollowsWithCursorViewDto> {
    this.logger.log(`GetFollowing userId=${userId}`, 'getFollowing');
    return this.queryBus.execute<GetFollowingQuery, FollowsWithCursorViewDto>(
      new GetFollowingQuery(userId, query.cursor),
    );
  }
}
