import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TIME } from './timer-solo.constants';
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
        tick(TIME.tenSencondsInMs);
        discardPeriodicTasks();
        expect(service.currTime).toEqual(TIME.tenSeconds);
    }));
});
