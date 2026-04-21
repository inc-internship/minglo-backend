import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
  ApiCreatePostDecorator,
  ApiGetPostByIdDecorator,
  ApiPostsUploadImagesDecorator,
  ApiUpdatePostDecorator,
} from '../../../core/decorators/swagger/posts';
import { UploadImageResultDto } from '@app/media/dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreatePostCommand,
  UploadPostImagesCommand,
  UpdatePostCommand,
} from '../application/usecases';
import { CreatePostInputDto, UpdatePostInputDto } from './input-dto';
import { CreatedPostViewDto, PostViewDto } from './view-dto';
import { GetPostByIdQuery } from '../application/query';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsController.name);
  }

  @Post('upload-images')
  @ApiPostsUploadImagesDecorator()
  @UseGuards(AccessGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @HttpCode(HttpStatus.CREATED)
  async uploadMediaFile(
    @UploadedFiles(new ImageFilesValidationPipe())
    files: Express.Multer.File[],
    @CurrentUser() user: ActiveUserDto,
  ): Promise<UploadImageResultDto> {
    this.logger.log(
      `New media upload request received from user: ${user.userId}`,
      'uploadMediaFile',
    );
    return this.commandBus.execute<UploadPostImagesCommand, UploadImageResultDto>(
      new UploadPostImagesCommand(files, user),
    );
  }

  @Post()
  @ApiCreatePostDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreatePostInputDto,
    @CurrentUser() user: ActiveUserDto,
  ): Promise<CreatedPostViewDto> {
    this.logger.log(`New post creation request received from user: ${user.userId}`, 'create');
    return this.commandBus.execute<CreatePostCommand, CreatedPostViewDto>(
      new CreatePostCommand(body, user.userId),
    );
  }

  @Get(':postId')
  @ApiGetPostByIdDecorator()
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('postId') postId: string): Promise<PostViewDto> {
    this.logger.log(`Get post data request received, postId: ${postId}`, 'getPostById');
    return this.queryBus.execute<GetPostByIdQuery, PostViewDto>(new GetPostByIdQuery(postId));
  }

  @Put(':postId')
  @ApiUpdatePostDecorator()
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @CurrentUser() user: ActiveUserDto,
    @Param('postId') postId: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    this.logger.log(
      `Update post request received, postId: ${postId}, userId: ${user.userId}`,
      'update',
    );
    return this.commandBus.execute<UpdatePostCommand, void>(
      new UpdatePostCommand(postId, user.userId, body.description),
    );
  }
}
