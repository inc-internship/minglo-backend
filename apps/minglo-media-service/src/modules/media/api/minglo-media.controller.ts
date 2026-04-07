import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiUploadFilesDecorator } from '../../core/decorators/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ImageFilesValidationPipe } from '@app/media/pipes';
import { LoggerService } from '@app/logger';
import { MediaTypeInputDto } from '@app/media/api/input-dto';
import { UploadImageCommand } from '../application/usecases/upload-image.usecase';

@Controller('media')
export class MediaController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MediaController.name);
  }

  //todo: Добавить авторизацию.
  //todo: fix user_public_id.
  @Post('upload')
  @ApiUploadFilesDecorator()
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles(new ImageFilesValidationPipe())
    files: Express.Multer.File[],
    @Body() body: MediaTypeInputDto,
  ): Promise<void> {
    await this.commandBus.execute<UploadImageCommand, void>(
      new UploadImageCommand(files, body.type, 'public_user_id'),
    );
    this.logger.log('Image upload to S3 completed', 'uploadFiles');
  }
}
