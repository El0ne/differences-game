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
        this.logger.log(stageId);
        this.gameHosts.set(stageId, socket.id);
        socket.to(stageId).emit('gameCreated', stageId);
    }

    @SubscribeMessage('unhostGame')
    unhostGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.gameHosts.delete(stageId);
        socket.to(stageId).emit('gameDeleted', stageId);
    }

    @SubscribeMessage('joinHost')
    joinHost(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        socket.to(this.gameHosts.get(stageId)).emit('requestGame');
    }

    @SubscribeMessage('acceptOpponent')
    acceptOpponent(@ConnectedSocket() socket: Socket, @MessageBody() opponentId: string): void {
        this.clearRooms(socket);
        this.clearRooms(this.server.allSockets[opponentId]);
        socket.to(opponentId).socketsJoin(socket.id);
        socket.to(opponentId).emit('matchAccepted');
    }

    @SubscribeMessage('declineOpponent')
    declineOpponent(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        socket.to(this.gameHosts.get(stageId)).emit('matchRefused');
    }

    clearRooms(socket: Socket): void {
        for (const room of socket.rooms) {
            socket.leave(room);
        }
    }
}
