import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { ChatEvents } from '@common/chat.gateway.events';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerSoloService {
    currentTime: number = 0;
    subArray: Subscription[] = [];

    constructor(private chat: SocketService) {}

    startTimer(): void {
        this.chat.send('start timer', this.chat.gameRoom);
        this.chat.listen<number>(ChatEvents.Elouan, (timerValue: number) => {
            this.currentTime = timerValue;
        });
    }

    stopTimer(): void {
        this.subArray.forEach((sub) => sub.unsubscribe());
    }
}
