import { CreatePostInputDto } from '../../api/input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { Inject } from '@nestjs/common';
import { MEDIA_SERVICE } from '@app/media/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { MediaFileMetaDataMapper } from '../../mappers/media-file-metadata.mapper';
import { MediaFileMetaDataViewDto } from '@app/media/api/view-dto';
import { PostEntity } from '../../domains/entities';
import { UserQueryRepository } from '../../../user-account/infrastructure/queries';
import { CreatedPostViewDto } from '../../api/view-dto';

export class CreatePostCommand {
  constructor(
    public dto: CreatePostInputDto,
    public publicUserId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand, CreatedPostViewDto> {
  constructor(
    @Inject(MEDIA_SERVICE) private readonly mediaClient: ClientProxy,
    private readonly userQueryRepo: UserQueryRepository,
    private readonly postsRepo: PostsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreatePostUseCase.name);
  }

  async execute({ dto, publicUserId }: CreatePostCommand): Promise<CreatedPostViewDto> {
    const { uploadIds, description } = dto;

    this.logger.log(`CreatePost START user=${publicUserId} uploadIds=${uploadIds.length}`);

    const userId = await this.userQueryRepo.findIdByPublicId(publicUserId);

    // Запрашиваем метаданные у media-service и помечаем файлы как использованные
    this.logger.log(`Calling media-service consume_media_files`, 'execute');

    const imagesMetadata = await firstValueFrom<MediaFileMetaDataViewDto[]>(
      this.mediaClient.send({ cmd: 'consume_media_files' }, { uploadIds, publicUserId }),
    );

    this.logger.log(`Media consumed count=${imagesMetadata.length}`, 'execute');

    const postMediaFilesInput = imagesMetadata.map((file) =>
      MediaFileMetaDataMapper.toPostMediaInput(file),
    );

    const post = PostEntity.create({
      userId,
      description,
      media: postMediaFilesInput,
    });

    this.logger.log(`PostEntity created`, 'execute');

    const postPublicId = await this.postsRepo.create(post);

    this.logger.log(`Post created successfully postId=${postPublicId}`, 'execute');

    return { id: postPublicId };
  }
}
