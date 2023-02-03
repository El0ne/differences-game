import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DifferencesDetectionService {
    constructor(private pixelRadiusService: PixelRadiusService) {}

    async getNumberOfDifferences(differencesArray: boolean[]): Promise<number[][]> {
        const visitedPixels: number[][] = [];
        const queue: number[] = [];
        let numberOfDifferences = 0;

        differencesArray.forEach(async (different, index) => {
            if (this.isNewAndDifferentPixel(index, differencesArray, visitedPixels)) {
                queue.push(index);
                visitedPixels.push([index]);
                numberOfDifferences++;

                const currentPos = queue.shift();
                while (queue.length !== 0) {
                    for (const adjacentPixel of await this.pixelRadiusService.getAdjacentPixels(currentPos, 1)) {
                        if (this.isNewAndDifferentPixel(adjacentPixel, differencesArray, visitedPixels)) {
                            visitedPixels[numberOfDifferences].push(adjacentPixel);
                            queue.push(adjacentPixel);
                        }
                    }
                }
            }
        });

        return visitedPixels;
    }

    isNewAndDifferentPixel(index: number, differencesArray: boolean[], visitedPixels: number[][]) {
        return differencesArray[index] && !this.isAVisitedPixel(index, visitedPixels);
    }

    findPixelDifferenceIndex(pixelIndex: number, visitedPixels: number[][]): number /* usable for the game to find which pixel was cliqued*/ {
        visitedPixels.forEach((difference, differenceIndex) => {
            if (difference.includes(pixelIndex)) return differenceIndex;
        });
        return visitedPixels.length;
    }

    isAVisitedPixel(pixelIndex: number, visitedPixels: number[][]): boolean {
        return this.findPixelDifferenceIndex(pixelIndex, visitedPixels) === visitedPixels.length;
    }
}
