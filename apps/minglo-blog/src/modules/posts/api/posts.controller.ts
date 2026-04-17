import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { ImageFilesValidationPipe } from '@app/media/pipes';
import { ApiPostsUploadImagesDecorator } from '../../../core/decorators/swagger/posts';
import { UploadImageResultDto } from '@app/media/dto';
import { CommandBus } from '@nestjs/cqrs';
import { UploadPostImagesCommand } from '../application/usecases';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsController.name);
  }

  @Post('upload-images')
  @ApiPostsUploadImagesDecorator()
  @UseGuards(AccessGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(
    @UploadedFiles(new ImageFilesValidationPipe())
    files: Express.Multer.File[],
    @CurrentUser() user: ActiveUserDto,
  ): Promise<UploadImageResultDto> {
    return this.commandBus.execute(new UploadPostImagesCommand(files, user));
  }
}
