import { Test, TestingModule } from '@nestjs/testing';
import { PixelPositionService } from './pixel-position.service';

describe('PixelPositionService', () => {
  let service: PixelPositionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PixelPositionService],
    }).compile();

    service = module.get<PixelPositionService>(PixelPositionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
