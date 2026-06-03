import { HttpService } from '@nestjs/axios';
import { CoreConfig } from '../../../../core/core.config';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '@app/logger';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActiveUserDto } from '../../../../core/decorators/auth/dto';
import { MediaAuthorizedServices, MediaType } from '@app/media/enums';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { Inject } from '@nestjs/common';
import { MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN, MEDIA_SERVICE } from '@app/media/constants';
import { Readable } from 'stream';
import { UploadImageProfileDto } from '@app/media/dto/upload-image-profile.dto';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { AvatarEntity } from '../../domains/entities/avatar.entity';
import { ClientProxy } from '@nestjs/microservices';

export class UploadAvatarImagesCommand {
  constructor(
    public readonly fileStream: Readable,
    public readonly filename: string,
    public readonly user: ActiveUserDto,
  ) {}
}

@CommandHandler(UploadAvatarImagesCommand)
export class UploadAvatarImagesUseCase implements ICommandHandler<
  UploadAvatarImagesCommand,
  UploadImageProfileDto
> {
  constructor(
    @Inject(MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly jwt: JwtService,
    @Inject(MEDIA_SERVICE)
    private readonly mediaClient: ClientProxy,
    private readonly httpService: HttpService,
    private readonly coreConfig: CoreConfig,
    private readonly profileRepository: ProfileRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UploadAvatarImagesUseCase.name);
  }

  async execute(command: UploadAvatarImagesCommand): Promise<UploadImageProfileDto> {
    const { fileStream, filename, user } = command;

    /** Signs a service-to-service JWT; media-service reads userId and type from the token. */
    const token = this.jwt.sign({
      service: MediaAuthorizedServices.MINGLO_BLOG,
      publicUserId: user.userId,
      type: MediaType.AVATAR,
    });

    const formData = new FormData();
    formData.append('file', fileStream, {
      filename,
      contentType: 'application/octet-stream',
    });

    let uploadResult: UploadImageProfileDto;

    try {
      this.logger.log(`Forwarding avatar upload to media service, user: ${user.userId}`);

      const { data } = await firstValueFrom(
        this.httpService.post<UploadImageProfileDto>(
          `${this.coreConfig.mediaServiceUrl}/media/upload-avatar`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${token}`,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          },
        ),
      );

      uploadResult = data;
      this.logger.log(`Avatar upload successful, user: ${user.userId}`);
    } catch (error) {
      if (error instanceof DomainException) throw error;

      /** Forward structured errors from the media-service (4xx) as-is. */
      const mediaErrorCode = error?.response?.data?.code;
      const mediaErrorMessage = error?.response?.data?.message;
      if (mediaErrorCode && mediaErrorMessage) {
        throw new DomainException({ code: mediaErrorCode, message: mediaErrorMessage });
      }

      this.logger.error(`Media service call failed: ${error.message}`);
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Media Service is unavailable',
      });
    }

    // Save / replace avatar in blog DB
    const profile = await this.profileRepository.findProfileById(user.userId);
    const avatar = AvatarEntity.create(uploadResult, profile.id);
    const { oldKeys } = await this.profileRepository.upsertAvatar(avatar);

    // Schedule old S3 files for deletion (fire-and-forget)
    if (oldKeys.length) {
      this.mediaClient.send({ cmd: 'mark_media_files_deleted' }, { keys: oldKeys }).subscribe({
        error: (err) =>
          this.logger.error(`Failed to mark old avatar keys for deletion: ${err.message}`),
      });
    }

    return uploadResult;
  }
}
