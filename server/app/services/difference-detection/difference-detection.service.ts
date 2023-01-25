import { Injectable } from '@nestjs/common';
// import Jimp from 'jimp'; this import wont work
import * as Jimp from 'jimp';
@Injectable()
export class DifferenceDetectionService {
    whiteHex: number = 4294967295;
    blackHex: number = 255;

    batArray = [];
    pathToHere = './app/services/difference-detection/';

    hello(): void {
        console.log('Hello World');
    }

    async createHexArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        await Jimp.read(`${this.pathToHere}/${image}`, (err, img) => {
            for (let i = 0; i < 600; i++) {
                for (let j = 0; j < 600; j++) {
                    numArray.push(img.getPixelColour(i, j));
                }
                console.log(i);
            }
            console.log('numArray', numArray);
        });
        console.log('numArray done');
        return numArray;
    }

    async compareImages() {
        console.log('comp start');
        const batImage = await this.createHexArray('bat.bmp');
        console.log('between');
        const smileyImage = await this.createHexArray('smiley.jpeg');
        const differenceArray: number[] = [];
        for (let i = 0; i < batImage.length; i++) {
            batImage[i] !== smileyImage[i] ? differenceArray.push(this.blackHex) : differenceArray.push(this.whiteHex);
        }
        console.log('made it');
        console.log(differenceArray);
    }
}
