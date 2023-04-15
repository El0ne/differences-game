import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { MATCH_EVENTS } from '@common/match-gateway-communication';
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

    stopTimer(gameRoom: string = this.socket.gameRoom): void {
        this.socket.send(MATCH_EVENTS.EndTime, gameRoom);
    }

    convert(seconds: number): string {
        let minute = 0;
        while (seconds >= SECONDS_IN_MINUTE) {
            minute++;
            seconds -= SECONDS_IN_MINUTE;
        }
        return seconds < TEN ? `${minute}:0${seconds}` : `${minute}:${seconds}`;
    }

    restartTimer(multiplier: number, gameRoom: string, timeModification: number): void {
        const timerModification: TimerModification = {
            room: gameRoom,
            currentTime: this.currentTime + timeModification,
            timeMultiplier: multiplier,
        };
        this.socket.send(MATCH_EVENTS.Replay, timerModification);
    }
    // TODO: check with JAsper if we can remove this
    // restartTimer(multiplier: number, gameRoom: string = this.socket.gameRoom): void {
    //     const restartTimerInformations: ReplayTimerInformations = {
    //         room: gameRoom,
    //         currentTime: this.currentTime,
    //         timeMultiplier: multiplier,
    //     };
    //     this.socket.send(MATCH_EVENTS.Replay, restartTimerInformations);
    // }
}
