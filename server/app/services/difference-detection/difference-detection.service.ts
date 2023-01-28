import { Injectable } from '@nestjs/common';
// import Jimp from 'jimp'; this import wont work
import * as Jimp from 'jimp';
import { IMAGE_HEIGHT, IMAGE_WIDTH, PATH_TO_IMAGES } from './difference-detection.constants';
@Injectable()
export class DifferenceDetectionService {
    // TODO Replace when I receive array from soloGameView
    // firstImageArray: number[];
    // secondImageArray: number[];
    firstImage: string = 'image_2_diff.bmp';
    secondImage: string = 'image_7_diff.bmp';

    differenceArray: boolean[] = [];

    // TODO Remove method when I receive array from soloGameView
    async createArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        const img = await Jimp.read(`${PATH_TO_IMAGES}/${image}`);
        for (const rgbColor of img.bitmap.data) numArray.push(rgbColor);
        return numArray;
    }

    createDifferenceImage() {
        const image = new Jimp(IMAGE_WIDTH, IMAGE_HEIGHT, 'white', (err) => {
            if (err) throw err;
        });
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            if (this.arePixelSameRGB(idx)) {
                this.setPixelWhite(image, idx);
            } else {
                this.setPixelBlack(image, idx);
            }
        });
        image.write(`${PATH_TO_IMAGES}/difference-image.bmp`);
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
        // TODO Remove when I receive array from soloGameView
        const firstImage = await this.createArray(this.firstImage);
        const secondImage = await this.createArray(this.secondImage);
        for (let i = 0; i < firstImage.length; i++) {
            if (firstImage[i] !== secondImage[i]) this.differenceArray.push(false);
            else this.differenceArray.push(true);
        }
        this.createDifferenceImage();
    }
}
