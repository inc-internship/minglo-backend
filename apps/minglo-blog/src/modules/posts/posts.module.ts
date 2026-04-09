import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostsController } from './api/posts.controller';

@Module({
  imports: [HttpModule],
  controllers: [PostsController],
  providers: [],
})
export class PostsModule {}
