import { Test, TestingModule } from '@nestjs/testing';
import { GameConstantService } from './game-constant.service';

describe('GameConstantService', () => {
  let service: GameConstantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameConstantService],
    }).compile();

    service = module.get<GameConstantService>(GameConstantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
