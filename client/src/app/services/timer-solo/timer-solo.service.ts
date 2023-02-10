import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ONE_SEC_IN_MS, START_TIME, ZERO } from './timer-solo.constants';

@Injectable({
    providedIn: 'root',
})
export class TimerSoloService {
    currentTime: number = START_TIME;
    private subArray: Subscription[] = [];

    startTimer() {
        const timer1 = timer(ZERO, ONE_SEC_IN_MS);

        const sub = timer1.subscribe(() => {
            this.currentTime++;
        });

        this.subArray.push(sub);
    }

    stopTimer() {
        this.subArray.forEach((sub) => sub.unsubscribe());
    }
}
