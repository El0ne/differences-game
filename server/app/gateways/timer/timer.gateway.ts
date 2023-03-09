import { ChatEvents } from '@common/chat.gateway.events';
import { Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class TimerGateway {
    @SubscribeMessage('start timer')
    timer(socket: Socket): void {
        let timerCount = 0;
        setInterval(() => {
            timerCount++;
            socket.emit(ChatEvents.Elouan, timerCount);
        }, 1000);
    }

    // @SubscribeMessage('start timer')
    // startTimer(room: string): void {
    //     let timerCount = 0;
    //     setInterval(() => {
    //         timerCount++;
    //         this.server.to(room).emit(ChatEvents.Elouan, timerCount);
    //     }, 1000);
    // }
}
