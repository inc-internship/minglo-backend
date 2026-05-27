import { FillProfileInputDto } from '../../api/input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { LoggerService } from '@app/logger';
import { ActiveUserDto } from '../../../../core/decorators/auth/dto';

export class FillProfileCommand {
  constructor(
    public user: ActiveUserDto,
    public body: FillProfileInputDto,
  ) {}
}

@CommandHandler(FillProfileCommand)
export class FillProfileUseCase implements ICommandHandler<FillProfileCommand, void> {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(FillProfileUseCase.name);
  }

  async execute(command: FillProfileCommand): Promise<void> {
    const { user, body } = command;
    this.logger.log(`Fill profile user=${user.userId} execute`);

    await this.profileRepository.updateProfile(user, body);
  }
}
