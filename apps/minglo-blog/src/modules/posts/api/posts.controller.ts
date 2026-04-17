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
import { LoggerService } from '@app/logger';
import { AccessGuard } from '../../user-account/guards/access.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../../core/decorators/auth/current-user.decorator';
import { ActiveUserDto } from '../../../core/decorators/auth/dto';
import { ImageFilesValidationPipe } from '@app/media/pipes';
import {
  ApiPostsUploadImagesDecorator,
  ApiCreatePostDecorator,
} from '../../../core/decorators/swagger/posts';
import { UploadImageResultDto } from '@app/media/dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand, UploadPostImagesCommand } from '../application/usecases';
import { CreatePostInputDto } from './input-dto';
import { CreatePostViewDto } from './view-dto';

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

  @Post()
  @ApiCreatePostDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreatePostInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<CreatePostViewDto> {
    this.logger.log(`Create new post process initiated for user: ${user.userId}`, 'create');
    return this.commandBus.execute(new CreatePostCommand(body, user.userId));
  }
}
