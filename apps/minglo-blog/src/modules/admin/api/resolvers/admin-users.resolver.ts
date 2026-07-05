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
import { UsersPageType, AdminUserType } from '../view-dto';
import { BlockUserInput, PaymentsQueryInput, UsersQueryInput } from '../input-dto';
import { GlobalPaymentsPageType } from '../view-dto';
import { GetAllPaymentsQuery } from '../../application/queries';

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

  @Query(() => GlobalPaymentsPageType)
  async payments(@Args('query') query: PaymentsQueryInput): Promise<GlobalPaymentsPageType> {
    return this.queryBus.execute(new GetAllPaymentsQuery(query));
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('publicId') publicId: string): Promise<boolean> {
    await this.commandBus.execute(new AdminDeleteUserCommand(publicId));
    return true;
  }

  @Mutation(() => Boolean)
  async blockUser(@Args('input') input: BlockUserInput): Promise<boolean> {
    await this.commandBus.execute(new AdminBlockUserCommand(input));
    return true;
  }

  @Mutation(() => Boolean)
  async unblockUser(@Args('publicId') publicId: string): Promise<boolean> {
    await this.commandBus.execute(new AdminUnblockUserCommand(publicId));
    return true;
  }
}
