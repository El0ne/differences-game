import JoinHostInWaitingRequest from '@common/joining-host';
import OpponentAppoval from '@common/opponent-approval';
import PlayerInformations from '@common/player-informations';
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

    @SubscribeMessage('searchForHosts')
    searchForHosts(@ConnectedSocket() socket: Socket, @MessageBody() stagesIds: string[]): void {
        this.clearRooms(socket);
        socket.join(stagesIds);
        for (const stageId of stagesIds) {
            if (this.gameHosts.has(stageId)) {
                socket.emit('gameCreated', stageId);
            }
        }
    }

    @SubscribeMessage('hostGame')
    hostGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.logger.log(`game created by ${stageId}`);
        this.gameHosts.set(stageId, socket.id);
        socket.to(stageId).emit('gameCreated', stageId);
    }

    @SubscribeMessage('unhostGame')
    unhostGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.logger.log(`game deleted by ${socket.id}`);
        this.gameHosts.delete(stageId);
        socket.to(stageId).emit('gameDeleted', stageId);
        socket.to(stageId).emit('matchRefused', 'raison');
    }

    @SubscribeMessage('joinHost')
    joinHost(@ConnectedSocket() socket: Socket, @MessageBody() joinRequest: JoinHostInWaitingRequest): void {
        this.logger.log(`game ${joinRequest.stageId} joined by ${joinRequest.playerName}`);
        const playerInformations: PlayerInformations = { playerName: joinRequest.playerName, playerSocketId: socket.id };
        socket.to(this.gameHosts.get(joinRequest.stageId)).emit('requestGame', playerInformations);
    }

    @SubscribeMessage('quitHost')
    quitHost(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.logger.log(`game ${stageId} quiited by ${socket.id}`);
        socket.to(this.gameHosts.get(stageId)).emit('unrequestGame', socket.id);
    }

    @SubscribeMessage('acceptOpponent')
    acceptOpponent(@ConnectedSocket() socket: Socket, @MessageBody() approval: OpponentAppoval): void {
        this.logger.log(`${socket.id} accepted ${approval.OpponentId}`);
        this.clearRooms(socket);
        this.clearRooms(this.server.allSockets[approval.OpponentId]);
        socket.to(approval.OpponentId).socketsJoin(socket.id);
        socket.to(approval.OpponentId).emit('matchAccepted');
        socket.to(approval.stageId).emit('matchRefused', 'raison'); // refuser match a tous les autres
        this.gameHosts.delete(approval.stageId);
    }

    @SubscribeMessage('declineOpponent')
    declineOpponent(@ConnectedSocket() socket: Socket, @MessageBody() opponentId: string): void {
        this.logger.log(`${socket.id} refused ${opponentId}`);
        socket.to(opponentId).emit('matchRefused', 'raison');
    }

    clearRooms(socket: Socket): void {
        for (const room of socket.rooms) {
            socket.leave(room);
        }
    }
}
