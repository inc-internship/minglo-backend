import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  CreateUserInputDto,
  UpdateUserInputDto,
} from '../../src/modules/user-account/api/input-dto';
import { UserViewDto } from '../../src/modules/user-account/api/view-dto/user.view-dto';

/* Вспомогательный класс для тестирования users (Demo)*/
export class UserTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/users`)
      .send(createModel)
      .expect(statusCode);

    return response.body;
  }

  async updateUser(
    userPublicId: string,
    updateModel: UpdateUserInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .put(`/users/${userPublicId}`)
      .send(updateModel)
      .expect(statusCode);

    return response.body;
  }

  // async createSeveralUsers(count: number): Promise<UserViewDto[]> {
  //   const usersPromises = [] as Promise<UserViewDto>[];
  //
  //   for (let i = 0; i < count; ++i) {
  //     const response = this.createUser({
  //       login: `testlog` + i,
  //       email: `test${i}@gmail.com`,
  //       password: '123456789',
  //     });
  //     usersPromises.push(response);
  //   }
  //
  //   return Promise.all(usersPromises);
  // }
}
