import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { MultiplayerDifferenceInformation, PlayerDifference } from '@common/difference-information';
import { GameHistoryDTO } from '@common/game-history.dto';
import { LIMITED_TIME_MODE_EVENTS, MATCH_EVENTS, ONE_SECOND, SoloGameCreation } from '@common/match-gateway-communication';
import { TimerInformation } from '@common/timer-information';
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
    async createSoloGame(@ConnectedSocket() socket: Socket, @MessageBody() gameInfo: SoloGameCreation): Promise<void> {
        socket.data.stageId = gameInfo.stageId;
        socket.data.room = socket.id;
        if (gameInfo.isLimitedTimeMode) {
            await this.gameManagerService.startLimitedTimeGame(socket.data.room, 1);
            socket.emit(LIMITED_TIME_MODE_EVENTS.StartLimitedTimeGame, this.gameManagerService.giveNextStage(socket.data.room));
        } else {
            this.timer(socket.data.room);
            this.gameManagerService.addGame(gameInfo.stageId, 1);
        }
    }

    @SubscribeMessage(MATCH_EVENTS.EndTime)
    stopTimer(@ConnectedSocket() socket: Socket, @MessageBody() room: string): void {
        clearInterval(this.timers.get(room));
        this.timers.delete(room);
    }

    @SubscribeMessage(MATCH_EVENTS.Win)
    win(@ConnectedSocket() socket: Socket, @MessageBody() room: string): void {
        if (socket.rooms.has(room)) {
            this.server.to(room).emit(MATCH_EVENTS.Win, socket.id);
        }
    }

    @SubscribeMessage(MATCH_EVENTS.Difference)
    difference(@ConnectedSocket() socket: Socket, @MessageBody() data: MultiplayerDifferenceInformation): void {
        if (socket.rooms.has(data.room)) {
            const differenceInformation: PlayerDifference = {
                differencesPosition: data.differencesPosition,
                lastDifferences: data.lastDifferences,
                socket: socket.id,
            };
            this.server.to(data.room).emit(MATCH_EVENTS.Difference, differenceInformation);
        }
    }

    @SubscribeMessage(MATCH_EVENTS.Lose)
    limitedTimeLost(socket: Socket, room: string) {
        if (socket.rooms.has(room)) {
            this.server.to(room).emit(MATCH_EVENTS.Lose, 'timeExpired');
        }
    }

    @SubscribeMessage(LIMITED_TIME_MODE_EVENTS.NextStage)
    nextStage(@ConnectedSocket() socket: Socket): void {
        this.server.to(socket.data.room).emit(LIMITED_TIME_MODE_EVENTS.NewStageInformation, this.gameManagerService.giveNextStage(socket.data.room));
    }

    @SubscribeMessage(MATCH_EVENTS.SoloGameInformation)
    storeSoloGameInformation(socket: Socket, data: GameHistoryDTO) {
        data.gameDuration = Date.now();
        socket.data.soloGame = data;
        socket.data.isSolo = true;
    }

    @SubscribeMessage(LIMITED_TIME_MODE_EVENTS.StartTimer)
    startLimitedTimeTimer(socket: Socket, data: TimerInformation) {
        this.limitedTimeTimer(socket, data.room, data.time);
    }

    timer(room: string): void {
        let timerCount = 0;
        const timer = setInterval(() => {
            timerCount++;
            this.server.to(room).emit(MATCH_EVENTS.Timer, timerCount);
        }, ONE_SECOND);
        this.timers.set(room, timer);
    }

    limitedTimeTimer(socket: Socket, room: string, time: number): void {
        this.stopTimer(socket, room);
        this.server.to(room).emit(MATCH_EVENTS.LimitedTimeTimer, time);
        const timer = setInterval(() => {
            time--;
            this.server.to(room).emit(MATCH_EVENTS.LimitedTimeTimer, time);
        }, ONE_SECOND);
        this.timers.set(room, timer);
    }

    async handleDisconnect(socket: Socket): Promise<void> {
        await this.gameManagerService.endGame(socket.data.stageId);
        this.timers.delete(socket.data.room);
        this.gameManagerService.removePlayerFromLimitedTimeGame(socket.data.room);
    }
}
