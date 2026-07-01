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
} from './application/queries';
import { AdminUsersResolver } from './api/resolvers/admin-users.resolver';
import { AdminUserDetailResolver } from './api/resolvers/admin-user-detail.resolver';
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
];

const resolvers = [AdminUsersResolver, AdminUserDetailResolver];

@Module({
  imports: [UserAccountModule, FollowsModule, BillingModule],
  providers: [
    AdminConfig,
    AdminBasicAuthGuard,
    AdminQueryRepository,
    AdminRepository,
    ...usecases,
    ...queries,
    ...resolvers,
  ],
})
export class AdminModule {}
