import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';

@Module({
  imports: [],
  controllers: [PostsController],
  providers: [],
})
export class PostsModule {}
