import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ModalDiffPageService {
    private display: BehaviorSubject<'open' | 'close'> = new BehaviorSubject<'open' | 'close'>('close');

    constructor() {}

    watch(): Observable<'open' | 'close'> {
        return this.display.asObservable();
    }

    open() {
        this.display.next('open');
    }

    close() {
        this.display.next('close');
    }
}
