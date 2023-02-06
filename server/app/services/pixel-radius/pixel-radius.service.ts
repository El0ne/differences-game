import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PixelRadiusService {
    constructor(private pixelPositionService: PixelPositionService, private imageDimensionsService: ImageDimensionsService) {}

    getAdjacentPixels(pixelLocation: number, radius: number): number[] {
        const pixelCoordinateX = this.pixelPositionService.getXCoordinate(pixelLocation);
        const pixelCoordinateY = this.pixelPositionService.getYCoordinate(pixelLocation);
        const adjacentPixels: number[] = [];

        const leftExtremity = Math.max(pixelCoordinateX - radius, 0);
        const rightExtremity = Math.min(pixelCoordinateX + radius, this.imageDimensionsService.getWidth() - 1);
        const upExtremity = Math.max(pixelCoordinateY - radius, 0);
        const downExtremity = Math.min(pixelCoordinateY + radius, this.imageDimensionsService.getHeight() - 1);

        for (let i = upExtremity; i <= downExtremity; i++) {
            for (let j = leftExtremity; j <= rightExtremity; j++) {
                if (Math.pow(j - pixelCoordinateX, 2) + Math.pow(i - pixelCoordinateY, 2) <= Math.pow(radius, 2)) {
                    adjacentPixels.push(i * this.imageDimensionsService.getWidth() + j);
                }
            }
        }
        return adjacentPixels;
    }
}
