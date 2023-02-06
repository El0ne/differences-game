/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ImageDimentionsService } from '@app/services/image-dimentions/image-dimentions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PixelRadiusService } from './pixel-radius.service';
describe('PixelRadiusService', () => {
    let service: PixelRadiusService;

    // radius test 1
    const EXPECTED_PIXELS_WITH_RADIUS_OF_1 = [4, 5, 6, 644, 645, 646, 1284, 1285, 1286];
    // radius test 2
    const EXPECTED_PIXELS_WITH_RADIUS_OF_0 = [27];
    // radius test 3
    const EXPECTED_PIXELS_WITH_RADIUS_OF_3 = [
        0, 1, 2, 3, 4, 5, 640, 641, 642, 643, 644, 645, 1280, 1281, 1282, 1283, 1284, 1285, 1920, 1921, 1922, 1923, 1924, 1925, 2560, 2561, 2562,
        2563, 2564, 2565,
    ];
    // radius test 4
    const EXPECTED_PIXELS_WITH_RADIUS_OF_2 = [
        305276, 305277, 305278, 305279, 305916, 305917, 305918, 305919, 306556, 306557, 306558, 306559, 307196, 307197, 307198, 307199,
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PixelRadiusService, PixelPositionService, ImageDimentionsService],
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

    it('getAdjacentPixels function should return a single pixel if radiusSize is 0', () => {
        const pixelLocation = 27;
        const radiusSize = 0;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_0);
    });

    it('getAdjacentPixels function should return an array of pixels around a pixel located near the top-left border of image', () => {
        const pixelLocation = 642;
        const radiusSize = 3;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_3);
    });

    it('getAdjacentPixels function should return an array of pixels around a pixel located near the bottom-right border of image', () => {
        const pixelLocation = 306558;
        const radiusSize = 2;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_2);
    });
});
