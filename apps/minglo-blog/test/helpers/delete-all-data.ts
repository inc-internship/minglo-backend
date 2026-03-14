import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Response } from 'supertest';

export const deleteAllData = async (app: INestApplication): Promise<Response> => {
  return request(app.getHttpServer()).delete(`/api/v1/testing/delete-all-data`).expect(204);
};
