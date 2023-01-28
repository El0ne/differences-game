import { Injectable } from '@nestjs/common';
// import Jimp from 'jimp'; this import wont work
import * as Jimp from 'jimp';
import { IMAGE_HEIGHT, IMAGE_WIDTH, PATH_TO_IMAGES } from './difference-detection.constants';
@Injectable()
export class DifferenceDetectionService {
    // TODO Replace when I receive input of array
    // @Input() firstImageArray: number[];
    // @Input() secondImageArray: number[];
    firstImage: string = 'image_2_diff.bmp';
    secondImage: string = 'image_2_diff.bmp';

    differenceArray: boolean[] = [];

    // TODO Remove method when I receive input of array
    async createArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        const img = await Jimp.read(`${PATH_TO_IMAGES}/${image}`);
        for (const rgbColor of img.bitmap.data) numArray.push(rgbColor);
        return numArray;
    }

    createDifferenceImage() {
        const img = new Jimp(IMAGE_WIDTH, IMAGE_HEIGHT, 'white', (err) => {
            if (err) throw err;
        });
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
            if (this.arePixelSameRGB(idx)) {
                this.setPixelWhite(img, idx);
            } else {
                this.setPixelBlack(img, idx);
            }
        });
        img.write(`${PATH_TO_IMAGES}/difference-image.bmp`);
    }

    arePixelSameRGB(pixelIndex: number): boolean {
        return this.differenceArray[pixelIndex] && this.differenceArray[pixelIndex + 1] && this.differenceArray[pixelIndex + 2];
    }
    setPixelWhite(image: Jimp, pixelIndex: number): void {
        image.bitmap.data[pixelIndex] = 0xff;
        image.bitmap.data[pixelIndex + 1] = 0xff;
        image.bitmap.data[pixelIndex + 2] = 0xff;
    }

    setPixelBlack(image: Jimp, pixelIndex: number): void {
        image.bitmap.data[pixelIndex] = 0x00;
        image.bitmap.data[pixelIndex + 1] = 0x00;
        image.bitmap.data[pixelIndex + 2] = 0x00;
    }
    async compareImages() {
        // TODO Remove when I receive input of array
        const firstImage = await this.createArray(this.firstImage);
        const secondImage = await this.createArray(this.secondImage);
        for (let i = 0; i < firstImage.length; i++) {
            if (firstImage[i] !== secondImage[i]) this.differenceArray.push(false);
            else this.differenceArray.push(true);
        }
        this.createDifferenceImage();
    }
}
