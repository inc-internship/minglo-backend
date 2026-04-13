import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { ActiveUserDto } from '../../../../../core/decorators/auth/dto';
import { LoggerService } from '@app/logger';

export class TerminateAllOtherSessionsCommand {
  constructor(public readonly user: ActiveUserDto) {}
}

@CommandHandler(TerminateAllOtherSessionsCommand)
export class TerminateAllOtherSessionsUseCase implements ICommandHandler<
  TerminateAllOtherSessionsCommand,
  void
> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(TerminateAllOtherSessionsUseCase.name);
  }

  async execute(command: TerminateAllOtherSessionsCommand): Promise<void> {
    const { user } = command;

    this.logger.log(
      `Terminating all sessions for user ${user.userId} except device: ${user.deviceId}`,
      'execute',
    );
    await this.sessionRepository.deleteAllOtherSessionUser(user.userId, user.deviceId);

    return;
  }
}
