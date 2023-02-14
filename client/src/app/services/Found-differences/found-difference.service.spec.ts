/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';

import { FoundDifferenceService } from './found-difference.service';

describe('FoundDifferenceService', () => {
    let service: FoundDifferenceService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FoundDifferenceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addDifferenceFound should add difference to array', () => {
        service.foundDifferences = [];
        service.addDifferenceFound(1);
        expect(service.foundDifferences).toEqual([1]);
    });

    it('clearDifferences should reset differences', () => {
        service.foundDifferences = [4, 5];
        service.clearDifferenceFound();
        expect(service.foundDifferences).toEqual([]);
    });
});
