import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { Injectable } from '@nestjs/common';
import { OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayDisconnect {
    constructor(private gameManagerService: GameManagerService) {}

    handleDisconnect(socket: Socket): void {
        if (socket.data.stageId) {
            this.gameManagerService.endGame(socket.data.stageId);
        }
    }
}
