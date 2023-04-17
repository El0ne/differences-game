/* eslint-disable @typescript-eslint/no-explicit-any */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { MATCH_EVENTS } from '@common/match-gateway-communication';
import { SEVENTY_FIVE_SECONDS, SIXTY_SECONDS, SIXTY_SEVEN_SECONDS, TEN_SECONDS, TWENTY_SECONDS } from './timer-solo.constants';
import { TimerSoloService } from './timer-solo.service';

describe('TimerSoloService', () => {
    let service: TimerSoloService;
    let mockSocketService: SocketService;

    beforeEach(() => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['listen', 'send']);
        TestBed.configureTestingModule({ providers: [{ provide: SocketService, useValue: mockSocketService }] });
        service = TestBed.inject(TimerSoloService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should increment 10 seconds after 10 seconds properly', fakeAsync(() => {
        mockSocketService.listen = (event: string, callback: any) => {
            if (event === MATCH_EVENTS.Timer) callback(TEN_SECONDS);
        };
        service.startTimer();
        expect(service.currentTime).toEqual(TEN_SECONDS);
    }));

    it('stopTimer should send a stop timer event', fakeAsync(() => {
        mockSocketService.send = () => {
            return;
        };
        const sendSpy = spyOn(mockSocketService, 'send').and.callThrough();
        service.stopTimer();
        expect(sendSpy).toHaveBeenCalledWith(MATCH_EVENTS.EndTime);
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

    it('limitedTimeTimer should stop timer if it reaches 0 and set time value', () => {
        mockSocketService.send = () => {
            return;
        };
        const stopSpy = spyOn(service, 'stopTimer');
        const sendSpy = spyOn(mockSocketService, 'send').and.callThrough();
        mockSocketService.listen = (event: string, callback: any) => {
            if (event === MATCH_EVENTS.LimitedTimeTimer) callback(0);
        };
        service.limitedTimeTimer();
        expect(stopSpy).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalledWith(MATCH_EVENTS.Lose);
        expect(service.currentTime).toEqual(0);
    });
});
