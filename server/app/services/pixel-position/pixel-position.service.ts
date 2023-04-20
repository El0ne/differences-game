import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { Injectable } from '@nestjs/common';

export const outOfBoundConstant = 0;

@Injectable()
export class PixelPositionService {
    constructor(private imageDimensionsService: ImageDimensionsService) {}
    getXCoordinate(pixelNumber: number): number {
        if (pixelNumber >= 0 && pixelNumber < this.imageDimensionsService.getNumberOfPixels()) {
            return pixelNumber % this.imageDimensionsService.getWidth();
        }
        return outOfBoundConstant;
    }

    getYCoordinate(pixelNumber: number): number {
        if (pixelNumber >= 0 && pixelNumber < this.imageDimensionsService.getNumberOfPixels()) {
            return Math.floor(pixelNumber / this.imageDimensionsService.getWidth());
        }
        return outOfBoundConstant;
    }
}
