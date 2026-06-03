import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiUploadFilesDecorator } from '../../core/decorators/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ImageFilesValidationPipe } from '@app/media/pipes';
import { LoggerService } from '@app/logger';
import { MediaTypeInputDto } from '@app/media/api/input-dto';
import { UploadImageCommand } from '../application/usecases';
import { UploadImageResultDto } from '@app/media/dto';
import { MediaJwtGuard } from '../guards';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { extractFileStream } from '@app/media/helpers';
import { UploadAvatarImageMediaCommand } from '../application/usecases/upload-avatar-image-media-usecase';
import { ApiUploadAvatarDecorator } from '../../core/decorators/swagger/upload-avatar.decorator';
import { UploadImageProfileDto } from '@app/media/dto/upload-image-profile.dto';
import { ServiceTokenPayload } from '../guards/media-jwt.strategy';

const AVATAR_MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

@ApiTags('Media HTTP')
@UseGuards(MediaJwtGuard)
@Controller('media')
export class MediaController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MediaController.name);
  }

  @Post('upload')
  @ApiUploadFilesDecorator()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 3 * 1024 * 1024 },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadFiles(
    @UploadedFiles(new ImageFilesValidationPipe())
    files: Express.Multer.File[],
    @Body() body: MediaTypeInputDto,
  ): Promise<UploadImageResultDto> {
    this.logger.log('Image upload to S3 begin', 'uploadFiles');
    return await this.commandBus.execute<UploadImageCommand, UploadImageResultDto>(
      new UploadImageCommand(files, body.type, body.publicUserId),
    );
  }

  @Post('upload-avatar')
  @ApiUploadAvatarDecorator()
  @HttpCode(HttpStatus.CREATED)
  async uploadAvatarFile(@Req() req: Request): Promise<UploadImageProfileDto> {
    // User identity comes from the service JWT, not the request body —
    // @Body() doesn't work with raw multipart streams.
    const { publicUserId, type } = req.user as ServiceTokenPayload;
    this.logger.log(`Avatar upload begin, user: ${publicUserId}`, 'uploadAvatarFile');

    try {
      const { stream, filename } = await extractFileStream(req, {
        fileSizeLimit: AVATAR_MAX_FILE_SIZE,
      });
      this.logger.log(`Processing file: ${filename}`, 'uploadAvatarFile');

      return await this.commandBus.execute<UploadAvatarImageMediaCommand, UploadImageProfileDto>(
        new UploadAvatarImageMediaCommand(stream, publicUserId, type),
      );
    } catch (err) {
      this.logger.error(`Upload failed: ${err.message}`, 'uploadAvatarFile');
      if (err instanceof DomainException) throw err;

      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Media Service error',
      });
    }
  }
}
