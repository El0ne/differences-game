import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FoundDifferenceService {
    foundDifferences: number[];

    constructor() {
        this.foundDifferences = [];
    }

    addDifferenceFound(index: number): void {
        this.foundDifferences.push(index);
    }

    clearDifferenceFound(): void {
        this.foundDifferences = [];
    }
}
