import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from '../../src/modules/post/api/post.controller';
import { PostService } from '../../src/modules/post/application/services/post.service';

describe('PostController', () => {
  let controller: PostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [{ provide: PostService, useValue: {} }],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
