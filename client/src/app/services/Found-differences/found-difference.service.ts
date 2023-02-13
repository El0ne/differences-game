import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FoundDifferenceService {
    foundDifferences: number[];

    constructor() {
        this.foundDifferences = [];
    }

    addDifferenceFound(index: number) {
        this.foundDifferences.push(index);
    }
}
