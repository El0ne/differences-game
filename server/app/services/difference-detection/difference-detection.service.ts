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

    createDifferenceImage(image: Jimp): number[][] {
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, index) => {
            if (!this.isPixelSameColor(index)) {
                for (const adjacentPixel of this.pixelRadiusService.getAdjacentPixels(index / RGBA_DATA_LENGTH, this.radius, true)) {
                    this.setPixelBlack(image, adjacentPixel * RGBA_DATA_LENGTH);
                    this.differenceArray[adjacentPixel] = true;
                }
            }
        });
        image.write(DIFFERENCE_IMAGE_PATH);
        return this.differencesCounterService.getDifferencesList(this.differenceArray);
    }

    setPixelBlack(image: Jimp, pixelIndex: number): void {
        for (let i = 0; i < RGB_DATA_LENGTH; i++) {
            image.bitmap.data[pixelIndex + i] = BLACK;
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
