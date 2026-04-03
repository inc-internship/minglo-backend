import { Test, TestingModule } from '@nestjs/testing';
import { MingloMediaServiceController } from './minglo-media-service.controller';
import { MingloMediaServiceService } from './minglo-media-service.service';

describe('MingloMediaServiceController', () => {
  let mingloMediaServiceController: MingloMediaServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MingloMediaServiceController],
      providers: [MingloMediaServiceService],
    }).compile();

    mingloMediaServiceController = app.get<MingloMediaServiceController>(
      MingloMediaServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mingloMediaServiceController.getHello()).toBe('Hello World!');
    });
  });
});
