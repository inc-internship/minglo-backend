import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { NotificationType } from '../../src/shared/enums';
import { NotificationRepository } from '../../src/modules/notifications/infrastructure/notification.repository';

export class NotificationsTestManager {
  private readonly notifRepo: NotificationRepository;

  constructor(private readonly app: INestApplication) {
    this.notifRepo = app.get(NotificationRepository);
  }

  async seed(
    userId: string,
    type: NotificationType = NotificationType.SUBSCRIPTION_ACTIVATED,
    message = 'Test notification',
  ) {
    return this.notifRepo.create({ userId, type, message });
  }

  async getAll(
    token: string,
    expectedStatus = HttpStatus.OK,
    cursor?: string,
  ): Promise<request.Response> {
    const req = request(this.app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`);
    if (cursor) req.query({ cursor });
    return req.expect(expectedStatus);
  }

  async markAllRead(token: string, expectedStatus = HttpStatus.OK): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .patch('/api/v1/notifications/read')
      .set('Authorization', `Bearer ${token}`)
      .expect(expectedStatus);
  }

  async markOneRead(
    token: string,
    id: string,
    expectedStatus = HttpStatus.OK,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .patch(`/api/v1/notifications/${id}/read`)
      .set('Authorization', `Bearer ${token}`)
      .expect(expectedStatus);
  }

  async deleteOne(
    token: string,
    id: string,
    expectedStatus = HttpStatus.OK,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .delete(`/api/v1/notifications/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(expectedStatus);
  }
}
