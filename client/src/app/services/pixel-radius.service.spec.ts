import { TestBed } from '@angular/core/testing';

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

    it('getPixelsAroundPixelInOneDimensionalArray function should return an array of pixels around a pixel', () => {
        const pixelLocation = 645;
        const radiusSize = 1;
        const expectedPixelsAroundMyPixel = [4, 5, 6, 644, 645, 646, 1284, 1285, 1286];
        const returnedPixelsAroundMyPixel = service.getPixelsAroundPixelInOneDimensionalArray(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(expectedPixelsAroundMyPixel);
    });

    it('getPixelsAroundPixelInOneDimensionalArray function should return an array of pixels around a pixel located near the border of image', () => {
        const pixelLocation = 642;
        const radiusSize = 3;
        const expectedPixelsAroundMyPixel = [
            0, 1, 2, 3, 4, 5, 640, 641, 642, 643, 644, 645, 1280, 1281, 1282, 1283, 1284, 1285, 1920, 1921, 1922, 1923, 1924, 1925, 2560, 2561, 2562,
            2563, 2564, 2565,
        ];
        const returnedPixelsAroundMyPixel = service.getPixelsAroundPixelInOneDimensionalArray(pixelLocation, radiusSize);
        expect(returnedPixelsAroundMyPixel).toEqual(expectedPixelsAroundMyPixel);
    });
});
