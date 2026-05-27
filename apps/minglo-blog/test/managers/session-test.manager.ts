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

  async deleteSession(
    token: string,
    deviceId: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .delete(`/api/v1/sessions/${deviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(expectedStatus);
  }

  async deleteAllOtherSession(
    token: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .delete(`/api/v1/sessions`)
      .set('Authorization', `Bearer ${token}`)
      .expect(expectedStatus);
  }
}
