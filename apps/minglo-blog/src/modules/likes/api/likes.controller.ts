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
import {
  LikeCommentCommand,
  LikePostCommand,
  UnlikeCommentCommand,
  UnlikePostCommand,
} from '../application/usecases';
import { GetPostLikesQuery } from '../application/queries';
import { PostLikesWithCursorViewDto } from './view-dto';
import {
  ApiGetPostLikesDecorator,
  ApiLikeCommentDecorator,
  ApiLikePostDecorator,
  ApiUnlikeCommentDecorator,
  ApiUnlikePostDecorator,
} from '../../../core/decorators/swagger/likes';

@Controller('posts')
export class LikesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LikesController.name);
  }

  @Get(':postId/likes')
  @ApiGetPostLikesDecorator()
  @HttpCode(HttpStatus.OK)
  async getPostLikes(
    @Param('postId') postId: string,
    @Query('cursor') cursor?: string,
  ): Promise<PostLikesWithCursorViewDto> {
    this.logger.log(`GetPostLikes postId=${postId}`, 'getPostLikes');
    return this.queryBus.execute<GetPostLikesQuery, PostLikesWithCursorViewDto>(
      new GetPostLikesQuery(postId, cursor),
    );
  }

  @Post(':postId/likes')
  @ApiLikePostDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async likePost(
    @Param('postId') postId: string,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    this.logger.log(`LikePost postId=${postId}`, 'likePost');
    return this.commandBus.execute<LikePostCommand, void>(new LikePostCommand(postId, user.userId));
  }

  @Delete(':postId/likes')
  @ApiUnlikePostDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlikePost(
    @Param('postId') postId: string,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    this.logger.log(`UnlikePost postId=${postId}`, 'unlikePost');
    return this.commandBus.execute<UnlikePostCommand, void>(
      new UnlikePostCommand(postId, user.userId),
    );
  }

  @Post(':postId/comments/:commentId/likes')
  @ApiLikeCommentDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async likeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    this.logger.log(`LikeComment commentId=${commentId}`, 'likeComment');
    return this.commandBus.execute<LikeCommentCommand, void>(
      new LikeCommentCommand(commentId, user.userId),
    );
  }

  @Delete(':postId/comments/:commentId/likes')
  @ApiUnlikeCommentDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlikeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    this.logger.log(`UnlikeComment commentId=${commentId}`, 'unlikeComment');
    return this.commandBus.execute<UnlikeCommentCommand, void>(
      new UnlikeCommentCommand(commentId, user.userId),
    );
  }
}
