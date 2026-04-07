import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageFilesValidationPipe } from '../../core/pipes';
import { ApiUploadFilesDecorator } from '../../core/decorators/swagger';
import { UploadFilesInputDto } from './input-dto/upload-files.input-dto';
import { CommandBus } from '@nestjs/cqrs';

@Controller('media')
export class MediaController {
  constructor(private readonly commandBus: CommandBus) {}

  //todo: Добавить авторизацию.
  @Post('upload')
  @ApiUploadFilesDecorator()
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles(new ImageFilesValidationPipe())
    files: UploadFilesInputDto,
  ): Promise<void> {
    //todo: добавить команду для сохранения файла в S3
    console.log(files);
  }
}
