import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { LIMITED_TIME_MODE_EVENTS, MATCH_EVENTS } from '@common/match-gateway-communication';
import { TimerModification } from '@common/timer-modification';
import { Subscription } from 'rxjs';
import { SECONDS_IN_MINUTE, TEN } from './timer-solo.constants';

@Injectable({
    providedIn: 'root',
})
export class TimerSoloService {
    currentTime: number = 0;
    subArray: Subscription[] = [];

    constructor(private socket: SocketService) {}

    startTimer(): void {
        this.socket.listen<number>(MATCH_EVENTS.Timer, (timerValue: number) => {
            this.currentTime = timerValue;
        });
    }

    limitedTimeTimer(): void {
        this.socket.listen<number>(MATCH_EVENTS.LimitedTimeTimer, (timerValue: number) => {
            if (timerValue === 0) {
                this.stopTimer();
                this.socket.send(MATCH_EVENTS.Lose);
            }
            this.currentTime = timerValue;
        });
    }

    stopTimer(): void {
        this.socket.send(MATCH_EVENTS.EndTime);
    }

    convert(seconds: number): string {
        let minute = 0;
        while (seconds >= SECONDS_IN_MINUTE) {
            minute++;
            seconds -= SECONDS_IN_MINUTE;
        }
        return seconds < TEN ? `${minute}:0${seconds}` : `${minute}:${seconds}`;
    }

    restartTimer(multiplier: number, timeModification: number): void {
        const timerModification: TimerModification = {
            currentTime: this.currentTime + timeModification,
            timeMultiplier: multiplier,
        };
        this.socket.send(LIMITED_TIME_MODE_EVENTS.TimeModification, timerModification);
    }
}
