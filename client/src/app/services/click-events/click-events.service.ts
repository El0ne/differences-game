import { Injectable } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root',
})
export class ClickEventsService {
    isDifference: boolean = false;

    differenceCheck() {
        Observable.fromEvent(document.body, 'mousemove').subscribe((e) => {
            console.log(e.pageX, e.pageY);
        });
    }
}
