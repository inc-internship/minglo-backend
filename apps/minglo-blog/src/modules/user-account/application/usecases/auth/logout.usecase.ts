import { ActiveUserDto } from '../../../../../core/decorators/auth/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { LoginUserUseCase } from './login-user.usecase';
import { LoggerService } from '@app/logger';

export class LogoutCommand {
  constructor(public readonly user: ActiveUserDto) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private logger: LoggerService,
  ) {
    this.logger.setContext(LoginUserUseCase.name);
  }

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
