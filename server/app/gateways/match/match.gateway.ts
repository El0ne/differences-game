import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { DifferenceInformation, PlayerDifference } from '@common/difference-information';
import { GameHistoryDTO } from '@common/game-history.dto';
import {
    EVENT_TIMER_INCREMENT,
    EVENT_TIMER_INTERVAL,
    LIMITED_TIME_MODE_EVENTS,
    MATCH_EVENTS,
    ONE_SECOND_MS,
    SoloGameCreation,
} from '@common/match-gateway-communication';

import { TimerModification } from '@common/timer-modification';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    timers: Map<string, ReturnType<typeof setInterval>> = new Map<string, ReturnType<typeof setInterval>>();
    eventTimers: Map<string, ReturnType<typeof setInterval>> = new Map<string, ReturnType<typeof setInterval>>();
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

    @SubscribeMessage(MATCH_EVENTS.leaveAndJoinReplayRoom)
    leaveAndJoinReplayRoom(@ConnectedSocket() socket: Socket): void {
        socket.leave(socket.data.room);
        socket.data.room = socket.id;
        socket.join(socket.data.room);
    }

    @SubscribeMessage(MATCH_EVENTS.EndTime)
    stopTimer(@ConnectedSocket() socket: Socket): void {
        clearInterval(this.timers.get(socket.data.room));
        clearInterval(this.eventTimers.get(socket.data.room));
        this.timers.delete(socket.data.room);
        this.eventTimers.delete(socket.data.room);
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

    @SubscribeMessage(MATCH_EVENTS.TimeModification)
    updateTimer(socket: Socket, timerModification: TimerModification): void {
        this.changeTimerValue(socket, timerModification);
    }

    @SubscribeMessage(MATCH_EVENTS.Lose)
    limitedTimeLost(@ConnectedSocket() socket: Socket): void {
        this.server.to(socket.data.room).emit(MATCH_EVENTS.Lose, 'timeExpired');
    }

    @SubscribeMessage(LIMITED_TIME_MODE_EVENTS.NextStage)
    nextStage(@ConnectedSocket() socket: Socket): void {
        const nextStage = this.gameManagerService.giveNextStage(socket.data.room);
        if (!nextStage) {
            socket.emit(LIMITED_TIME_MODE_EVENTS.EndGame);
        }
        this.server.to(socket.data.room).emit(LIMITED_TIME_MODE_EVENTS.NewStageInformation, nextStage);
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
        if (!socket.data.time) {
            socket.data.time = true;
        }
        this.timers.set(socket.data.room, timer);
    }

    @SubscribeMessage(LIMITED_TIME_MODE_EVENTS.StoreLimitedGameInfo)
    storeGameHistoryDtoAfterOpponentAbandon(socket: Socket, data: GameHistoryDTO): void {
        socket.data.limitedHistory = data;
        socket.data.isLimitedSolo = true;
    }

    changeTimerValue(socket: Socket, timerModification: TimerModification): void {
        this.stopTimer(socket);
        this.server.to(socket.data.room).emit(MATCH_EVENTS.Timer, Math.max(timerModification.currentTime, 0));
        this.server.to(socket.data.room).emit(MATCH_EVENTS.Catch, timerModification.currentTime);
        let time = timerModification.currentTime;
        const timer = setInterval(() => {
            timerModification.currentTime++;
            this.server.to(socket.data.room).emit(MATCH_EVENTS.Timer, Math.max(timerModification.currentTime, 0));
        }, ONE_SECOND_MS * timerModification.timeMultiplier);
        const eventTimer = setInterval(() => {
            time += EVENT_TIMER_INCREMENT;
            this.server.to(socket.data.room).emit(MATCH_EVENTS.Catch, time);
        }, EVENT_TIMER_INTERVAL * timerModification.timeMultiplier);
        this.timers.set(socket.data.room, timer);
        this.eventTimers.set(socket.data.room, eventTimer);
    }

    timer(room: string): void {
        let timerCount = 0;
        let eventTimerCount = 0;

        const timer = setInterval(() => {
            timerCount++;
            this.server.to(room).emit(MATCH_EVENTS.Timer, timerCount);
        }, ONE_SECOND_MS);
        const eventTimer = setInterval(() => {
            eventTimerCount += EVENT_TIMER_INCREMENT;
            this.server.to(room).emit(MATCH_EVENTS.Catch, eventTimerCount);
        }, EVENT_TIMER_INTERVAL);
        this.timers.set(room, timer);
        this.eventTimers.set(room, eventTimer);
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
        if (!socket.data.time) {
            this.timers.delete(socket.data.room);
        }
        this.gameManagerService.removePlayerFromLimitedTimeGame(socket.data.room);
    }
}
