import { JoinHostInWaitingRequest, OpponentAppoval, PlayerInformations, WaitingRoomEvents } from '@common/waiting-room-socket-communication';
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway()
@Injectable()
export class StageWaitingRoomGatewayGateway {
    @WebSocketServer() private server: Server;
    gameHosts: Map<string, string> = new Map<string, string>(); // <stageId, hostSocketId>

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(WaitingRoomEvents.ScanForHost)
    searchForHosts(@ConnectedSocket() socket: Socket, @MessageBody() stagesIds: string[]): void {
        this.clearRooms(socket);
        socket.join(stagesIds);
        for (const stageId of stagesIds) {
            if (this.gameHosts.has(stageId)) {
                socket.emit(WaitingRoomEvents.GameCreated, stageId);
            }
        }
    }

    @SubscribeMessage(WaitingRoomEvents.HostGame)
    hostGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.logger.log(`game created by ${socket.id}`);
        this.gameHosts.set(stageId, socket.id);
        socket.to(stageId).emit(WaitingRoomEvents.GameCreated, stageId);
    }

    @SubscribeMessage(WaitingRoomEvents.UnhostGame)
    unhostGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.logger.log(`game deleted by ${socket.id}`);
        this.gameHosts.delete(stageId);
        socket.to(stageId).emit(WaitingRoomEvents.GameDeleted, stageId);
        socket.to(stageId).emit(WaitingRoomEvents.MatchRefused, 'raison');
    }

    @SubscribeMessage(WaitingRoomEvents.JoinHost)
    joinHost(@ConnectedSocket() socket: Socket, @MessageBody() joinRequest: JoinHostInWaitingRequest): void {
        this.logger.log(`game ${joinRequest.stageId} joined by ${joinRequest.playerName}`);
        const playerInformations: PlayerInformations = { playerName: joinRequest.playerName, playerSocketId: socket.id };
        this.logger.log(this.gameHosts.get(joinRequest.stageId));
        socket.to(this.gameHosts.get(joinRequest.stageId)).emit(WaitingRoomEvents.RequestMatch, playerInformations);
    }

    @SubscribeMessage(WaitingRoomEvents.QuitHost)
    quitHost(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.logger.log(`game ${stageId} quited by ${socket.id}`);
        socket.to(this.gameHosts.get(stageId)).emit(WaitingRoomEvents.UnrequestMatch, socket.id);
    }

    @SubscribeMessage(WaitingRoomEvents.AcceptOpponent)
    acceptOpponent(@ConnectedSocket() socket: Socket, @MessageBody() approval: OpponentAppoval): void {
        this.logger.log(`${socket.id} accepted ${approval.OpponentId}`);
        this.clearRooms(socket);
        this.clearRooms(this.server.allSockets[approval.OpponentId]);
        socket.to(approval.OpponentId).socketsJoin(socket.id);
        socket.to(approval.OpponentId).emit(WaitingRoomEvents.MatchAccepted);
        socket.to(approval.stageId).emit(WaitingRoomEvents.MatchRefused, 'raison'); // refuser match a tous les autres
        this.gameHosts.delete(approval.stageId);
    }

    @SubscribeMessage(WaitingRoomEvents.DeclineOpponent)
    declineOpponent(@ConnectedSocket() socket: Socket, @MessageBody() opponentId: string): void {
        this.logger.log(`${socket.id} refused ${opponentId}`);
        socket.to(opponentId).emit(WaitingRoomEvents.MatchRefused, 'raison');
    }

    clearRooms(socket: Socket): void {
        for (const room of socket.rooms) {
            socket.leave(room);
        }
        socket.join(socket.id);
    }
}
