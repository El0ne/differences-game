import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FoundDifferenceService {
    foundDifferences: number[];
    constructor() {}

    addDifferenceFound(index: number) {
        this.foundDifferences.push(index);
    }
}
