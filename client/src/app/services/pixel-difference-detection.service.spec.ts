import { TestBed } from '@angular/core/testing';

import { PixelDifferenceDetectionService } from './pixel-difference-detection.service';

describe('PixelDifferenceDetectionService', () => {
    let service: PixelDifferenceDetectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PixelDifferenceDetectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getPixelsAroundPixel function should return an array of pixels around a pixel', () => {
        const pixelCoordinateX = 5;
        const pixelCoordinateY = 5;
        const radiusSize = 2;
        const expectedPixelsAroundMyPixel = [
            3, 3, 3, 4, 3, 5, 3, 6, 3, 7, 4, 3, 4, 4, 4, 5, 4, 6, 4, 7, 5, 3, 5, 4, 5, 5, 5, 6, 5, 7, 6, 3, 6, 4, 6, 5, 6, 6, 6, 7, 7, 3, 7, 4, 7, 5,
            7, 6, 7, 7,
        ];
        const returnedPixelsAroundMyPixel = service.getPixelsAroundPixel(pixelCoordinateX, pixelCoordinateY, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(expectedPixelsAroundMyPixel);
    });

    /*
    it('getPixelsAroundPixelInOneDimensionalArray function should return an array of pixels around a pixel', () => {
        const pixelLocation = 645;
        const radiusSize = 1;
        const expectedPixelsAroundMyPixel = [4, 644, 1284, 5, 645, 1285, 6, 646, 1286];
        const returnedPixelsAroundMyPixel = service.getPixelsAroundPixelInOneDimensionalArray(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(expectedPixelsAroundMyPixel);
    });
    */

    // include tests for exception cases management in X and Y
});
