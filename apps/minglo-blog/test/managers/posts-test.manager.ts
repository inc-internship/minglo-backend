import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreatePostInputDto } from '../../src/modules/posts/api/input-dto';

export class PostsTestManager {
  constructor(private readonly app: INestApplication) {}

  async createPost(
    dto: Partial<CreatePostInputDto>,
    accessToken: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto)
      .expect(expectedStatus);
  }

  validCreatePostDto(override: Partial<CreatePostInputDto> = {}): CreatePostInputDto {
    return {
      uploadIds: ['upload-id-1'],
      ...override,
    };
  }
}
