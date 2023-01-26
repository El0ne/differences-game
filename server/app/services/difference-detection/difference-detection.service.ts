import { Injectable } from '@nestjs/common';
// import Jimp from 'jimp'; this import wont work
import * as Jimp from 'jimp';
@Injectable()
export class DifferenceDetectionService {
    dimensions: number = 300;

    batArray = [];
    pathToHere = './app/services/difference-detection/images';

    hello(): void {
        console.log('Hello World');
    }

    async createHexArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        const img = await Jimp.read(`${this.pathToHere}/${image}`);
        console.log('img.bitmap.height', img.bitmap.height);
        console.log('img.bitmap.width', img.bitmap.width);
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
            numArray.push(this.bitmap.data[idx]);
        });
        console.log('numArray', numArray);
        return numArray;
    }

    createDifferenceImage(differenceArray: boolean[]) {
        const img = new Jimp(this.dimensions, this.dimensions, 'green', (err) => {
            if (err) throw err;
        });
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
            if (differenceArray[idx]) {
                img.bitmap.data[idx] = 0x00;
                img.bitmap.data[idx + 1] = 0x00;
                img.bitmap.data[idx + 2] = 0x00;
                img.bitmap.data[idx + 3] = 0xff;
            } else {
                img.bitmap.data[idx] = 0xff;
                img.bitmap.data[idx + 1] = 0xff;
                img.bitmap.data[idx + 2] = 0xff;
                img.bitmap.data[idx + 3] = 0xff;
            }
        });
        img.write(`${this.pathToHere}/difference-image.${img.getExtension()}`);
    }

    async compareImages() {
        const base = await this.createHexArray('base.jpeg');
        const modified = await this.createHexArray('modified.jpeg');
        const differenceArray: boolean[] = [];
        for (let i = 0; i < base.length; i += 4) {
            if (base[i] !== modified[i]) differenceArray.push(false);
            else differenceArray.push(true);
        }
        console.log(differenceArray);
        this.createDifferenceImage(differenceArray);
    }
}
