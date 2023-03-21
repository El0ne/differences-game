import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ONE_SEC_IN_MS, SECONDS_IN_MINUTE, START_TIME, TEN, ZERO } from './timer-solo.constants';

@Injectable({
    providedIn: 'root',
})
export class TimerSoloService {
    currentTime: number = START_TIME;
    subArray: Subscription[] = [];

    startTimer(): void {
        this.currentTime = -1;
        const timer1 = timer(ZERO, ONE_SEC_IN_MS);

        const sub = timer1.subscribe(() => {
            this.currentTime++;
        });

        this.subArray.push(sub);
    }

    stopTimer(): void {
        this.subArray.forEach((sub) => sub.unsubscribe());
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
