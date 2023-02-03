import { Injectable } from '@nestjs/common';

@Injectable()
export class DifferencesDetectionService {
    async getNumberOfDifferences(differencesArray: boolean[]): Promise<boolean[]> {
        const visitedPixels: number[] = [];
        const queue: number[];
        let numberOfDifferences = 0;

        differencesArray.forEach(async (different, index) => {
            if (this.isNewAndDifferentPixel(index, differencesArray, visitedPixels)) {
                queue.push(index);
                visitedPixels.push(index);
                numberOfDifferences++;

                const currentPos = queue.shift();
                while (queue.length !== 0) {
                    for (const adjacentPixel of await this.adjacentPixels(currentPos)) {
                        if (this.isNewAndDifferentPixel(adjacentPixel, differencesArray, visitedPixels)) {
                            visitedPixels.push(adjacentPixel);
                            queue.push(adjacentPixel);
                        }
                    }
                }
            }
        });
    }

    async adjacentPixels(currentIndex: number): Promise<number[]> {
        return [];
    }

    isNewAndDifferentPixel(index: number, differencesArray: boolean[], visitedPixels: number[]) {
        return differencesArray[index] && !visitedPixels.includes(index);
    }
}
