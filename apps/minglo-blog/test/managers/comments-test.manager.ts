import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class CommentsTestManager {
  constructor(private readonly app: INestApplication) {}

  async createComment(
    postId: string,
    text: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post(`/api/v1/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text })
      .expect(expectedStatus);
  }

  async replyToComment(
    postId: string,
    commentId: string,
    text: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post(`/api/v1/posts/${postId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text })
      .expect(expectedStatus);
  }

  async deleteComment(
    postId: string,
    commentId: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .delete(`/api/v1/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedStatus);
  }
}
