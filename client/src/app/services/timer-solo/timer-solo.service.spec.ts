/* eslint-disable @typescript-eslint/no-explicit-any */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { MATCH_EVENTS } from '@common/match-gateway-communication';
import { TEN_SECONDS } from './timer-solo.constants';
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
        mockSocketService.gameRoom = 'test';
        const sendSpy = spyOn(mockSocketService, 'send').and.callThrough();
        service.stopTimer();
        expect(sendSpy).toHaveBeenCalledWith(MATCH_EVENTS.EndTime, 'test');
    }));
});
