import { Module } from '@nestjs/common';
import { CommentsController } from './api/comments.controller';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CommentsQueryRepository } from './infrastructure/comments.query-repository';
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ReplyToCommentUseCase,
} from './application/usecases';
import { GetCommentRepliesQueryHandler, GetPostCommentsQueryHandler } from './application/queries';
import { UserAccountModule } from '../user-account/user-account.module';

const usecases = [CreateCommentUseCase, ReplyToCommentUseCase, DeleteCommentUseCase];
const queries = [GetPostCommentsQueryHandler, GetCommentRepliesQueryHandler];

@Module({
  imports: [UserAccountModule],
  controllers: [CommentsController],
  providers: [...usecases, ...queries, CommentsRepository, CommentsQueryRepository],
  exports: [CommentsRepository, CommentsQueryRepository],
})
export class CommentsModule {}
