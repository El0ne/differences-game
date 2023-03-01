import { Injectable } from '@nestjs/common/decorators';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
@Injectable()
export class StageWaitingRoomGatewayGateway {
    @WebSocketServer() private server: Server;
    gameHosts: Map<string, string>; // <stageId, hostSocketId>

    @SubscribeMessage('test')
    handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: string): void {
        socket.emit('yo', `${socket.id} : ${data}`);
    }

    @SubscribeMessage('searchForHosts')
    searchForHosts(@ConnectedSocket() socket: Socket, @MessageBody() stagesIds: string[]): void {
        for (const room of socket.rooms) {
            socket.leave(room);
        }
        socket.join(stagesIds);
        for (const stageId of stagesIds) {
            if (this.gameHosts.has(stageId)) {
                socket.emit('gameCreated', stageId);
            }
        }
    }

    @SubscribeMessage('createHost')
    createHost(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.gameHosts.set(stageId, socket.id);
        socket.to(stageId).emit('gameCreated', stageId);
    }

    @SubscribeMessage('deleteHost')
    deleteHost(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.gameHosts.delete(stageId);
        socket.to(stageId).emit('gameDeleted', stageId);
    }

    @SubscribeMessage('joinHost')
    joinHost(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.server.allSockets[this.gameHosts.get(stageId)].emit('requestGame', socket.id);
    }
}
