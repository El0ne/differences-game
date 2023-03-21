import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { MATCH_EVENTS, ONE_SECOND } from '@common/match-gateway-communication';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    timers: Map<string, ReturnType<typeof setTimeout>> = new Map<string, ReturnType<typeof setTimeout>>();
    constructor(private gameManagerService: GameManagerService) {}

    @SubscribeMessage(MATCH_EVENTS.createSoloGame)
    createSoloGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        socket.data.stageId = stageId;
        this.timer(socket.id);
        this.gameManagerService.addGame(stageId, 1);
    }

    @SubscribeMessage(MATCH_EVENTS.EndTime)
    stopTimer(socket: Socket, room: string): void {
        clearTimeout(this.timers.get(room));
        this.timers.delete(room);
    }

    timer(room: string): void {
        let timerCount = 0;
        const timer = setInterval(() => {
            timerCount++;
            this.server.to(room).emit(MATCH_EVENTS.Timer, timerCount);
        }, ONE_SECOND);
        this.timers.set(room, timer);
    }

    async handleDisconnect(socket: Socket): Promise<void> {
        if (socket.data.stageId) {
            await this.gameManagerService.endGame(socket.data.stageId);
        }
    }
}
