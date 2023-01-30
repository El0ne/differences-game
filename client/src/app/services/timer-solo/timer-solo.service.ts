import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { TIME } from './timer-solo.constants';

@Injectable({
    providedIn: 'root',
})
export class TimerSoloService {
    currTime: number = TIME.startTime;
    private subArray: Subscription[] = [];

    startTimer() {
        const timer1 = timer(TIME.zero, TIME.oneSecondInMs);

        const sub = timer1.subscribe(() => {
            this.currTime++;
        });

        this.subArray.push(sub);
    }

    stopTimer() {
        this.subArray.forEach((sub) => sub.unsubscribe());
    }
}
