import { Module } from '@nestjs/common';
import { PostService } from './application/services/post.service';
import { PostController } from './api/post.controller';

@Module({
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
