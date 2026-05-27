import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class ProfileTestManager {
  constructor(private readonly app: INestApplication) {}

  async getMyProfile(
    token: string,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .get('/api/v1/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(expectedStatus);
  }

  async softDeleteMyProfile(
    token: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .delete('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(expectedStatus);
  }
}
