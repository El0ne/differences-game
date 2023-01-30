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

    // utilise MIN value entre les 2!!!!!
    getPixelsAroundPixelInOneDimensionalArray(pixelLocation: number, radiusSize: number): number[] {
        const imageWidth = 640;
        const imageHeight = 480;
        const pixelCoordinateX = pixelLocation % imageWidth;
        const pixelCoordinateY = Math.floor(pixelLocation / imageWidth);
        const pixelsAroundMyPixel: number[] = [];

        const leftExtremity = Math.max(pixelCoordinateX - radiusSize, 0);
        const rightExtremity = Math.min(pixelCoordinateX + radiusSize, imageWidth);
        const downExtremity = Math.max(pixelCoordinateY - radiusSize, 0);
        const upExtremity = Math.min(pixelCoordinateY + radiusSize, imageHeight);

        for (let j = downExtremity; j <= upExtremity; j++) {
            for (let i = leftExtremity; i <= rightExtremity; i++) {
                pixelsAroundMyPixel.push(j * imageWidth + i);
            }
        }

        return pixelsAroundMyPixel;
    }
}
