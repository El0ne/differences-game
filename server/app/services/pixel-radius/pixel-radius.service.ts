// -- need to use radius as a variable name
/* eslint-disable no-underscore-dangle */
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PixelRadiusService {
    private _radius: number;
    private radiusSquared: number;

    constructor(private pixelPositionService: PixelPositionService, private imageDimensionsService: ImageDimensionsService) {}

    set radius(radius: number) {
        this._radius = radius;
        this.radiusSquared = radius ** 2;
    }

    getAdjacentPixels(pixelLocation: number, roundRadius: boolean, radius?: number): number[] {
        let radiusSquared: number;
        if (radius !== undefined) {
            radiusSquared = radius ** 2;
        } else {
            radiusSquared = this.radiusSquared;
            radius = this._radius;
        }

        const pixelCoordinateX = this.pixelPositionService.getXCoordinate(pixelLocation);
        const pixelCoordinateY = this.pixelPositionService.getYCoordinate(pixelLocation);
        const adjacentPixels: number[] = [];

        const leftExtremity = Math.max(pixelCoordinateX - radius, 0);
        const rightExtremity = Math.min(pixelCoordinateX + radius, this.imageDimensionsService.getWidth() - 1);
        const upExtremity = Math.max(pixelCoordinateY - radius, 0);
        const downExtremity = Math.min(pixelCoordinateY + radius, this.imageDimensionsService.getHeight() - 1);

        const horizontalRadiusSquared: Map<number, number> = new Map<number, number>();
        for (let j = leftExtremity; j <= rightExtremity; j++) {
            horizontalRadiusSquared.set(j, (j - pixelCoordinateX) ** 2);
        }

        for (let i = upExtremity; i <= downExtremity; i++) {
            const verticalRadiusSquared = (i - pixelCoordinateY) ** 2;
            for (let j = leftExtremity; j <= rightExtremity; j++) {
                if (roundRadius && horizontalRadiusSquared.get(j) + verticalRadiusSquared > radiusSquared) {
                    continue;
                }
                adjacentPixels.push(i * this.imageDimensionsService.getWidth() + j);
            }
        }
        return adjacentPixels;
    }
}
