import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoggerService } from '@app/logger';

@Controller('posts')
export class PostsController {
  constructor(private logger: LoggerService) {
    this.logger.setContext(PostsController.name);
  }

  //todo: complete post image upload
  @Post('upload-image')
  @HttpCode(HttpStatus.NO_CONTENT)
  async uploadImage(): Promise<void> {
    this.logger.log('New post image(s) uploaded', 'uploadImage');
  }
}
