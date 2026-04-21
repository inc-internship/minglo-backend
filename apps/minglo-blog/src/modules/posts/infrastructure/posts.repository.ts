import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PostEntity } from '../domains/entities';
import { MediaMimeType } from '../../../../prisma/generated/prisma/enums';
import { PostForUpdate } from '../../../../prisma/types';
import { BatchPayload } from '../../../../prisma/generated/prisma/internal/prismaNamespace';

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

  async findForUpdate(publicId: string): Promise<PostForUpdate | null> {
    return this.prisma.post.findUnique({
      where: { publicId, deletedAt: null },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            publicId: true,
          },
        },
      },
    });
  }

  async updateDescription(id: number, description: string | null): Promise<void> {
    await this.prisma.post.update({
      where: { id },
      data: { description },
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /* Возвращает массив id удаленных постов */
  async findAllDeleted(): Promise<number[]> {
    const deletedPosts = await this.prisma.post.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      select: { id: true },
    });

    return deletedPosts.map((dp) => dp.id);
  }

  /* Удаляет посты из БД */
  async deleteManyByIds(ids: number[]): Promise<BatchPayload> {
    return this.prisma.post.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
