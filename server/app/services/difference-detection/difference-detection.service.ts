import { Injectable } from '@nestjs/common';
// import Jimp from 'jimp'; this import wont work
import * as Jimp from 'jimp';
@Injectable()
export class DifferenceDetectionService {
    width = 640;
    height = 480;
    differenceArray: boolean[] = [];

    pathToHere = './app/services/difference-detection/images';

    async createArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        const img = await Jimp.read(`${this.pathToHere}/${image}`);
        // console.log('before image size', img.bitmap.data.length);
        // console.log('img.bitmap.height', img.bitmap.height);
        // console.log('img.bitmap.width', img.bitmap.width);
        for (const rgbColor of img.bitmap.data) numArray.push(rgbColor);
        // console.log('numArray', numArray.length);
        return numArray;
    }

    createDifferenceImage() {
        const img = new Jimp(this.width, this.height, 'green', (err) => {
            if (err) throw err;
        });
        // console.log('after image size', img.bitmap.data.length);
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
            if (this.arePixelSameColor(idx)) {
                this.setPixelWhite(img, idx);
            } else {
                this.setPixelBlack(img, idx);
            }
        });
        img.write(`${this.pathToHere}/difference-image.bmp`);
    }

    arePixelSameColor(pixelIndex: number): boolean {
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
        const base = await this.createArray('image_12_diff.bmp');
        const modified = await this.createArray('image_7_diff.bmp');
        for (let i = 0; i < base.length; i++) {
            if (base[i] !== modified[i]) this.differenceArray.push(false);
            else this.differenceArray.push(true);
        }
        // console.log(this.differenceArray);
        this.createDifferenceImage();
    }
}
