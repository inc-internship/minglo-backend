import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { AdminQueryRepository } from '../../infrastructure/admin.query-repository';
import { AdminUserDetailType } from '../../api/view-dto/admin-user-detail.view-dto';

export class GetUserDetailQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserDetailQuery)
export class GetUserDetailQueryHandler implements IQueryHandler<
  GetUserDetailQuery,
  AdminUserDetailType
> {
  constructor(private readonly adminQueryRepository: AdminQueryRepository) {}

  async execute({ userId }: GetUserDetailQuery): Promise<AdminUserDetailType> {
    const user = await this.adminQueryRepository.findUserDetail(userId);
    if (!user) {
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'User not found' });
    }
    return AdminUserDetailType.mapToView(user);
  }
}
