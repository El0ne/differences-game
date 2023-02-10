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
        this.test = new Array(this.imageDimensionsService.getNumberOfPixels());
        this.test.fill(false);
        const image = new Jimp(this.imageDimensionsService.getWidth(), this.imageDimensionsService.getHeight(), WHITE);
        return this.createDifferenceImage(image);
    }

    hasWhiteNeighboor(pixelPosition: number, diffArray: boolean[]): boolean {
        for (const adjacentPixel of this.pixelRadiusService.getAdjacentPixels(pixelPosition, 1, false)) {
            if (!diffArray[adjacentPixel]) return true;
        }
        return false;
        // return true;
    }

    createDifferenceImage(image: Jimp): number[][] {
        const i: number = performance.now();

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, index) => {
            if (!this.isPixelSameColor(index)) {
                // this.setPixelBlack(image, index);
                this.differenceArray[index / RGBA_DATA_LENGTH] = true;
            }
        });

        const newArray = new Array(this.imageDimensionsService.getNumberOfPixels());
        newArray.fill(false);
        for (let i = 0; i < this.differenceArray.length; i++) {
            if (this.differenceArray[i] && this.hasWhiteNeighboor(i, this.differenceArray)) {
                for (const adjacentPixel of this.pixelRadiusService.getAdjacentPixels(i, this.radius, true)) {
                    newArray[adjacentPixel] = true;
                }
            }
        }

        // ajouter le rayon
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, index) => {
            if (newArray[index / RGBA_DATA_LENGTH] || this.differenceArray[index / 4]) {
                this.setPixelBlack(image, index);
            }
        });
        // const newArray = this.differenceArray;
        // for (let i = 0; i < this.differenceArray.length; i++) {
        //     if (this.differenceArray[i]) {
        //         for (const adjacentPixel of this.pixelRadiusService.getAdjacentPixels(i, this.radius, true)) {
        //             if (!this.differenceArray[adjacentPixel]) {
        //                 this.differenceArray[adjacentPixel] = true;
        //             }
        //             this.setPixelBlack(image, adjacentPixel * 4);
        //         }
        //     }
        // }

        console.log('this.differenceArray === this.test', this.differenceArray === this.test);
        const j: number = performance.now();
        console.log('scan', j - i);
        image.write(DIFFERENCE_IMAGE_PATH);

        const k: number = performance.now();
        // const bfs = this.differencesCounterService.getDifferencesList(this.differenceArray);
        const l: number = performance.now();
        console.log('bfs', l - k);
        const bfs = [[]];
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
