import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class StageWaitingRoomGatewayGateway {
    @WebSocketServer() private server: Server;

    @SubscribeMessage('createWaitingRoom')
    handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: string): void {
        socket.emit('yo', `${socket.id} : ${data}`);
    }
}
