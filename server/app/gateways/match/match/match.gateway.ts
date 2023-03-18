import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayDisconnect {
    constructor(private gameManagerService: GameManagerService) {}

    @SubscribeMessage('createSoloGame')
    createSoloGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        socket.data.stageId = stageId;
        this.gameManagerService.addGame(stageId, 1);
    }

    async handleDisconnect(socket: Socket): Promise<void> {
        if (socket.data.stageId) {
            await this.gameManagerService.endGame(socket.data.stageId);
        }
    }
}
