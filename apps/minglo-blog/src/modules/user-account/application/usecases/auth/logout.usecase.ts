import { ActiveUserDto } from '../../../../../core/decorators/auth/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../../infrastructure/session.repository';

export class LogoutCommand {
  constructor(public readonly user: ActiveUserDto) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUsecase implements ICommandHandler<LogoutCommand, void> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { user } = command;
    return await this.sessionRepository.deleteDeviceById(user.userId, user.deviceId);
  }
}
