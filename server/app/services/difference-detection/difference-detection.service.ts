import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Injectable } from '@nestjs/common';
import * as Jimp from 'jimp';

export const RGBA_DATA_LENGTH = 4;
const RGB_DATA_LENGTH = 3;
export const BLACK = 0x00;
const WHITE = 'white';
const DIFFERENCE_IMAGE_PATH = 'assets/images/difference-image.bmp';

@Injectable()
export class DifferenceDetectionService {
    firstImageArray: number[];
    secondImageArray: number[];
    radius: number;
    differenceArray: boolean[];
    test: boolean[];

    constructor(
        private pixelRadiusService: PixelRadiusService,
        private imageDimensionsService: ImageDimensionsService,
        private differencesCounterService: DifferencesCounterService,
    ) {}

    async createArray(image: string): Promise<number[]> {
        const numArray: number[] = [];
        const img = await Jimp.read(image);
        for (const rgbColor of img.bitmap.data) numArray.push(rgbColor);
        return numArray;
    }

    async compareImages(pathToImage1: string, pathToImage2: string, radius: number): Promise<number[][]> {
        this.firstImageArray = await this.createArray(pathToImage1);
        this.secondImageArray = await this.createArray(pathToImage2);
        this.radius = radius;
        this.differenceArray = new Array(this.imageDimensionsService.getNumberOfPixels());
        this.differenceArray.fill(false);
        const image = new Jimp(this.imageDimensionsService.getWidth(), this.imageDimensionsService.getHeight(), WHITE);
        return this.createDifferenceImage(image);
    }

    hasWhiteNeighboor(pixelPosition: number): boolean {
        for (const adjacentPixel of this.pixelRadiusService.getAdjacentPixels(pixelPosition, 1, false)) {
            if (!this.differenceArray[adjacentPixel]) return true;
        }
        return false;
    }

    createDifferenceImage(image: Jimp): number[][] {
        const h: number = performance.now();

        for (const i of this.differenceArray.keys()) {
            if (!this.isPixelSameColor(i * RGBA_DATA_LENGTH)) {
                this.differenceArray[i] = true;
            }
        }

        const newArray = new Array(this.imageDimensionsService.getNumberOfPixels());
        newArray.fill(false);
        for (let i = 0; i < this.differenceArray.length; i++) {
            if (this.differenceArray[i] && this.hasWhiteNeighboor(i)) {
                for (const adjacentPixel of this.pixelRadiusService.getAdjacentPixels(i, this.radius, true)) {
                    newArray[adjacentPixel] = true;
                }
            }
        }

        for (const i of this.differenceArray.keys()) {
            if (newArray[i] || this.differenceArray[i]) {
                this.setPixelBlack(image, i * RGBA_DATA_LENGTH);
            }
        }

        for (const i of newArray.keys()) {
            if (newArray[i]) this.differenceArray[i] = true;
        }

        console.log('this.differenceArray === this.test', this.differenceArray === this.test);
        const j: number = performance.now();
        console.log('scan', j - h);
        image.write(DIFFERENCE_IMAGE_PATH);

        const k: number = performance.now();
        const bfs = this.differencesCounterService.getDifferencesList(this.differenceArray);
        const l: number = performance.now();
        console.log('bfs', l - k);
        console.log(bfs.length);
        return bfs;
    }

    setPixelBlack(image: Jimp, pixelIndex: number): void {
        for (let i = 0; i < RGB_DATA_LENGTH; i++) {
            if (image.bitmap.data[pixelIndex + i] !== BLACK) image.bitmap.data[pixelIndex + i] = BLACK;
        }
    }

    isPixelSameColor(pixelIndex: number): boolean {
        for (let i = pixelIndex; i < pixelIndex + RGBA_DATA_LENGTH; i++) {
            if (this.firstImageArray[i] !== this.secondImageArray[i]) {
                return false;
            }
        }
        return true;
    }
}
