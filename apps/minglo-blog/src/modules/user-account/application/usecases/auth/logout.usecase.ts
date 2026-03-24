import { ActiveUserDto } from '../../../../../core/decorators/auth/dto/active-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../../infrastructure/session.repository';

export class LogOutCommand {
  constructor(public readonly user: ActiveUserDto) {}
}

@CommandHandler(LogOutCommand)
export class LogOutUseCase implements ICommandHandler<LogOutCommand, void> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: LogOutCommand): Promise<void> {
    const { user } = command;
    return await this.sessionRepository.deleteDeviceById(user.userId, user.deviceId);
  }
}
