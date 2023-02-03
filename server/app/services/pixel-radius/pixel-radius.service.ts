import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/services/constants/pixel.constants';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PixelRadiusService {
    constructor(private pixelPositionService: PixelPositionService) {}

    getAdjacentPixels(pixelLocation: number, radius: number): number[] {
        const xCoordinate = this.pixelPositionService.getXCoordinate(pixelLocation);
        const yCoordinate = this.pixelPositionService.getYCoordinate(pixelLocation);
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
