import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreatePostInputDto, UpdatePostInputDto } from '../../src/modules/posts/api/input-dto';

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

  async getPostById(
    postId: string,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer()).get(`/api/v1/posts/${postId}`).expect(expectedStatus);
  }

  async updatePost(
    postId: string,
    dto: Partial<UpdatePostInputDto>,
    accessToken: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .put(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto)
      .expect(expectedStatus);
  }

  async deletePost(
    postId: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .delete(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedStatus);
  }

  async getUserPosts(
    userId: string,
    cursor?: string,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .get(`/api/v1/posts/user/${userId}`)
      .query(cursor ? { cursor } : {})
      .expect(expectedStatus);
  }

  async getLatestPosts(expectedStatus: number = HttpStatus.OK): Promise<request.Response> {
    return request(this.app.getHttpServer()).get('/api/v1/posts/latest').expect(expectedStatus);
  }

  validCreatePostDto(override: Partial<CreatePostInputDto> = {}): CreatePostInputDto {
    return {
      uploadIds: ['upload-id-1'],
      ...override,
    };
  }
}
