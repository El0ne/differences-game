import { IMAGE_DIMENTIONS } from '@common/image-dimentions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageDimentionsService {
    getWidth(): number {
        return IMAGE_DIMENTIONS.width;
    }

    getHeight(): number {
        return IMAGE_DIMENTIONS.height;
    }

    getNumberOfPixels(): number {
        return this.getWidth() * this.getHeight();
    }
}
