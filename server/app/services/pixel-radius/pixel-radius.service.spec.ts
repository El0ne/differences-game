/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('PixelRadiusService', () => {
    let service: PixelRadiusService;

    // radius test 1
    const EXPECTED_PIXELS_WITH_RADIUS_OF_1 = [5, 644, 645, 646, 1285];
    // radius test 2
    const EXPECTED_PIXELS_WITH_RADIUS_OF_0 = [27];
    // radius test 3
    const EXPECTED_PIXELS_WITH_RADIUS_OF_3 = [
        0, 1, 2, 3, 4, 640, 641, 642, 643, 644, 645, 1280, 1281, 1282, 1283, 1284, 1920, 1921, 1922, 1923, 1924, 2562,
    ];
    // radius test 4
    const EXPECTED_PIXELS_WITH_RADIUS_OF_2 = [305278, 305917, 305918, 305919, 306556, 306557, 306558, 306559, 307197, 307198, 307199];
    // square radius test
    const EXPECTED_PIXELS_WITH_RADIUS_OF_1_AND_SQUARE = [4, 5, 6, 644, 645, 646, 1284, 1285, 1286];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PixelRadiusService, PixelPositionService, ImageDimensionsService],
        }).compile();

        service = module.get<PixelRadiusService>(PixelRadiusService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAdjacentPixels function should return an array of pixels around a pixel', () => {
        const pixelLocation = 645;
        service.radius = 1;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, true);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_1);
    });

    it('getAdjacentPixels function should return a single pixel if radiusSize is 0', () => {
        const pixelLocation = 27;
        service.radius = 0;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, true);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_0);
    });

    it('getAdjacentPixels function should return an array of pixels around a pixel located near the top-left border of image', () => {
        const pixelLocation = 642;
        service.radius = 3;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, true);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_3);
    });

    it('getAdjacentPixels function should return an array of pixels around a pixel located near the bottom-right border of image', () => {
        const pixelLocation = 306558;
        service.radius = 2;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, true);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_2);
    });

    it('getAdjacentPixels function should return an square array of pixels around a pixel if isRound is false', () => {
        const pixelLocation = 645;
        service.radius = 1;
        const returnedPixelsAroundMyPixel = service.getAdjacentPixels(pixelLocation, false);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_1_AND_SQUARE);
    });

    it('set radius should set the radiusSquared to the square of the number', () => {
        service.radius = 5;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((service as any).radiusSquared).toEqual(25);
    });

    it('getAdjacentPixels should chose between radiusSquared property depending on parameters', () => {
        let pixelLocation = 645;
        service.radius = 3;
        const radiusPixels1 = service.getAdjacentPixels(pixelLocation, true, 1);
        expect(radiusPixels1).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_1);

        pixelLocation = 642;
        const radiusPixels3 = service.getAdjacentPixels(pixelLocation, true);
        expect(radiusPixels3).toEqual(EXPECTED_PIXELS_WITH_RADIUS_OF_3);
    });
});
