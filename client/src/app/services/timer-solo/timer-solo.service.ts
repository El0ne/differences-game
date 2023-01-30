import { Injectable } from '@angular/core';
import { timer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerSoloService {
    currTime: number = -1;

    startTimer() {
        const value = timer(0, 1000);

        value.subscribe(() => {
            this.currTime++;
        });
    }
}
