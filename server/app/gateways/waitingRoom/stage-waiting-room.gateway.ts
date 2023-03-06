import { AcceptationInformation, JoinHostInWaitingRequest, PlayerInformations, WaitingRoomEvents } from '@common/waiting-room-socket-communication';
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
@WebSocketGateway()
@Injectable()
export class StageWaitingRoomGateway implements OnGatewayDisconnect, OnGatewayDisconnect {
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
        socket.data.stageInHosting = stageId;
        socket.to(stageId).emit(WaitingRoomEvents.GameCreated, stageId);
    }

    @SubscribeMessage(WaitingRoomEvents.UnhostGame)
    unhostGame(@ConnectedSocket() socket: Socket): void {
        this.logger.log(`game deleted by ${socket.id}`);
        this.gameHosts.delete(socket.data.stageInHosting);
        socket.to(socket.data.stageInHosting).emit(WaitingRoomEvents.MatchRefused, "la partie n'a plus d'hôte");
        socket.to(socket.data.stageInHosting).emit(WaitingRoomEvents.GameDeleted, socket.data.stageInHosting);
        socket.data.stageInHosting = undefined;
    }

    @SubscribeMessage(WaitingRoomEvents.JoinHost)
    joinHost(@ConnectedSocket() socket: Socket, @MessageBody() joinRequest: JoinHostInWaitingRequest): void {
        this.logger.log(`game ${joinRequest.stageId} joined by ${joinRequest.playerName}`);
        socket.data.stageInWaiting = joinRequest.stageId;
        const playerInformations: PlayerInformations = { playerName: joinRequest.playerName, playerSocketId: socket.id };
        socket.to(this.gameHosts.get(joinRequest.stageId)).emit(WaitingRoomEvents.RequestMatch, playerInformations);
    }

    @SubscribeMessage(WaitingRoomEvents.QuitHost)
    quitHost(@ConnectedSocket() socket: Socket): void {
        this.logger.log(`game ${socket.data.stageInWaiting} quited by ${socket.id}`);
        socket.to(this.gameHosts.get(socket.data.stageInWaiting)).emit(WaitingRoomEvents.UnrequestMatch, socket.id);
    }

    @SubscribeMessage(WaitingRoomEvents.AcceptOpponent)
    acceptOpponent(@ConnectedSocket() socket: Socket, @MessageBody() acceptation: PlayerInformations): void {
        this.logger.log(`${socket.id} accepted ${acceptation.playerSocketId}`);
        const opponentSocket: Socket = this.server.sockets.sockets.get(acceptation.playerSocketId);
        this.clearRooms(socket);
        this.clearRooms(opponentSocket);
        const roomId = randomUUID();
        socket.join(roomId);
        opponentSocket.join(roomId);
        const acceptationInfo: AcceptationInformation = { playerName: acceptation.playerName, playerSocketId: socket.id, roomId };
        socket.to(acceptation.playerSocketId).emit(WaitingRoomEvents.MatchAccepted, acceptationInfo);
        socket.emit(WaitingRoomEvents.MatchConfirmed, roomId);
        socket.to(socket.data.stageInHosting).emit(WaitingRoomEvents.MatchRefused, "l'hôte a trouvé un autre adversaire");
        socket.to(socket.data.stageInHosting).emit(WaitingRoomEvents.GameDeleted, socket.data.stageInHosting);
        this.gameHosts.delete(socket.data.stageInHosting);
    }

    @SubscribeMessage(WaitingRoomEvents.DeclineOpponent)
    declineOpponent(@ConnectedSocket() socket: Socket, @MessageBody() opponentId: string): void {
        this.logger.log(`${socket.id} refused ${opponentId}`);
        socket.to(opponentId).emit(WaitingRoomEvents.MatchRefused, "l'hôte ne souhaite pas faire une partie avec vous");
    }

    handleDisconnect(socket: Socket) {
        if (socket.data.stageInHosting) {
            this.unhostGame(socket);
        } else if (socket.data.stageInWaiting) {
            this.quitHost(socket);
        }
    }

    clearRooms(socket: Socket): void {
        // will have to change if the socket uses any other room
        for (const room of socket.rooms) {
            socket.leave(room);
        }
        socket.join(socket.id);
    }
}
