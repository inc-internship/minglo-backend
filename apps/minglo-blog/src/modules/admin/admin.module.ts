import { Module } from '@nestjs/common';
import {
  AdminDeleteUserUseCase,
  AdminBlockUserUseCase,
  AdminUnblockUserUseCase,
} from './application/usecases';
import {
  GetUsersListQueryHandler,
  GetUserDetailQueryHandler,
  GetUserFollowersQueryHandler,
  GetUserFollowingQueryHandler,
  GetAllPaymentsQueryHandler,
  GetAllPostsQueryHandler,
} from './application/queries';
import { PostCreatedForAdminHandler } from './application/events/post-created.handler';
import { AdminUsersResolver, AdminUserDetailResolver, AdminPostsResolver } from './api/resolvers';
import { UserAccountModule } from '../user-account/user-account.module';
import { AdminConfig } from './admin.config';
import { AdminBasicAuthGuard } from './guards/admin-basic-auth.guard';
import { FollowsModule } from '../follows/follows.module';
import { BillingModule } from '../billing/billing.module';
import { AdminQueryRepository } from './infrastructure/admin.query-repository';
import { AdminRepository } from './infrastructure/admin.repository';

const usecases = [AdminDeleteUserUseCase, AdminBlockUserUseCase, AdminUnblockUserUseCase];

const queries = [
  GetUsersListQueryHandler,
  GetUserDetailQueryHandler,
  GetUserFollowersQueryHandler,
  GetUserFollowingQueryHandler,
  GetAllPaymentsQueryHandler,
  GetAllPostsQueryHandler,
];

const events = [PostCreatedForAdminHandler];

const resolvers = [AdminUsersResolver, AdminUserDetailResolver, AdminPostsResolver];

@Module({
  imports: [UserAccountModule, FollowsModule, BillingModule],
  providers: [
    AdminConfig,
    AdminBasicAuthGuard,
    AdminQueryRepository,
    AdminRepository,
    ...usecases,
    ...queries,
    ...events,
    ...resolvers,
  ],
})
export class AdminModule {}
