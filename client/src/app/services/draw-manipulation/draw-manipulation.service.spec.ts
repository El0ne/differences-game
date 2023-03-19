import { TestBed } from '@angular/core/testing';

import { DrawManipulationService } from './draw-manipulation.service';

describe('DrawManipulationService', () => {
    let service: DrawManipulationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawManipulationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
