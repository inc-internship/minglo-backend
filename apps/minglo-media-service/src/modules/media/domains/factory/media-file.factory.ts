import { Injectable } from '@nestjs/common';
import { MediaFileEntity } from '../entities';
import { CreateMediaFileDto } from '../dto/create-media-file.dto';
import { MediaFile } from '../../../../../prisma/generated/prisma/client';

/**
 * Factory для создания MediaFileEntity
 */
@Injectable()
export class MediaFileFactory {
  constructor() {}

  /**
   * Создает entity из DTO (до сохранения в DB)
   */
  create(dto: CreateMediaFileDto): MediaFileEntity {
    return MediaFileEntity.create(dto);
  }

  mapFromModel(file: MediaFile): MediaFileEntity {
    return MediaFileEntity.reconstitute(file);
  }
}
