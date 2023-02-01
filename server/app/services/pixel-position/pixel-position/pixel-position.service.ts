import { IMAGE_WIDTH } from '@app/services/constants/pixel.constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PixelPositionService {
    getXCoordinate(pixelNumber: number): number {
        return pixelNumber % IMAGE_WIDTH;
    }

    getYCoordinate(pixelNumber: number): number {
        return Math.floor(pixelNumber / IMAGE_WIDTH);
    }
}
