import { Test, TestingModule } from '@nestjs/testing';
import { BestTimesService } from './best-times.service';

describe('BestTimesService', () => {
    let service: BestTimesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BestTimesService],
        }).compile();

        service = module.get<BestTimesService>(BestTimesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
