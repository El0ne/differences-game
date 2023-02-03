import { Test, TestingModule } from '@nestjs/testing';
import { DifferencesDetectionService } from './differences-detection.service';

describe('DifferencesDetectionService', () => {
    let service: DifferencesDetectionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferencesDetectionService],
        }).compile();

        service = module.get<DifferencesDetectionService>(DifferencesDetectionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
