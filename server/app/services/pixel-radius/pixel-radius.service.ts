import { Injectable } from '@angular/core';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from './pixel-radius-constants..constants';

@Injectable({
    providedIn: 'root',
})
export class PixelRadiusService {
    getAdjacentPixels(pixelLocation: number, radiusSize: number): number[] {
        const pixelCoordinateX = pixelLocation % IMAGE_WIDTH;
        const pixelCoordinateY = Math.floor(pixelLocation / IMAGE_WIDTH);
        const pixelsAroundMyPixel: number[] = [];

        const leftExtremity = Math.max(pixelCoordinateX - radiusSize, 0);
        const rightExtremity = Math.min(pixelCoordinateX + radiusSize, IMAGE_WIDTH - 1);
        const upExtremity = Math.max(pixelCoordinateY - radiusSize, 0);
        const downExtremity = Math.min(pixelCoordinateY + radiusSize, IMAGE_HEIGHT - 1);

        for (let j = upExtremity; j <= downExtremity; j++) {
            for (let i = leftExtremity; i <= rightExtremity; i++) {
                pixelsAroundMyPixel.push(j * IMAGE_WIDTH + i);
            }
        }

        return pixelsAroundMyPixel;
    }
}
