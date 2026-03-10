import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { UserTestManager } from '../managers/user-test.manager';
import { UserTestDtoManager } from '../managers/user-test.dto-manager';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';
import { User } from '../../prisma/generated/prisma/client';
import { UserViewDto } from '../../src/modules/user/api/view-dto/user.view-dto';

describe('UserController - demo (e2e)', () => {
  let app: INestApplication<App>;
  let userTestManager: UserTestManager;
  let userTestDtoManager: UserTestDtoManager;

  let createUserDto: CreateUserDto;
  let createdUser: User;

  beforeAll(async () => {
    const result = await initTestSettings();
    app = result.app;
    userTestManager = result.userTestManger;
    userTestDtoManager = result.userTestDtoManager;

    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create User, POST : STATUS 201', async () => {
    createUserDto = userTestDtoManager.createUserDto({});

    createdUser = (await userTestManager.createUser(createUserDto)) as any;

    expect(createdUser.id).toBeDefined();
    expect(createdUser.publicId).toBeDefined();
    expect(createdUser.login).toEqual(createUserDto.login);
    expect(createdUser.email).toEqual(createUserDto.email);
    expect(createdUser.createdAt).toEqual(expect.any(String));
  });

  it('should return user by id, GET : STATUS 200', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${createdUser.publicId}`)
      .expect(HttpStatus.OK);

    const user = response.body as User;

    expect(user.publicId).toEqual(createdUser.publicId);
    expect(user.login).toEqual(createdUser.login);
    expect(user.email).toEqual(createdUser.email);
    expect(user.createdAt).toEqual(createdUser.createdAt);
  });

  it('should return all users, GET : STATUS 200', async () => {
    const response = await request(app.getHttpServer()).get('/users').expect(HttpStatus.OK);
    const body = response.body as UserViewDto[];
    expect(body.length).toEqual(1);
  });

  it('should update user with correct email, PUT : STATUS 204', async () => {
    const updatedEmail = 'updated-test$@gmail.com';

    await request(app.getHttpServer())
      .put(`/users/${createdUser.publicId}`)
      .send({
        email: updatedEmail,
      })
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer()).get(`/users/${createdUser.publicId}`);

    const updatedUser = response.body as UserViewDto;

    expect(updatedUser.email).toEqual(updatedEmail);
  });
});
