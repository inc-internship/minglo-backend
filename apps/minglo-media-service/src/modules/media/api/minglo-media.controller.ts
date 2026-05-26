import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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
  async uploadAvatarFile(@Body() body: MediaTypeInputDto, req: Request) {
    this.logger.log(`Image upload for user ${body.publicUserId} begin`, 'uploadAvatarFile');

    try {
      const { stream, filename } = await extractFileStream(req);
      this.logger.log(`Processing file: ${filename}`);

      return await this.commandBus.execute<UploadAvatarImageMediaCommand, UploadImageProfileDto>(
        new UploadAvatarImageMediaCommand(stream, body.type, body.publicUserId),
      );
    } catch (err) {
      this.logger.error(`Upload failed: ${err.message}`);

      if (err instanceof DomainException) throw err;

      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Media Service error',
      });
    }
  }
}
