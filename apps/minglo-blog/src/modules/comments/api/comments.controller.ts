import {
  Body,
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
import { CreateCommentInputDto, GetCommentsQueryInputDto } from './input-dto';
import { CommentsWithCursorViewDto } from './view-dto';
import {
  CreateCommentCommand,
  DeleteCommentCommand,
  ReplyToCommentCommand,
} from '../application/usecases';
import { GetCommentRepliesQuery, GetPostCommentsQuery } from '../application/queries';
import {
  ApiCreateCommentDecorator,
  ApiDeleteCommentDecorator,
  ApiGetCommentRepliesDecorator,
  ApiGetPostCommentsDecorator,
  ApiReplyToCommentDecorator,
} from '../../../core/decorators/swagger/comments';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CommentsController.name);
  }

  @Post()
  @ApiCreateCommentDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('postId') postId: string,
    @Body() body: CreateCommentInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<{ id: string }> {
    this.logger.log(`CreateComment postId=${postId}`, 'createComment');
    const id = await this.commandBus.execute<CreateCommentCommand, string>(
      new CreateCommentCommand(postId, user.userId, body.text),
    );
    return { id };
  }

  @Post(':commentId/replies')
  @ApiReplyToCommentDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async replyToComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() body: CreateCommentInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<{ id: string }> {
    this.logger.log(`ReplyToComment commentId=${commentId}`, 'replyToComment');
    const id = await this.commandBus.execute<ReplyToCommentCommand, string>(
      new ReplyToCommentCommand(postId, commentId, user.userId, body.text),
    );
    return { id };
  }

  @Delete(':commentId')
  @ApiDeleteCommentDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<void> {
    this.logger.log(`DeleteComment commentId=${commentId}`, 'deleteComment');
    return this.commandBus.execute<DeleteCommentCommand, void>(
      new DeleteCommentCommand(commentId, user.userId),
    );
  }

  @Get()
  @ApiGetPostCommentsDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async getPostComments(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<CommentsWithCursorViewDto> {
    this.logger.log(`GetPostComments postId=${postId}`, 'getPostComments');
    return this.queryBus.execute<GetPostCommentsQuery, CommentsWithCursorViewDto>(
      new GetPostCommentsQuery(postId, user.userId, query.cursor),
    );
  }

  @Get(':commentId/replies')
  @ApiGetCommentRepliesDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentReplies(
    @Param('commentId') commentId: string,
    @Query() query: GetCommentsQueryInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<CommentsWithCursorViewDto> {
    this.logger.log(`GetCommentReplies commentId=${commentId}`, 'getCommentReplies');
    return this.queryBus.execute<GetCommentRepliesQuery, CommentsWithCursorViewDto>(
      new GetCommentRepliesQuery(commentId, user.userId, query.cursor),
    );
  }
}