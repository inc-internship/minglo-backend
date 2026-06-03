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
import { MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '@app/media/constants';
import { UploadImageResultDto } from '@app/media/dto';

export class UploadPostImagesCommand {
  constructor(
    public readonly files: Express.Multer.File[],
    public readonly user: ActiveUserDto,
  ) {}
}

@CommandHandler(UploadPostImagesCommand)
export class UploadPostImagesUseCase implements ICommandHandler<
  UploadPostImagesCommand,
  UploadImageResultDto
> {
  constructor(
    @Inject(MEDIA_ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private jwt: JwtService,
    private readonly httpService: HttpService,
    private readonly coreConfig: CoreConfig,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UploadPostImagesUseCase.name);
  }

  async execute({ files, user }: UploadPostImagesCommand) {
    const form = new FormData();

    for (const file of files) {
      form.append('files', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }

    form.append('type', MediaType.POST);
    form.append('publicUserId', user.userId);

    const token = this.jwt.sign({
      service: MediaAuthorizedServices.MINGLO_BLOG,
    });

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.coreConfig.mediaServiceUrl}/media/upload`, form, {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      this.logger.log('New post image(s) uploaded');
      return data;
    } catch (error) {
      this.logger.error(error, 'Media Service failed');

      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Media Service is unavailable',
      });
    }
  }
}
