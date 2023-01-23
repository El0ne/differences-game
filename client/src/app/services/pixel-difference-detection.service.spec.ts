import { TestBed } from '@angular/core/testing';

import { PixelDifferenceDetectionService } from './pixel-difference-detection.service';

describe('PixelDifferenceDetectionService', () => {
    let service: PixelDifferenceDetectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PixelDifferenceDetectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
