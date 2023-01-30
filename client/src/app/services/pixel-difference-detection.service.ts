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

    getPixelsAroundPixelInOneDimensionalArray(pixelLocation: number, radiusSize: number): number[] {
        const imageWidth = 640;
        const pixelCoordinateX = pixelLocation % imageWidth;
        const pixelCoordinateY = Math.floor(pixelLocation / imageWidth);
        const pixelsAroundMyPixel: number[] = [];
        if (pixelCoordinateX - radiusSize >= 0 && pixelCoordinateX + radiusSize < imageWidth) {
            for (let i = pixelCoordinateX - radiusSize; i <= pixelCoordinateX + radiusSize; i++) {
                for (let j = pixelCoordinateY - radiusSize; j <= pixelCoordinateY + radiusSize; j++) {
                    pixelsAroundMyPixel.push(j * imageWidth + i);
                }
            }
        }
        return pixelsAroundMyPixel;
    }
}
