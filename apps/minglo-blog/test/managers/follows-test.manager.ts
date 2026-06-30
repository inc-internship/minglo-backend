import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class FollowsTestManager {
  constructor(private readonly app: INestApplication) {}

  async follow(
    targetUserId: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post(`/api/v1/users/${targetUserId}/follow`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedStatus);
  }

  async unfollow(
    targetUserId: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .delete(`/api/v1/users/${targetUserId}/follow`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedStatus);
  }
}
