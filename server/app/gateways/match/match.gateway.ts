import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { DifferenceInformation, PlayerDifference } from '@common/difference-information';
import { GameHistoryDTO } from '@common/game-history.dto';
import { LIMITED_TIME_MODE_EVENTS, MATCH_EVENTS, ONE_SECOND_MS, SoloGameCreation } from '@common/match-gateway-communication';

import { TimerModification } from '@common/timer-modification';
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
            this.createLimitedTimeGame(socket.data.room, 1);
        } else {
            this.timer(socket.data.room);
            this.gameManagerService.addGame(gameInfo.stageId, 1);
        }
    }

    @SubscribeMessage(MATCH_EVENTS.EndTime)
    stopTimer(@ConnectedSocket() socket: Socket): void {
        clearInterval(this.timers.get(socket.data.room));
        this.timers.delete(socket.data.room);
    }

    @SubscribeMessage(MATCH_EVENTS.Win)
    win(@ConnectedSocket() socket: Socket): void {
        this.server.to(socket.data.room).emit(MATCH_EVENTS.Win, socket.id);
    }

    @SubscribeMessage(MATCH_EVENTS.Difference)
    difference(@ConnectedSocket() socket: Socket, @MessageBody() data: DifferenceInformation): void {
        const differenceInformation: PlayerDifference = {
            differencesPosition: data.differencesPosition,
            lastDifferences: data.lastDifferences,
            socket: socket.id,
        };
        this.server.to(socket.data.room).emit(MATCH_EVENTS.Difference, differenceInformation);
    }

    @SubscribeMessage(MATCH_EVENTS.Lose)
    limitedTimeLost(@ConnectedSocket() socket: Socket): void {
        this.server.to(socket.data.room).emit(MATCH_EVENTS.Lose, 'timeExpired');
    }

    @SubscribeMessage(LIMITED_TIME_MODE_EVENTS.NextStage)
    nextStage(@ConnectedSocket() socket: Socket): void {
        this.server.to(socket.data.room).emit(LIMITED_TIME_MODE_EVENTS.NewStageInformation, this.gameManagerService.giveNextStage(socket.data.room));
    }

    @SubscribeMessage(MATCH_EVENTS.SoloGameInformation)
    storeSoloGameInformation(@ConnectedSocket() socket: Socket, @MessageBody() data: GameHistoryDTO): void {
        data.gameDuration = Date.now();
        socket.data.soloGame = data;
        socket.data.isSolo = true;
    }

    @SubscribeMessage(LIMITED_TIME_MODE_EVENTS.Timer)
    startLimitedTimeTimer(@ConnectedSocket() socket: Socket, @MessageBody() time: number): void {
        this.stopTimer(socket);
        this.server.to(socket.data.room).emit(MATCH_EVENTS.LimitedTimeTimer, time);
        const timer = setInterval(() => {
            time--;
            this.server.to(socket.data.room).emit(MATCH_EVENTS.LimitedTimeTimer, time);
        }, ONE_SECOND_MS);
        this.timers.set(socket.data.room, timer);
    }

    @SubscribeMessage(LIMITED_TIME_MODE_EVENTS.TimeModification)
    modifiyTime(@ConnectedSocket() socket: Socket, @MessageBody() data: TimerModification): void {
        this.changeTimeValue(socket, data);
    }

    changeTimeValue(socket: Socket, data: TimerModification): void {
        this.stopTimer(socket);
        this.server.to(socket.data.room).emit(MATCH_EVENTS.Timer, data.currentTime);
        const timer = setInterval(() => {
            data.currentTime++;
            this.server.to(socket.data.room).emit(MATCH_EVENTS.Timer, data.currentTime);
        }, ONE_SECOND_MS);
        this.timers.set(socket.data.room, timer);
    }

    timer(room: string): void {
        let timerCount = 0;
        const timer = setInterval(() => {
            timerCount++;
            this.server.to(room).emit(MATCH_EVENTS.Timer, timerCount);
        }, ONE_SECOND_MS);
        this.timers.set(room, timer);
    }

    async createLimitedTimeGame(room: string, numberOfPlayers: number): Promise<void> {
        if (await this.gameManagerService.startLimitedTimeGame(room, numberOfPlayers)) {
            this.server.to(room).emit(LIMITED_TIME_MODE_EVENTS.StartLimitedTimeGame, this.gameManagerService.giveNextStage(room));
        } else {
            this.server.to(room).emit(LIMITED_TIME_MODE_EVENTS.AbortLimitedTimeGame);
        }
    }

    async handleDisconnect(socket: Socket): Promise<void> {
        await this.gameManagerService.endGame(socket.data.stageId);
        this.timers.delete(socket.data.room);
        this.gameManagerService.removePlayerFromLimitedTimeGame(socket.data.room);
    }
}
