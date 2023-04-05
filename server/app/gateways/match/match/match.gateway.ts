import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { MultiplayerDifferenceInformation, PlayerDifference } from '@common/difference-information';
import { GameHistoryDTO } from '@common/game-history.dto';
import { MATCH_EVENTS, ONE_SECOND } from '@common/match-gateway-communication';
import { ReplayTimerInformations } from '@common/replay-timer-informations';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    timers: Map<string, ReturnType<typeof setInterval>> = new Map<string, ReturnType<typeof setInterval>>();
    constructor(private gameManagerService: GameManagerService) {}

    @SubscribeMessage(MATCH_EVENTS.createSoloGame)
    createSoloGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        socket.data.stageId = stageId;
        this.timer(socket.id);
        this.gameManagerService.addGame(stageId, 1);
    }

    @SubscribeMessage(MATCH_EVENTS.EndTime)
    stopTimer(socket: Socket, room: string): void {
        clearInterval(this.timers.get(room));
        this.timers.delete(room);
    }

    @SubscribeMessage(MATCH_EVENTS.Win)
    win(socket: Socket, room: string): void {
        if (socket.rooms.has(room)) {
            this.server.to(room).emit(MATCH_EVENTS.Win, socket.id);
        }
    }

    @SubscribeMessage(MATCH_EVENTS.Difference)
    difference(socket: Socket, data: MultiplayerDifferenceInformation) {
        if (socket.rooms.has(data.room)) {
            const differenceInformation: PlayerDifference = {
                differencesPosition: data.differencesPosition,
                lastDifferences: data.lastDifferences,
                socket: socket.id,
            };
            this.server.to(data.room).emit(MATCH_EVENTS.Difference, differenceInformation);
        }
    }

    @SubscribeMessage(MATCH_EVENTS.Replay)
    replay(socket: Socket, replayInformations: ReplayTimerInformations): void {
        this.replayTimer(socket, replayInformations.room, replayInformations.currentTime, replayInformations.timeMultiplier);
    }

    @SubscribeMessage(MATCH_EVENTS.SoloGameInformation)
    storeSoloGameInformation(socket: Socket, data: GameHistoryDTO) {
        socket.data.soloGame = data;
        socket.data.isSolo = true;
    }

    @SubscribeMessage(MATCH_EVENTS.Time)
    updateGameTime(socket: Socket, time: number) {
        socket.data.soloGame.gameDuration = time;
    }

    timer(room: string): void {
        let timerCount = 0;
        const timer = setInterval(() => {
            timerCount++;
            this.server.to(room).emit(MATCH_EVENTS.Timer, timerCount);
        }, ONE_SECOND);
        this.timers.set(room, timer);
    }

    replayTimer(socket: Socket, room: string, timerCount: number, multiplier: number): void {
        this.stopTimer(socket, room);
        const timer = setInterval(() => {
            timerCount++;
            this.server.to(room).emit(MATCH_EVENTS.Timer, timerCount);
        }, ONE_SECOND * multiplier);
        this.timers.set(room, timer);
    }

    async handleDisconnect(socket: Socket): Promise<void> {
        if (socket.data.stageId) {
            await this.gameManagerService.endGame(socket.data.stageId);
        }
    }
}
