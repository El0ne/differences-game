import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PixelPositionService {
    constructor(private imageDimensionsService: ImageDimensionsService) {}
    getXCoordinate(pixelNumber: number): number {
        return pixelNumber % this.imageDimensionsService.getWidth();
    }

    getYCoordinate(pixelNumber: number): number {
        return Math.floor(pixelNumber / this.imageDimensionsService.getWidth());
    }
}
