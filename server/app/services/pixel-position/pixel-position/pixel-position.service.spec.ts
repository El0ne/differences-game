/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PixelPositionService } from './pixel-position.service';

describe('PixelPositionService', () => {
    let service: PixelPositionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PixelPositionService, ImageDimensionsService],
        }).compile();

        service = module.get<PixelPositionService>(PixelPositionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getXCoordinate should return a pixels x coordinate', () => {
        const xCoordinate = service.getXCoordinate(999);
        expect(xCoordinate).toEqual(359);
    });

    it('getYCoordinate should return a pixels y coordinate', () => {
        const yCoordinate = service.getYCoordinate(9999);
        expect(yCoordinate).toEqual(15);
    });
});
