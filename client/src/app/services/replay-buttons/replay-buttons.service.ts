import { Injectable } from '@angular/core';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';

@Injectable({
    providedIn: 'root',
})
export class ReplayButtonsService {
    timeMultiplier: number = 1;

    constructor(private timerService: TimerSoloService) {}

    pauseReplay(isReplayPaused: boolean): boolean {
        isReplayPaused = !isReplayPaused;
        if (isReplayPaused) {
            this.timerService.stopTimer();
        } else {
            this.timerService.restartTimer(this.timeMultiplier, 0);
        }
        return isReplayPaused;
    }

    fastForwardReplay(multiplier: number): void {
        this.timeMultiplier = multiplier;
        this.timerService.restartTimer(this.timeMultiplier, 0);
    }
}
