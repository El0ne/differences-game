import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FoundDifferenceService {
    foundDifferences: number[];
    differencesToFind: number[];

    constructor() {
        this.foundDifferences = [];
    }

    addDifferenceFound(index: number): void {
        this.foundDifferences.push(index);
    }

    clearDifferenceFound(): void {
        this.foundDifferences = [];
    }

    findPixelsFromDifference(differencePixels: number[][]): number[] {
        this.differencesToFind = [];
        for (const differenceNo of this.foundDifferences) {
            differencePixels[differenceNo] = [];
        }

        for (const difference of differencePixels) {
            if (difference.length !== 0) {
                this.differencesToFind = this.differencesToFind.concat(difference);
            }
        }

        return this.differencesToFind;
    }
}
