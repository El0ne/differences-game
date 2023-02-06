import { ImageDimentionsService } from '@app/services/image-dimentions/image-dimentions.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PixelPositionService {
    constructor(private imageDimentionsService: ImageDimentionsService) {}
    getXCoordinate(pixelNumber: number): number {
        return pixelNumber % this.imageDimentionsService.getWidth();
    }

    getYCoordinate(pixelNumber: number): number {
        return Math.floor(pixelNumber / this.imageDimentionsService.getWidth());
    }
}
