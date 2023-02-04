import { IMAGE_DIMENTIONS } from '@common/image-dimentions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageDimentionsService {
    readonly width: number = IMAGE_DIMENTIONS.width;
    readonly height: number = IMAGE_DIMENTIONS.height;
    readonly imageNumberOfPixels: number = this.width * this.height;
}
