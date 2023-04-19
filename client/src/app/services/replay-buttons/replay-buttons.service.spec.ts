import { TestBed } from '@angular/core/testing';

import { SocketService } from '@app/services/socket/socket.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { ReplayButtonsService } from './replay-buttons.service';

describe('ReplayButtonsService', () => {
    let service: ReplayButtonsService;
    let timerServiceSpy: jasmine.SpyObj<TimerSoloService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        timerServiceSpy = jasmine.createSpyObj('TimerSoloService', ['stopTimer', 'restartTimer']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['socketId']);
        Object.defineProperty(socketServiceSpy, 'socketId', { value: 'playerId' });
        TestBed.configureTestingModule({
            providers: [
                { provide: TimerSoloService, useValue: timerServiceSpy },
                {
                    provide: SocketService,
                    useValue: socketServiceSpy,
                },
            ],
        });
        service = TestBed.inject(ReplayButtonsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call stopTimer when calling pauseReplay if isReplayPaused parameter is false', () => {
        const isReplayPaused = false;
        const bool = service.pauseReplay(isReplayPaused);
        expect(timerServiceSpy.stopTimer).toHaveBeenCalledOnceWith();
        expect(bool).toEqual(!isReplayPaused);
    });

    it('should call restartTimer when calling pauseReplay if isReplayPaused parameter is true', () => {
        const isReplayPaused = true;
        const bool = service.pauseReplay(isReplayPaused);
        expect(timerServiceSpy.restartTimer).toHaveBeenCalledOnceWith(service.timeMultiplier, 0);
        expect(bool).toEqual(!isReplayPaused);
    });

    it('should set timeMultiplier to parameter value and restartTimer when calling fastForwardReplay', () => {
        const multiplier = 2;
        service.fastForwardReplay(multiplier);
        expect(service.timeMultiplier).toEqual(multiplier);
        expect(timerServiceSpy.restartTimer).toHaveBeenCalledOnceWith(multiplier, 0);
    });
});
