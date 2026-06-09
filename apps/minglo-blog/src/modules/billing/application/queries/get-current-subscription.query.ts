import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@app/logger';
import { PAYMENT_SERVICE, PAYMENTS_TCP_PATTERNS } from '@app/payments';
import { CurrentSubscriptionInfoViewDto, SubscriptionInfoViewDto } from '@app/payments/view-dto';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';
import { firstValueFrom } from 'rxjs';

export class GetCurrentSubscriptionQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetCurrentSubscriptionQuery)
export class GetCurrentSubscriptionQueryHandler implements IQueryHandler<
  GetCurrentSubscriptionQuery,
  CurrentSubscriptionInfoViewDto
> {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(GetCurrentSubscriptionQueryHandler.name);
  }

  async execute({ userId }: GetCurrentSubscriptionQuery): Promise<CurrentSubscriptionInfoViewDto> {
    this.logger.log(`GET current subscription START userId=${userId}`, 'execute');

    const [subscriptionInfo, accountType] = await Promise.all([
      firstValueFrom(
        this.paymentClient.send<SubscriptionInfoViewDto>(
          PAYMENTS_TCP_PATTERNS.GET_CURRENT_SUBSCRIPTION,
          { userId },
        ),
      ),
      this.userQueryRepo.getAccountType(userId),
    ]);

    this.logger.log(`GET current subscription DONE`, 'execute');
    return { accountType, ...subscriptionInfo };
  }
}
