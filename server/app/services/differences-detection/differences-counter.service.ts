import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DifferencesCounterService {
    constructor(private pixelRadiusService: PixelRadiusService) {}

    getDifferencesList(differencesArray: boolean[]): number[][] {
        const visitedPixels: number[][] = [];
        const queue: number[] = [];
        let numberOfDifferences = 0;

        for (const index of differencesArray.keys()) {
            if (this.isNewAndDifferentPixel(index, differencesArray, visitedPixels)) {
                queue.push(index);
                visitedPixels.push([index]);

                while (queue.length !== 0) {
                    const currentPos = queue.shift();
                    for (const adjacentPixel of this.pixelRadiusService.getAdjacentPixels(currentPos, 1)) {
                        if (this.isNewAndDifferentPixel(adjacentPixel, differencesArray, visitedPixels)) {
                            visitedPixels[numberOfDifferences].push(adjacentPixel);
                            queue.push(adjacentPixel);
                        }
                    }
                }
                numberOfDifferences++;
            }
        }

        return visitedPixels;
    }

    isNewAndDifferentPixel(index: number, differencesArray: boolean[], visitedPixels: number[][]) {
        return differencesArray[index] && !this.isAVisitedPixel(index, visitedPixels);
    }

    findPixelDifferenceIndex(pixelIndex: number, visitedPixels: number[][]): number /* usable for the game to find which pixel was clicked*/ {
        for (const differenceIndex of visitedPixels.keys()) {
            if (visitedPixels[differenceIndex].includes(pixelIndex)) {
                return differenceIndex;
            }
        }
        return visitedPixels.length;
    }

    isAVisitedPixel(pixelIndex: number, visitedPixels: number[][]): boolean {
        return this.findPixelDifferenceIndex(pixelIndex, visitedPixels) !== visitedPixels.length;
    }
}
