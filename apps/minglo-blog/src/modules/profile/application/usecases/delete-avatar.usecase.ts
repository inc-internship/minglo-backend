import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@app/logger';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { MEDIA_SERVICE } from '@app/media/constants';
import { ActiveUserDto } from '../../../../core/decorators/auth/dto';
import { ProfileRepository } from '../../infrastructure/profile.repository';

export class DeleteAvatarCommand {
  constructor(
    public readonly mediaId: string,
    public readonly user: ActiveUserDto,
  ) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase implements ICommandHandler<DeleteAvatarCommand, void> {
  constructor(
    @Inject(MEDIA_SERVICE)
    private readonly mediaClient: ClientProxy,
    private readonly profileRepository: ProfileRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DeleteAvatarUseCase.name);
  }

  async execute({ mediaId, user }: DeleteAvatarCommand): Promise<void> {
    const profile = await this.profileRepository.findProfileById(user.userId);

    const avatar = await this.profileRepository.findAvatarByMediaId(mediaId, profile.id);
    if (!avatar) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Avatar not found',
      });
    }

    // Soft-delete avatar record first
    await this.profileRepository.deleteAvatar(avatar.id);

    // Schedule S3 files for deletion (fire-and-forget)
    this.mediaClient
      .send(
        { cmd: 'mark_media_files_deleted' },
        { keys: [avatar.keyOriginal, avatar.keyThumbnail] },
      )
      .subscribe({
        error: (err) =>
          this.logger.error(`Failed to mark avatar keys for deletion: ${err.message}`),
      });

    this.logger.log(`Avatar deleted for user=${user.userId}, mediaId=${mediaId}`);
  }
}
