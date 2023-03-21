import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { MATCH_EVENTS } from '@common/match-gateway-communication';
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

    stopTimer(): void {
        this.socket.send(MATCH_EVENTS.EndTime, this.socket.gameRoom);
    }

    convert(seconds: number): string {
        let minute = 0;
        while (seconds >= SECONDS_IN_MINUTE) {
            minute++;
            seconds -= SECONDS_IN_MINUTE;
        }
        return seconds < TEN ? `${minute}:0${seconds}` : `${minute}:${seconds}`;
    }
}
