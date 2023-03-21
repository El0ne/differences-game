import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subscription } from 'rxjs';
import { SEVENTY_FIVE_SECONDS, SIXTY_SECONDS, SIXTY_SEVEN_SECONDS, TEN_SECONDS, TEN_SEC_IN_MS, TWENTY_SECONDS } from './timer-solo.constants';
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
        tick(TEN_SEC_IN_MS);
        discardPeriodicTasks();
        expect(service.currentTime).toEqual(TEN_SECONDS);
    }));

    it('stopTimer should unsubscribe from all subscriptions', fakeAsync(() => {
        const mockSubscriptions = [of('1').subscribe(), of('2').subscribe(), of('3').subscribe()];
        service.subArray = mockSubscriptions;

        service.stopTimer();

        expect(mockSubscriptions.every((sub: Subscription) => sub.closed)).toBeTrue();
    }));

    it('should be over 1 minute if there is more than 60 seconds', () => {
        expect(service.convert(SEVENTY_FIVE_SECONDS)).toEqual('1:15');
    });

    it('should be 1 minute if there is  60 seconds', () => {
        expect(service.convert(SIXTY_SECONDS)).toEqual('1:00');
    });

    it('should be 0 minute if there is less than 60 seconds', () => {
        expect(service.convert(TWENTY_SECONDS)).toEqual('0:20');
    });

    it('should have two digits even if we have less than 10 seconds', () => {
        expect(service.convert(SIXTY_SEVEN_SECONDS)).toEqual('1:07');
    });
});
