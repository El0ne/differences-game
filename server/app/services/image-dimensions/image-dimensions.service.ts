import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageDimensionsService {
    getWidth(): number {
        return IMAGE_DIMENSIONS.width;
    }

    getHeight(): number {
        return IMAGE_DIMENSIONS.height;
    }

    getNumberOfPixels(): number {
        return this.getWidth() * this.getHeight();
    }
}
