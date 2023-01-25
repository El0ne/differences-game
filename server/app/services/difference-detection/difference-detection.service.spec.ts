import { Test, TestingModule } from '@nestjs/testing';
import { DifferenceDetectionService } from './difference-detection.service';

describe('DifferenceDetectionService', () => {
    let service: DifferenceDetectionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceDetectionService],
        }).compile();

        service = module.get<DifferenceDetectionService>(DifferenceDetectionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
