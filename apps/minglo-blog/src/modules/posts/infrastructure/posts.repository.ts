import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PostEntity, PostMediaFileEntity } from '../domains/entities';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(post: PostEntity, postMediaFile: PostMediaFileEntity): Promise<void> {
    //todo: создать метод репозитория
    console.log(post);
    console.log(postMediaFile);
  }
}
