import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/modules/user/api/user.controller';
import { UserService } from '../../src/modules/user/application/services/user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: {} }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
