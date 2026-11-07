import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryInput } from '../../api/input-dto/users-query.input';
import { AdminQueryRepository } from '../../infrastructure/admin.query-repository';
import { UsersPageType } from '../../api/view-dto/admin-user.view-dto';

export class GetUsersListQuery {
  constructor(public readonly query: UsersQueryInput) {}
}

@QueryHandler(GetUsersListQuery)
export class GetUsersListQueryHandler implements IQueryHandler<GetUsersListQuery, UsersPageType> {
  constructor(private readonly adminQueryRepository: AdminQueryRepository) {}

  async execute({ query }: GetUsersListQuery): Promise<UsersPageType> {
    const { users, totalCount } = await this.adminQueryRepository.findUsersList(query);
    return UsersPageType.mapToView(users, totalCount, query.page, query.pageSize);
  }
}
