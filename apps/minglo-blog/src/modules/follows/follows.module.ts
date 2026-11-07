import { Module } from '@nestjs/common';
import { FollowsController } from './api/follows.controller';
import { FollowsRepository } from './infrastructure/follows.repository';
import { FollowsQueryRepository } from './infrastructure/follows.query-repository';
import { FollowUserUseCase, UnfollowUserUseCase } from './application/usecases';
import { GetFollowersQueryHandler, GetFollowingQueryHandler } from './application/queries';
import { UserAccountModule } from '../user-account/user-account.module';

const usecases = [FollowUserUseCase, UnfollowUserUseCase];
const queries = [GetFollowersQueryHandler, GetFollowingQueryHandler];

@Module({
  imports: [UserAccountModule],
  controllers: [FollowsController],
  providers: [...usecases, ...queries, FollowsRepository, FollowsQueryRepository],
  exports: [FollowsRepository, FollowsQueryRepository],
})
export class FollowsModule {}
