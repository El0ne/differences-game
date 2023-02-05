import { TestBed } from '@angular/core/testing';
import {
    EXPECTED_PIXELS_WITH_RADIUS_OF_0,
    EXPECTED_PIXELS_WITH_RADIUS_OF_1,
    EXPECTED_PIXELS_WITH_RADIUS_OF_2,
    EXPECTED_PIXELS_WITH_RADIUS_OF_3,
} from './pixel-radius-constants..constants';

import { PixelRadiusService } from './pixel-radius.service';

describe('PixelRadiusService', () => {
    let service: PixelRadiusService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PixelRadiusService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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
