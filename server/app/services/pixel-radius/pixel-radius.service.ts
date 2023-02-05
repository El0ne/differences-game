import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/services/constants/pixel.constants';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PixelRadiusService {
    constructor(private pixelPositionService: PixelPositionService) {}

    getAdjacentPixels(pixelLocation: number, radius: number): number[] {
        const pixelCoordinateX = this.pixelPositionService.getXCoordinate(pixelLocation);
        const pixelCoordinateY = this.pixelPositionService.getYCoordinate(pixelLocation);
        const adjacentPixels: number[] = [];

        const leftExtremity = Math.max(pixelCoordinateX - radius, 0);
        const rightExtremity = Math.min(pixelCoordinateX + radius, IMAGE_WIDTH - 1);
        const upExtremity = Math.max(pixelCoordinateY - radius, 0);
        const downExtremity = Math.min(pixelCoordinateY + radius, IMAGE_HEIGHT - 1);

        for (let j = upExtremity; j <= downExtremity; j++) {
            for (let i = leftExtremity; i <= rightExtremity; i++) {
                adjacentPixels.push(j * IMAGE_WIDTH + i);
            }
        }
        return adjacentPixels;
    }
}
