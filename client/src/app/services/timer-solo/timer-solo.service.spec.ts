import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TimerSoloService } from './timer-solo.service';

describe('TimerSoloService', () => {
    let service: TimerSoloService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerSoloService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should increment 10 seconds after 10 seconds properly', fakeAsync(() => {
        service.startTimer();
        tick(10000);
        discardPeriodicTasks();
        expect(service.currTime).toEqual(10);
    }));
});
