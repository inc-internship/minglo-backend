import { Test, TestingModule } from '@nestjs/testing';
import { MicroAppController } from './micro-app.controller';
import { MicroAppService } from './micro-app.service';

describe('MicroAppController', () => {
  let microAppController: MicroAppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MicroAppController],
      providers: [MicroAppService],
    }).compile();

    microAppController = app.get<MicroAppController>(MicroAppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(microAppController.getHello()).toBe('Hello World!');
    });
  });
});
