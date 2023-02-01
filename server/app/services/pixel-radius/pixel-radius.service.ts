import { Injectable } from '@nestjs/common';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from './pixel-radius.constants';

@Injectable()
export class PixelRadiusService {
    getAdjacentPixels(pixelLocation: number, radiusSize: number): number[] {
        const pixelCoordinateX = pixelLocation % IMAGE_WIDTH;
        const pixelCoordinateY = Math.floor(pixelLocation / IMAGE_WIDTH);
        const pixelsAroundMyPixel: number[] = [];

        const leftExtremity = Math.max(pixelCoordinateX - radiusSize, 0);
        const rightExtremity = Math.min(pixelCoordinateX + radiusSize, IMAGE_WIDTH);
        const downExtremity = Math.max(pixelCoordinateY - radiusSize, 0);
        const upExtremity = Math.min(pixelCoordinateY + radiusSize, IMAGE_HEIGHT);

        for (let j = downExtremity; j <= upExtremity; j++) {
            for (let i = leftExtremity; i <= rightExtremity; i++) {
                pixelsAroundMyPixel.push(j * IMAGE_WIDTH + i);
            }
        }

        return pixelsAroundMyPixel;
    }
}
