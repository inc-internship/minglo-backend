import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaymentSortField } from '@app/payments/enums';
import { PaymentsQueryInput } from '../../api/input-dto/payments-query.input';
import {
  GlobalPaymentRawItem,
  GlobalPaymentsPageType,
} from '../../api/view-dto/admin-global-payments.view-dto';
import { AdminQueryRepository } from '../../infrastructure/admin.query-repository';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllPaymentsTcpQuery } from '../../../billing/application/queries/get-all-payments-tcp.query';

export class GetAllPaymentsQuery {
  constructor(public readonly query: PaymentsQueryInput) {}
}

@QueryHandler(GetAllPaymentsQuery)
export class GetAllPaymentsQueryHandler implements IQueryHandler<
  GetAllPaymentsQuery,
  GlobalPaymentsPageType
> {
  constructor(
    private readonly adminQueryRepo: AdminQueryRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ query }: GetAllPaymentsQuery): Promise<GlobalPaymentsPageType> {
    let filterUserIds: string[] | undefined;

    if (query.search) {
      filterUserIds = await this.adminQueryRepo.findUserPublicIdsByLoginSearch(query.search);
      if (filterUserIds.length === 0) {
        return GlobalPaymentsPageType.mapToView([], 0, 0, query.page);
      }
    }

    const paymentsRaw = await this.queryBus.execute(
      new GetAllPaymentsTcpQuery(query.page, query.pageSize, query.sortBy, filterUserIds),
    );

    const userIds = [...new Set(paymentsRaw.items.map((p) => p.userId))];
    const users = await this.adminQueryRepo.findUsersByPublicIds(userIds as string[]);
    const usersMap = new Map(users.map((u) => [u.publicId, u]));

    let items: GlobalPaymentRawItem[] = paymentsRaw.items.map((p) => {
      const user = usersMap.get(p.userId);

      return {
        id: p.id,
        username: user?.login ?? 'deleted',
        avatarUrl: user?.profile?.avatar?.urlThumbnail ?? null,
        paymentDate: p.paymentDate,
        amount: p.amount,
        planName: p.planName,
        paymentSystem: p.paymentSystem,
        status: p.status,
      };
    });

    // username sort — только в blog, только текущая страница
    if (query.sortBy === PaymentSortField.USERNAME_ASC) {
      items = items.sort((a, b) => a.username.localeCompare(b.username));
    }
    if (query.sortBy === PaymentSortField.USERNAME_DESC) {
      items = items.sort((a, b) => b.username.localeCompare(a.username));
    }

    return GlobalPaymentsPageType.mapToView(
      items,
      paymentsRaw.totalCount,
      paymentsRaw.pagesCount,
      paymentsRaw.page,
    );
  }
}
