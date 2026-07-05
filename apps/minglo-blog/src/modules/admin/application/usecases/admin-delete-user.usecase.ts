import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { UserRepository } from '../../../user-account/infrastructure';
import { EventBus } from '@nestjs/cqrs';
import { UserDeletedEvent } from '../../../user-account/application/events/user-deleted.handler';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';

export class AdminDeleteUserCommand {
  constructor(public readonly publicId: string) {}
}

@CommandHandler(AdminDeleteUserCommand)
export class AdminDeleteUserUseCase implements ICommandHandler<AdminDeleteUserCommand, void> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: LoggerService,
    private readonly eventBus: EventBus,
    private readonly userQueryRepo: UserQueryRepository,
  ) {
    this.logger.setContext(AdminDeleteUserUseCase.name);
  }

  async execute({ publicId }: AdminDeleteUserCommand): Promise<void> {
    this.logger.log(`Admin hard-deleting user: ${publicId}`, 'execute');
    const userId = await this.userQueryRepo.findIdByPublicId(publicId);
    if (!userId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    await this.userRepo.hardDeleteUser(publicId);
    this.eventBus.publish(new UserDeletedEvent(publicId));
  }
}
