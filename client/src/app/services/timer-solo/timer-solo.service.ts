import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { ChatEvents } from '@common/chat.gateway.events';
import { Subscription } from 'rxjs';
import { START_TIME } from './timer-solo.constants';

@Injectable({
    providedIn: 'root',
})
export class TimerSoloService {
    currentTime: number = START_TIME;
    subArray: Subscription[] = [];

    constructor(private chat: SocketService) {}

    startTimer(): void {
        // console.log('coneected');
        this.currentTime = -1;
        // const timer1 = timer(ZERO, ONE_SEC_IN_MS);

        // const sub = timer1.subscribe(() => {
        //     this.currentTime++;
        //     console.log('this.currentTime', this.currentTime);
        // });

        // this.subArray.push(sub);

        // this.chat.connect();
        this.chat.send('start timer', this.chat.gameRoom);

        this.chat.listen<number>(ChatEvents.Elouan, (timerValue: number) => {
            console.log('timerValue', timerValue);
            this.currentTime = timerValue;
        });
    }

    stopTimer(): void {
        this.subArray.forEach((sub) => sub.unsubscribe());
    }
}
