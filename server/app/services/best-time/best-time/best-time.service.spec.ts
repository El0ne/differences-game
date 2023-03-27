import { Test, TestingModule } from '@nestjs/testing';
import { BestTimeService } from './best-time.service';

describe('BestTimeService', () => {
  let service: BestTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BestTimeService],
    }).compile();

    service = module.get<BestTimeService>(BestTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
