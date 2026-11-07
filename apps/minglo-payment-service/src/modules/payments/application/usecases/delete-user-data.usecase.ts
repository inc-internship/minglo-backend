import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PaymentsRepository } from '../../infrastructure';

export class DeleteUserDataCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeleteUserDataCommand)
export class DeleteUserDataUseCase implements ICommandHandler<DeleteUserDataCommand, void> {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DeleteUserDataUseCase.name);
  }

  async execute({ userId }: DeleteUserDataCommand): Promise<void> {
    await this.repo.deleteUserData(userId);
    this.logger.log(`Payment data deleted for userId=${userId}`, 'execute');
  }
}
