import { Module } from '@nestjs/common';
import { LikesController } from './api/likes.controller';
import { LikesRepository } from './infrastructure/likes.repository';
import { LikesQueryRepository } from './infrastructure/likes.query-repository';
import {
  LikeCommentUseCase,
  LikePostUseCase,
  UnlikeCommentUseCase,
  UnlikePostUseCase,
} from './application/usecases';
import { GetPostLikesQueryHandler } from './application/queries';
import { UserAccountModule } from '../user-account/user-account.module';

const usecases = [LikePostUseCase, UnlikePostUseCase, LikeCommentUseCase, UnlikeCommentUseCase];
const queries = [GetPostLikesQueryHandler];

@Module({
  imports: [UserAccountModule],
  controllers: [LikesController],
  providers: [...usecases, ...queries, LikesRepository, LikesQueryRepository],
})
export class LikesModule {}
