import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class LikesTestManager {
  constructor(private readonly app: INestApplication) {}

  async likePost(
    postId: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post(`/api/v1/posts/${postId}/likes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedStatus);
  }

  async unlikePost(
    postId: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .delete(`/api/v1/posts/${postId}/likes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedStatus);
  }

  async likeComment(
    postId: string,
    commentId: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post(`/api/v1/posts/${postId}/comments/${commentId}/likes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedStatus);
  }

  async unlikeComment(
    postId: string,
    commentId: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .delete(`/api/v1/posts/${postId}/comments/${commentId}/likes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedStatus);
  }

  async getPostLikes(
    postId: string,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .get(`/api/v1/posts/${postId}/likes`)
      .expect(expectedStatus);
  }
}
