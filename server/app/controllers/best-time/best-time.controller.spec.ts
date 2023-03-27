import { Test, TestingModule } from '@nestjs/testing';
import { BestTimeController } from './best-time.controller';

describe('BestTimeController', () => {
  let controller: BestTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BestTimeController],
    }).compile();

    controller = module.get<BestTimeController>(BestTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
