import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PixelDifferenceDetectionService {
    constructor() {}

    getPixelsAroundPixel(pixelCoordinateX: number, pixelCoordinateY: number, radiusSize: number): number[] {
        const pixelsAroundMyPixel: number[] = [];
        for (let i = pixelCoordinateX - radiusSize; i <= pixelCoordinateX + radiusSize; i++) {
            for (let j = pixelCoordinateY - radiusSize; j <= pixelCoordinateY + radiusSize; j++) {
                pixelsAroundMyPixel.push(i, j);
            }
        }
        return pixelsAroundMyPixel;
    }

    comparePixels(
        firstPixelCoordinateX: number,
        firstPixelCoordinateY: number,
        secondPixelCoordinateX: number,
        secondPixelCoordinateY: number,
    ): boolean {
        if (firstPixelCoordinateX === secondPixelCoordinateX && firstPixelCoordinateY === secondPixelCoordinateY) {
            return true;
        } else {
            return false;
        }
    }
}
