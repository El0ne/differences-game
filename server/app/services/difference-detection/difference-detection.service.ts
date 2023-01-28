import { Injectable } from '@nestjs/common';
// import Jimp from 'jimp'; this import wont work
import * as Jimp from 'jimp';
@Injectable()
export class DifferenceDetectionService {
    width = 640;
    height = 480;

    batArray = [];
    pathToHere = './app/services/difference-detection/images';

    hello(): void {
        console.log('Hello World');
    }

    async createArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        const img = await Jimp.read(`${this.pathToHere}/${image}`);
        console.log('before image size', img.bitmap.data.length);

        console.log('img.bitmap.height', img.bitmap.height);
        console.log('img.bitmap.width', img.bitmap.width);
        // img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
        //     numArray.push(this.bitmap.data[idx]);
        // });
        for (let i = 0; i < img.bitmap.data.length; i++) {
            numArray.push(img.bitmap.data[i]);
        }
        console.log('numArray', numArray.length);
        return numArray;
    }

    createDifferenceImage(differenceArray: boolean[]) {
        const img = new Jimp(this.width, this.height, 'green', (err) => {
            if (err) throw err;
        });
        console.log('after image size', img.bitmap.data.length);
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
            if (differenceArray[idx] && differenceArray[idx + 1] && differenceArray[idx + 2] && differenceArray[idx + 3]) {
                img.bitmap.data[idx] = 0xff;
                img.bitmap.data[idx + 1] = 0xff;
                img.bitmap.data[idx + 2] = 0xff;
                // img.bitmap.data[idx + 3] = 0xff;
            } else {
                img.bitmap.data[idx] = 0x00;
                img.bitmap.data[idx + 1] = 0x00;
                img.bitmap.data[idx + 2] = 0x00;
                // img.bitmap.data[idx + 3] = 0xff;
            }
        });
        img.write(`${this.pathToHere}/difference-image.bmp`);
    }

    async compareImages() {
        const base = await this.createArray('image_2_diff.bmp');
        const modified = await this.createArray('image_12_diff.bmp');
        const differenceArray: boolean[] = [];
        for (let i = 0; i < base.length; i++) {
            if (base[i] !== modified[i]) differenceArray.push(false);
            else differenceArray.push(true);
        }
        console.log(differenceArray);
        this.createDifferenceImage(differenceArray);
    }
}
