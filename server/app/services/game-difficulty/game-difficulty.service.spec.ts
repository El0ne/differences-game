import { Test, TestingModule } from '@nestjs/testing';
import { GameDifficultyService } from './game-difficulty.service';

describe('GameDifficultyService', () => {
  let service: GameDifficultyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameDifficultyService],
    }).compile();

    service = module.get<GameDifficultyService>(GameDifficultyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
