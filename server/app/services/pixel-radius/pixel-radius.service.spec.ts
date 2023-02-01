import {
    EXPECTED_PIXELS_WITH_RADIUS_OF_0,
    EXPECTED_PIXELS_WITH_RADIUS_OF_1,
    EXPECTED_PIXELS_WITH_RADIUS_OF_3,
} from '@app/services/constants/pixel.constants';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PixelRadiusService } from './pixel-radius.service';
describe('PixelRadiusService', () => {
    let service: PixelRadiusService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PixelRadiusService, PixelPositionService],
        }).compile();

        service = module.get<PixelRadiusService>(PixelRadiusService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAdjacentPixels function should return an array of pixels around a pixel', () => {
        const pixelLocation = 645;
        const radiusSize = 1;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_1);
    });

    it('getAdjacentPixels function should return an array of pixels around a pixel located near the border of image', () => {
        const pixelLocation = 642;
        const radiusSize = 3;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_3);
    });

    it('getAdjacentPixels function should return a single pixel if radiusSize is 0', () => {
        const pixelLocation = 27;
        const radiusSize = 0;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_0);
    });
});
