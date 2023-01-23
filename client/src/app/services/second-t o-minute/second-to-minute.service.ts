import { Injectable } from '@angular/core';

const SECONDS_IN_MINUTE = 60;
const TEN = 10;

@Injectable({
    providedIn: 'root',
})
export class SecondToMinuteService {
    convert(seconds: number): string {
        let minute = 0;
        while (seconds >= SECONDS_IN_MINUTE) {
            minute++;
            seconds -= SECONDS_IN_MINUTE;
        }
        return seconds < TEN ? `${minute}:0${seconds}` : `${minute}:${seconds}`;
    }
}
