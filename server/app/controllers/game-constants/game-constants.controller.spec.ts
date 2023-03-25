import { Test, TestingModule } from '@nestjs/testing';
import { GameConstantsController } from './game-constants.controller';

describe('GameConstantsController', () => {
  let controller: GameConstantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameConstantsController],
    }).compile();

    controller = module.get<GameConstantsController>(GameConstantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
