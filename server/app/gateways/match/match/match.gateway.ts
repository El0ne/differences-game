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
    eventTimers: Map<string, ReturnType<typeof setInterval>> = new Map<string, ReturnType<typeof setInterval>>();
    constructor(private gameManagerService: GameManagerService) {}

    @SubscribeMessage(MATCH_EVENTS.createSoloGame)
    createSoloGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        socket.data.stageId = stageId;
        this.timer(socket.id);
        this.gameManagerService.addGame(stageId, 1);
    }

    @SubscribeMessage(MATCH_EVENTS.leaveRoom)
    leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() room: string): void {
        socket.leave(room);
    }

    @SubscribeMessage(MATCH_EVENTS.joinReplayRoom)
    joinReplayRoom(@ConnectedSocket() socket: Socket, @MessageBody() room: string): void {
        socket.join(room);
    }

    @SubscribeMessage(MATCH_EVENTS.EndTime)
    stopTimer(socket: Socket, room: string): void {
        clearInterval(this.timers.get(room));
        clearInterval(this.eventTimers.get(room));
        this.timers.delete(room);
        this.eventTimers.delete(room);
    }

    @SubscribeMessage(MATCH_EVENTS.Win)
    win(socket: Socket, room: string): void {
        if (socket.rooms.has(room)) {
            this.server.to(room).emit(MATCH_EVENTS.Win, socket.id);
        }
    }

    @SubscribeMessage(MATCH_EVENTS.Difference)
    difference(socket: Socket, data: MultiplayerDifferenceInformation): void {
        if (socket.rooms.has(data.room)) {
            const differenceInformation: PlayerDifference = {
                differencesPosition: data.differencesPosition,
                lastDifferences: data.lastDifferences,
                socket: socket.id,
            };
            this.server.to(data.room).emit(MATCH_EVENTS.Difference, differenceInformation);
        }
    }

    @SubscribeMessage(MATCH_EVENTS.TimeModification)
    updateTimer(socket: Socket, replayInformations: ReplayTimerInformations): void {
        this.changeTimerValue(socket, replayInformations);
    }

    @SubscribeMessage(MATCH_EVENTS.SoloGameInformation)
    storeSoloGameInformation(socket: Socket, data: GameHistoryDTO): void {
        data.gameDuration = Date.now();
        socket.data.soloGame = data;
        socket.data.isSolo = true;
    }

    timer(room: string): void {
        let timerCount = 0;
        let eventTimerCount = 0;
        const timer = setInterval(() => {
            timerCount++;
            this.server.to(room).emit(MATCH_EVENTS.Timer, timerCount);
        }, ONE_SECOND);
        const eventTimer = setInterval(() => {
            eventTimerCount += 0.25;
            this.server.to(room).emit(MATCH_EVENTS.Catch, eventTimerCount);
        }, 250);
        this.timers.set(room, timer);
        this.eventTimers.set(room, eventTimer);
    }

    changeTimerValue(socket: Socket, replayInformations: ReplayTimerInformations): void {
        this.stopTimer(socket, replayInformations.room);
        this.server.to(replayInformations.room).emit(MATCH_EVENTS.Timer, Math.max(replayInformations.currentTime, 0));
        this.server.to(replayInformations.room).emit(MATCH_EVENTS.Catch, replayInformations.currentTime);
        let time = replayInformations.currentTime;
        const timer = setInterval(() => {
            replayInformations.currentTime++;
            this.server.to(replayInformations.room).emit(MATCH_EVENTS.Timer, Math.max(replayInformations.currentTime, 0));
        }, ONE_SECOND * replayInformations.timeMultiplier);
        const eventTimer = setInterval(() => {
            time += 0.25;
            this.server.to(replayInformations.room).emit(MATCH_EVENTS.Catch, time);
        }, 250);
        this.timers.set(replayInformations.room, timer);
        this.eventTimers.set(replayInformations.room, eventTimer);
    }

    async handleDisconnect(socket: Socket): Promise<void> {
        if (socket.data.stageId) {
            await this.gameManagerService.endGame(socket.data.stageId);
            this.stopTimer(socket, socket.data.room);
        }
    }
}
