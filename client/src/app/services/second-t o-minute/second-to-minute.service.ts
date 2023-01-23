import { Injectable } from '@angular/core';
import { SECONDS_IN_MINUTE, TEN } from './second-constants';

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
