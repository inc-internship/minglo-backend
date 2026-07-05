import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { ActiveUserDto } from '../../../../../core/decorators/auth/dto';
import { UserRepository } from '../../../infrastructure';
import { UserDeletedEvent } from '../../events/user-deleted.handler';

export class DeleteUserCommand {
  constructor(public readonly user: ActiveUserDto) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand, void> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DeleteUserUseCase.name);
  }

  async execute(command: DeleteUserCommand): Promise<void> {
    const { user } = command;
    await this.userRepo.hardDeleteUser(user.userId);
    this.logger.log(`User ${user.userId} deleted`);
    this.eventBus.publish(new UserDeletedEvent(user.userId));
  }
}
