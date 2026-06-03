import { UpdateProfileInputDto } from '../../api/input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { LoggerService } from '@app/logger';
import { ActiveUserDto } from '../../../../core/decorators/auth/dto';

export class UpdateProfileCommand {
  constructor(
    public user: ActiveUserDto,
    public body: UpdateProfileInputDto,
  ) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileUseCase implements ICommandHandler<UpdateProfileCommand, void> {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdateProfileUseCase.name);
  }

  async execute(command: UpdateProfileCommand): Promise<void> {
    const { user, body } = command;
    this.logger.log(`Update profile user=${user.userId} execute`);

    await this.profileRepository.updateProfile(user, body);
  }
}
