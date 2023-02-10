import { Test, TestingModule } from '@nestjs/testing';
import { GameCardService } from './game-card.service';

describe('GameCardService', () => {
  let service: GameCardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameCardService],
    }).compile();

    service = module.get<GameCardService>(GameCardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
