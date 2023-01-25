import { Injectable } from '@nestjs/common';
// import Jimp from 'jimp'; this import wont work
import * as Jimp from 'jimp';
@Injectable()
export class DifferenceDetectionService {
    whiteHex: number = 4294967295;
    blackHex: number = 255;

    batArray = [];
    pathToHere = './app/services/difference-detection/images';

    hello(): void {
        console.log('Hello World');
    }

    async createHexArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        const img = await Jimp.read(`${this.pathToHere}/${image}`);
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
            numArray.push(this.bitmap.data[idx]);
        });
        return numArray;
    }

    createDifferenceImage() {
        const image = new Jimp(300, 300, 'green', (err) => {
            if (err) throw err;
        });
        image.write(`${this.pathToHere}/difference-image.${image.getExtension()}`);
    }

    async compareImages() {
        const batImage = await this.createHexArray('bat.bmp');
        const smileyImage = await this.createHexArray('smiley.jpeg');
        const differenceArray: number[] = [];
        for (let i = 0; i < batImage.length; i++) {
            if (batImage[i] !== smileyImage[i]) differenceArray.push(this.blackHex);
            else differenceArray.push(this.whiteHex);
        }
        this.createDifferenceImage();
    }
}
