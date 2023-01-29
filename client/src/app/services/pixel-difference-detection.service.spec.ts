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

    it('comparePixels function should return true if the pixels X and Y coordinates are the same', () => {
        const firstPixelCoordinateX = 5;
        const firstPixelCoordinateY = 5;
        const secondPixelCoordinateX = 5;
        const secondPixelCoordinateY = 5;
        const expectedResult = true;
        const result = service.comparePixels(firstPixelCoordinateX, firstPixelCoordinateY, secondPixelCoordinateX, secondPixelCoordinateY);
        expect(result).toEqual(expectedResult);
    });

    it('comparePixels function should return false if the pixels X and Y coordinates are not the same', () => {
        const firstPixelCoordinateX = 1;
        const firstPixelCoordinateY = 2;
        const secondPixelCoordinateX = 3;
        const secondPixelCoordinateY = 4;
        const expectedResult = false;
        const result = service.comparePixels(firstPixelCoordinateX, firstPixelCoordinateY, secondPixelCoordinateX, secondPixelCoordinateY);
        expect(result).toEqual(expectedResult);
    });
});
