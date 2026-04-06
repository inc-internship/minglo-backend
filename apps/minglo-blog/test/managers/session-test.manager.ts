import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class SessionTestManager {
  constructor(private readonly app: INestApplication) {}

  async getSession(
    token: string,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .get('/api/v1/sessions')
      .set('Authorization', `Bearer ${token}`)
      .expect(expectedStatus);
  }
}
