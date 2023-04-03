import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PixelRadiusService {
    constructor(private pixelPositionService: PixelPositionService, private imageDimensionsService: ImageDimensionsService) {}

    getAdjacentPixels(pixelLocation: number, radius: number, roundRadius: boolean): number[] {
        const pixelCoordinateX = this.pixelPositionService.getXCoordinate(pixelLocation);
        const pixelCoordinateY = this.pixelPositionService.getYCoordinate(pixelLocation);
        const adjacentPixels: number[] = [];

        const leftExtremity = Math.max(pixelCoordinateX - radius, 0);
        const rightExtremity = Math.min(pixelCoordinateX + radius, this.imageDimensionsService.getWidth() - 1);
        const upExtremity = Math.max(pixelCoordinateY - radius, 0);
        const downExtremity = Math.min(pixelCoordinateY + radius, this.imageDimensionsService.getHeight() - 1);

        const radiusSquared = radius ** 2;

        for (let i = upExtremity; i <= downExtremity; i++) {
            const verticalRadiusSquared = (i - pixelCoordinateY) ** 2;
            for (let j = leftExtremity; j <= rightExtremity; j++) {
                if (roundRadius && (j - pixelCoordinateX) ** 2 + verticalRadiusSquared > radiusSquared) {
                    continue;
                }
                adjacentPixels.push(i * this.imageDimensionsService.getWidth() + j);
            }
        }
        return adjacentPixels;
    }
}
