import { Module } from '@nestjs/common';
import { LikesController } from './api/likes.controller';
import { LikesRepository } from './infrastructure/likes.repository';
import {
  LikeCommentUseCase,
  LikePostUseCase,
  UnlikeCommentUseCase,
  UnlikePostUseCase,
} from './application/usecases';
import { UserAccountModule } from '../user-account/user-account.module';

const usecases = [LikePostUseCase, UnlikePostUseCase, LikeCommentUseCase, UnlikeCommentUseCase];

@Module({
  imports: [UserAccountModule],
  controllers: [LikesController],
  providers: [...usecases, LikesRepository],
})
export class LikesModule {}