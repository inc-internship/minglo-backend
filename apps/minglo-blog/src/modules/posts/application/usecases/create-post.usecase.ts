import { CreatePostInputDto } from '../../api/input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostViewDto } from '../../api/view-dto';
import { LoggerService } from '@app/logger';
import { Inject } from '@nestjs/common';
import { MEDIA_SERVICE } from '@app/media/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand {
  constructor(
    public dto: CreatePostInputDto,
    public publicUserId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand, CreatePostViewDto> {
  constructor(
    @Inject(MEDIA_SERVICE) private readonly mediaClient: ClientProxy,
    private readonly repo: PostsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(CreatePostUseCase.name);
  }

  async execute({ dto, publicUserId }: CreatePostCommand): Promise<CreatePostViewDto> {
    const { uploadIds, description } = dto;

    // Запрашиваем метаданные у media-service и помечаем файлы как использованные
    const imagesMetadata = await firstValueFrom(
      this.mediaClient.send({ cmd: 'consume_media_files' }, { uploadIds, publicUserId }),
    );

    //todo: закончить usecase
    console.log('imagesMetadata', imagesMetadata);
    console.log('description', description);

    return { id: 'created_post_id' };
  }
}
