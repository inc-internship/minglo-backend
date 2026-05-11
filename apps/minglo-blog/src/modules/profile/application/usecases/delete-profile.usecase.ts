import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { ActiveUserDto } from '../../../../core/decorators/auth/dto';
import { ProfileRepository } from '../../infrastructure/profile.repository';

export class DeleteProfileCommand {
  constructor(public user: ActiveUserDto) {}
}

@CommandHandler(DeleteProfileCommand)
export class DeleteProfileUseCase implements ICommandHandler<DeleteProfileCommand, void> {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DeleteProfileUseCase.name);
  }

  async execute(command: DeleteProfileCommand): Promise<void> {
    const { user } = command;
    this.logger.log('DeleteProfileUseCase started', 'execute');

    await this.profileRepo.softDeleteProfile(user.userId);

    this.logger.log(`Profile for user=${user.userId} successfully deleted`, 'execute');
  }
}
