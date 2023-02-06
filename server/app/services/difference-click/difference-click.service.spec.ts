import { Test, TestingModule } from '@nestjs/testing';
import { DifferenceClickService } from './difference-click.service';

describe('DifferenceClickService', () => {
    let service: DifferenceClickService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceClickService],
        }).compile();

        service = module.get<DifferenceClickService>(DifferenceClickService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
