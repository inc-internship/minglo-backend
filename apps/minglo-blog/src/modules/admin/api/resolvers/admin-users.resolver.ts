import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUsersListQuery } from '../../application/queries';
import {
  AdminDeleteUserCommand,
  AdminBlockUserCommand,
  AdminUnblockUserCommand,
} from '../../application/usecases';
import { UseGuards } from '@nestjs/common';
import { AdminBasicAuthGuard } from '../../guards/admin-basic-auth.guard';
import { UsersQueryInput } from '../input-dto/users-query.input';
import { UsersPageType } from '../view-dto/admin-user.view-dto';
import { AdminUserType } from '../view-dto/admin-user.view-dto';

@UseGuards(AdminBasicAuthGuard)
@Resolver(() => AdminUserType)
export class AdminUsersResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Query(() => UsersPageType)
  async users(@Args('query') query: UsersQueryInput): Promise<UsersPageType> {
    return this.queryBus.execute(new GetUsersListQuery(query));
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('publicId') publicId: string): Promise<boolean> {
    await this.commandBus.execute(new AdminDeleteUserCommand(publicId));
    return true;
  }

  @Mutation(() => Boolean)
  async blockUser(@Args('publicId') publicId: string): Promise<boolean> {
    await this.commandBus.execute(new AdminBlockUserCommand(publicId));
    return true;
  }

  @Mutation(() => Boolean)
  async unblockUser(@Args('publicId') publicId: string): Promise<boolean> {
    await this.commandBus.execute(new AdminUnblockUserCommand(publicId));
    return true;
  }
}
