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
    secondImage: string = 'image_2_diff.bmp';
    t0: number;
    t1: number;

    testArray = [true, true, false, true, true, true, true, true, true, false, true, true];

    differenceArray: boolean[] = [];
    bfsArray: boolean[] = [];

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
        this.secondImageArray = await this.createArray(this.secondImage);
        this.t0 = performance.now();
        // for (let i = 0; i < this.firstImageArray.length; i++) {
        //     if (this.isSamePixelColor(i)) this.differenceArray.push(true);
        //     else this.differenceArray.push(false);
        // }
        // this.createDifferenceImage();
        this.createDifferenceImage2();
        this.t1 = performance.now();
        console.log('this.t1 - this.t0', this.t1 - this.t0);
    }

    isSamePixelColor(index: number) {
        return this.firstImageArray[index] === this.secondImageArray[index];
    }

    createDifferenceImage(): void {
        const image = new Jimp(IMAGE_WIDTH, IMAGE_HEIGHT, 'white', (err) => {
            if (err) throw err;
        });
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            if (this.arePixelSameRGB(idx)) {
                this.setPixelWhite(image, idx);
                this.bfsArray.push(true);
            } else {
                this.setPixelBlack(image, idx);
                this.bfsArray.push(false);
            }
        });
        console.log('this.bfsArray.length', this.bfsArray.length);
        console.log('differenceArray', this.differenceArray.length);
        image.write(`${PATH_TO_IMAGES}/difference-image.bmp`);
    }

    createDifferenceImage2(): void {
        const image = new Jimp(IMAGE_WIDTH, IMAGE_HEIGHT, 'white', (err) => {
            if (err) throw err;
        });
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            if (this.test(idx)) {
                this.setPixelWhite(image, idx);
                this.bfsArray.push(true);
            } else {
                this.setPixelBlack(image, idx);
                this.bfsArray.push(false);
            }
        });
        console.log('this.bfsArray.length', this.bfsArray.length);
        console.log('differenceArray', this.differenceArray.length);
        image.write(`${PATH_TO_IMAGES}/difference-image.bmp`);
    }

    arePixelSameRGB(pixelIndex: number): boolean {
        return this.differenceArray[pixelIndex];
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

    test(pixelIndex: number): boolean {
        return (
            this.firstImageArray[pixelIndex] === this.secondImageArray[pixelIndex] &&
            this.firstImageArray[pixelIndex + 1] === this.secondImageArray[pixelIndex + 1] &&
            this.firstImageArray[pixelIndex + 2] === this.secondImageArray[pixelIndex + 2] &&
            this.firstImageArray[pixelIndex + 3] === this.secondImageArray[pixelIndex + 3]
        );
    }
}
