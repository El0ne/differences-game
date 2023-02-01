import { Injectable } from '@nestjs/common';
// import Jimp from 'jimp'; this import wont work
import * as Jimp from 'jimp';
import { IMAGE_HEIGHT, IMAGE_WIDTH, PATH_TO_IMAGES } from './difference-detection.constants';
@Injectable()
export class DifferenceDetectionService {
    // TODO Remove images when I receive array from soloGameView
    firstImageArray: number[];
    secondImageArray: number[];
    firstImage: string = 'image_12_diff.bmp';
    secondImage: string = 'image_7_diff.bmp';
    t0: number;
    t1: number;

    bfsArray: boolean[] = [];
    image: Jimp;

    // TODO Remove method when I receive array from soloGameView
    async createArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        const img = await Jimp.read(`${PATH_TO_IMAGES}/${image}`);
        for (const rgbColor of img.bitmap.data) numArray.push(rgbColor);
        return numArray;
    }

    async compareImages(): Promise<void> {
        // TODO Remove when I receive array from soloGameView
        this.firstImageArray = await this.createArray(this.firstImage);
        this.firstImageArray = [0];
        this.secondImageArray = await this.createArray(this.secondImage);
        this.t0 = performance.now();
        this.createDifferenceImage();
        this.t1 = performance.now();
        console.log('this.t1 - this.t0', this.t1 - this.t0);
    }

    createDifferenceImage(): void {
        this.image = new Jimp(IMAGE_WIDTH, IMAGE_HEIGHT, 'white', (err) => {
            if (err) throw err;
        });
        this.image.scan(0, 0, this.image.bitmap.width, this.image.bitmap.height, (x, y, idx) => {
            if (this.isSamePixelColor(idx)) {
                this.setPixelWhite(this.image, idx);
                this.bfsArray.push(true);
            } else {
                this.setPixelBlack(this.image, idx);
                this.bfsArray.push(false);
            }
        });
        console.log('this.bfsArray.length', this.bfsArray.length);
        this.image.write(`${PATH_TO_IMAGES}/difference-image.bmp`);
    }

    isSamePixelColor(pixelIndex: number): boolean {
        return (
            this.firstImageArray[pixelIndex] === this.secondImageArray[pixelIndex] &&
            this.firstImageArray[pixelIndex + 1] === this.secondImageArray[pixelIndex + 1] &&
            this.firstImageArray[pixelIndex + 2] === this.secondImageArray[pixelIndex + 2] &&
            this.firstImageArray[pixelIndex + 3] === this.secondImageArray[pixelIndex + 3]
        );
    }
    setPixelWhite(image: Jimp, pixelIndex: number): void {
        image.bitmap.data[pixelIndex] = 0xff;
        image.bitmap.data[pixelIndex + 1] = 0xff;
        image.bitmap.data[pixelIndex + 2] = 0xff;
        image.bitmap.data[pixelIndex + 3] = 0xff;
    }

    setPixelBlack(image: Jimp, pixelIndex: number): void {
        image.bitmap.data[pixelIndex] = 0x00;
        image.bitmap.data[pixelIndex + 1] = 0x00;
        image.bitmap.data[pixelIndex + 2] = 0x00;
        image.bitmap.data[pixelIndex + 3] = 0xff;
    }
}
