import { ActiveUserDto } from '../../../../../core/decorators/auth/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { DomainException, DomainExceptionCode } from '@app/exceptions';

export class LogoutCommand {
  constructor(public readonly user: ActiveUserDto) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { user } = command;
    const result = await this.sessionRepository.deleteDeviceById(user.userId, user.deviceId);
    if (result === 0) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Device not found',
      });
    }
    return;
  }
}
