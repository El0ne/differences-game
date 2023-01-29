import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PixelDifferenceDetectionService {
    constructor() {}

    // function to get all the pixels directly around a pixel with a radius of radiusSize
    getPixelsAroundPixel(pixelCoordinateX: number, pixelCoordinateY: number, radiusSize: number): number[] {
        const pixelsAroundMyPixel: number[] = [];
        for (let i = pixelCoordinateX - radiusSize; i <= pixelCoordinateX + radiusSize; i++) {
            for (let j = pixelCoordinateY - radiusSize; j <= pixelCoordinateY + radiusSize; j++) {
                pixelsAroundMyPixel.push(i, j);
            }
        }
        return pixelsAroundMyPixel;
    }
}
