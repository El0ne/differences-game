import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common/services/logger.service';
import { OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayDisconnect {
    constructor(private gameManagerService: GameManagerService, private logger: Logger) {}

    handleDisconnect(socket: Socket): void {
        if (socket.data.stageId) {
            this.gameManagerService.endGame(socket.data.stageId);
        }
    }
}
