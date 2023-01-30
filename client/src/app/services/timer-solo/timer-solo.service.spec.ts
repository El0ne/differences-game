import { TestBed } from '@angular/core/testing';

import { TimerSoloService } from '../../timer-solo.service';

describe('TimerSoloService', () => {
    let service: TimerSoloService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerSoloService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
