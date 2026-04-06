import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../../infrastructure/session.repository';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { ActiveUserDto } from '../../../../../core/decorators/auth/dto';
import { LoggerService } from '@app/logger';

export class DeleteSessionCommand {
  constructor(
    public readonly user: ActiveUserDto,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase implements ICommandHandler<DeleteSessionCommand, void> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private logger: LoggerService,
  ) {}

  async execute(command: DeleteSessionCommand): Promise<void> {
    const { user, deviceId } = command;

    this.logger.log('find session in db', 'execute');
    const session = await this.sessionRepository.findSessionByDeviceId(deviceId);
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Device not found',
      });
    }
    this.logger.log('check session for forbidden', 'execute');
    if (session.publicId !== user.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Not your device',
      });
    }

    this.logger.log('delete session in db', 'execute');
    await this.sessionRepository.deleteDeviceById(user.userId, deviceId);

    return;
  }
}
