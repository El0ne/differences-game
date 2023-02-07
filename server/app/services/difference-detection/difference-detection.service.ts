import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Injectable } from '@nestjs/common';
import * as Jimp from 'jimp';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from './difference-detection.constants';

const RGBA_ITERATOR = 4;

@Injectable()
export class DifferenceDetectionService {
    firstImageArray: number[];
    secondImageArray: number[];
    radius: number;
    t0: number;
    t1: number;

    differenceArray: boolean[];

    constructor(private pixelRadiusService: PixelRadiusService) {}

    async createArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        const img = await Jimp.read(image);
        for (const rgbColor of img.bitmap.data) numArray.push(rgbColor);
        return numArray;
    }

    async compareImages(pathToImage1: string, pathToImage2: string, radius: number): Promise<void> {
        this.firstImageArray = await this.createArray(pathToImage1);
        this.secondImageArray = await this.createArray(pathToImage2);
        this.radius = radius;
        this.differenceArray = new Array(307200);
        this.differenceArray.fill(false);
        this.t0 = performance.now();
        this.createDifferenceImage();
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
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, index) => {
            if (!this.isPixelSameColor(index)) {
                for (const adjacentPixel of this.pixelRadiusService.getAdjacentPixels(index / RGBA_ITERATOR, this.radius)) {
                    this.setPixelBlack(image, adjacentPixel * RGBA_ITERATOR);
                    this.differenceArray[adjacentPixel] = true;
                }
            }
        });
        console.log('this.differenceArray.length', this.differenceArray.length);
        image.write('assets/images/difference-image.bmp');
    }

    setPixelBlack(image: Jimp, pixelIndex: number): void {
        image.bitmap.data[pixelIndex] = 0x00;
        image.bitmap.data[pixelIndex + 1] = 0x00;
        image.bitmap.data[pixelIndex + 2] = 0x00;
        image.bitmap.data[pixelIndex + 3] = 0xff;
    }

    isPixelSameColor(pixelIndex: number): boolean {
        return (
            this.firstImageArray[pixelIndex] === this.secondImageArray[pixelIndex] &&
            this.firstImageArray[pixelIndex + 1] === this.secondImageArray[pixelIndex + 1] &&
            this.firstImageArray[pixelIndex + 2] === this.secondImageArray[pixelIndex + 2] &&
            this.firstImageArray[pixelIndex + 3] === this.secondImageArray[pixelIndex + 3]
        );
    }
}
