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
        for (const differenceNumber of this.foundDifferences) {
            differencePixels[differenceNumber] = [];
        }

        for (const difference of differencePixels) {
            if (difference.length !== 0) {
                this.differencesToFind = this.differencesToFind.concat(difference);
            }
        }

        return this.differencesToFind;
    }
}
