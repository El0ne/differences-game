import { TestBed } from '@angular/core/testing';
import { EXPECTED_PIXELS_1, EXPECTED_PIXELS_2 } from './pixel-radius-constants..constants';

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

    it('getPixelsAroundPixelInOneDimensionalArray function should return an array of pixels around a pixel', () => {
        const pixelLocation = 645;
        const radiusSize = 1;
        const returnedPixelsAroundMyPixel = service.getPixelsAroundPixelInOneDimensionalArray(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_1);
    });

    it('getPixelsAroundPixelInOneDimensionalArray function should return an array of pixels around a pixel located near the border of image', () => {
        const pixelLocation = 642;
        const radiusSize = 3;
        const returnedPixelsAroundMyPixel = service.getPixelsAroundPixelInOneDimensionalArray(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(EXPECTED_PIXELS_2);
    });
});
