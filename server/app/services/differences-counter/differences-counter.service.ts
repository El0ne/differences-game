import { ADJACENT_PIXELS_RADIUS } from '@app/services/difference-detection/difference-detection.const';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DifferencesCounterService {
    constructor(private pixelRadiusService: PixelRadiusService) {}

    getDifferencesList(differencesArray: boolean[]): number[][] {
        const visitedPixels: number[][] = [];
        const visitedDifferences: boolean[] = new Array(differencesArray.length).fill(false);
        const queue: number[] = [];
        let numberOfDifferences = 0;

        for (const index of differencesArray.keys()) {
            if (differencesArray[index] && !visitedDifferences[index]) {
                queue.push(index);
                visitedPixels.push([index]);
                visitedDifferences[index] = true;

                while (queue.length !== 0) {
                    const currentPos = queue.shift();
                    for (const adjacentPixel of this.pixelRadiusService.getAdjacentPixels(currentPos, false, ADJACENT_PIXELS_RADIUS)) {
                        if (differencesArray[adjacentPixel] && !visitedDifferences[adjacentPixel]) {
                            visitedPixels[numberOfDifferences].push(adjacentPixel);
                            queue.push(adjacentPixel);
                            visitedDifferences[adjacentPixel] = true;
                        }
                    }
                }
                numberOfDifferences++;
            }
        }

        return visitedPixels;
    }

    findPixelDifferenceIndex(pixelIndex: number, visitedPixels: number[][]): number {
        for (const differenceIndex of visitedPixels.keys()) {
            if (visitedPixels[differenceIndex].includes(pixelIndex)) {
                return differenceIndex;
            }
        }
        return visitedPixels.length;
    }
}
