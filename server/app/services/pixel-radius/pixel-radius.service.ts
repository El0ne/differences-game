import { Injectable } from '@nestjs/common';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from './pixel-radius.constants';

@Injectable()
export class PixelRadiusService {
    getAdjacentPixels(pixelLocation: number, radius: number): number[] {
        const xCoordinate = pixelLocation % IMAGE_WIDTH;
        const yCoordinate = Math.floor(pixelLocation / IMAGE_WIDTH);
        const adjacentPixels: number[] = [];

        const left = Math.max(xCoordinate - radius, 0);
        const right = Math.min(xCoordinate + radius, IMAGE_WIDTH);
        const down = Math.max(yCoordinate - radius, 0);
        const up = Math.min(yCoordinate + radius, IMAGE_HEIGHT);

        for (let i = down; i <= up; i++) {
            for (let j = left; j <= right; j++) {
                adjacentPixels.push(i * IMAGE_WIDTH + j);
            }
        }
        return adjacentPixels;
    }
}
