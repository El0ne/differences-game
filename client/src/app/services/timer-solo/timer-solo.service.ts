import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerSoloService {
    currTime: number = -1;
    private subArray: Subscription[] = [];

    startTimer() {
        const timer1 = timer(0, 1000);

        const sub = timer1.subscribe(() => {
            this.currTime++;
        });

        this.subArray.push(sub);
    }

    stopTimer() {
        this.subArray.forEach((sub) => sub.unsubscribe());
    }
}
