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
  @UseInterceptors(FilesInterceptor('files', 10))
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
}
