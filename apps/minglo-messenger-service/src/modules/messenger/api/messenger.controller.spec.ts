import { Test, TestingModule } from '@nestjs/testing';
import { MessengerController } from './messenger.controller';
import { MessengerService } from '../application/services/messenger.service';

describe('MessengerController', () => {
  let mingloMessengerServiceController: MessengerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessengerController],
      providers: [MessengerService],
    }).compile();

    mingloMessengerServiceController = app.get<MessengerController>(MessengerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mingloMessengerServiceController.getHello()).toBe('Hello World!');
    });
  });
});
