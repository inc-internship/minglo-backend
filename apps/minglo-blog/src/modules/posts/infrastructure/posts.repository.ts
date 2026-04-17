import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PostEntity } from '../domains/entities';
import { MediaMimeType } from '../../../../prisma/generated/prisma/enums';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(post: PostEntity): Promise<string> {
    const result = await this.prisma.post.create({
      data: {
        userId: post.getUserId(),
        description: post.getDescription(),

        postsMediaFiles: {
          create: post.getMedia().map((m) => ({
            url: m.getUrl(),
            key: m.getKey(),
            order: m.getOrder(),
            mimeType: m.getMimeType() as unknown as MediaMimeType,
            width: m.getWidth(),
            height: m.getHeight(),
            fileSize: m.getFileSize(),
          })),
        },
      },
    });

    return result.publicId;
  }
}
