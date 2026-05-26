import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { Inject } from '@nestjs/common';
import { MEDIA_SERVICE } from '@app/media/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MediaFileMetaDataViewDto } from '@app/media/api/view-dto';
import { CreateAvatarViewDto } from '../../api/view-dto';
import { CreateAvatarInputDto } from '../../api/input-dto';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { AvatarEntity } from '../../domains/entities/avatar.entity';

export class CreateAvatarCommand {
  constructor(
    public dto: CreateAvatarInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(CreateAvatarCommand)
export class CreateAvatarUseCase implements ICommandHandler<
  CreateAvatarCommand,
  CreateAvatarViewDto
> {
  constructor(
    @Inject(MEDIA_SERVICE) private readonly mediaClient: ClientProxy,
    private readonly profileRepository: ProfileRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreateAvatarUseCase.name);
  }

  async execute(command: CreateAvatarCommand): Promise<CreateAvatarViewDto> {
    const { dto, userId } = command;
    this.logger.log(`CreateAvatar START user=${userId} uploadId`);

    const profile = await this.profileRepository.findProfileById(userId);

    this.logger.log(`Calling media-service consume_media_files`, 'execute');
    const imagesMetadata = await firstValueFrom<MediaFileMetaDataViewDto[]>(
      this.mediaClient.send({ cmd: 'consume_media_files' }, { uploadIds: dto.uploadIds, userId }),
    );
    this.logger.log(`Media consumed count=${imagesMetadata.length}`, 'execute');

    const avatar = AvatarEntity.create(imagesMetadata, profile.id);

    const avatarId = await this.profileRepository.createAvatar(avatar);
    this.logger.log(`Avatar updated successfully profileId=${profile.id}`, 'execute');

    return { id: avatarId };
  }
}
