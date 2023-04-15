import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';

@Injectable({
    providedIn: 'root',
})
export class ReplayButtonsService {
    timeMultiplier: number = 1;

    constructor(private socketService: SocketService, private timerService: TimerSoloService) {}

    pauseReplay(isReplayPaused: boolean): boolean {
        isReplayPaused = !isReplayPaused;
        if (isReplayPaused) {
            this.timerService.stopTimer(this.socketService.socketId);
        } else {
            this.timerService.restartTimer(this.timeMultiplier, this.socketService.socketId, 0);
        }
        return isReplayPaused;
    }

    fastForwardReplay(multiplier: number): void {
        this.timeMultiplier = multiplier;
        this.timerService.restartTimer(this.timeMultiplier, this.socketService.socketId, 0);
    }
}
