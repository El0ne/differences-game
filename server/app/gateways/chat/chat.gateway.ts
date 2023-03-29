import { GameHistoryService } from '@app/services/game-history/game-history/game-history.service';
import { RoomMessage } from '@common/chat-gateway-constants';
import { CHAT_EVENTS, MESSAGE_MAX_LENGTH, Room, RoomEvent, RoomManagement } from '@common/chat-gateway-events';
import { GameHistoryDTO } from '@common/game-history.dto';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    private waitingRoom: Room[] = [];
    constructor(private gameHistoryService: GameHistoryService, private logger: Logger) {}

    @SubscribeMessage(CHAT_EVENTS.Validate)
    validate(socket: Socket, message: string): void {
        if (message && message.length < MESSAGE_MAX_LENGTH) {
            socket.emit(CHAT_EVENTS.WordValidated, { isValidated: true, originalMessage: message });
        } else {
            const error = 'Votre message ne respecte pas le bon format. Veuillez entrer un nouveau message';
            socket.emit(CHAT_EVENTS.WordValidated, { isValidated: false, originalMessage: error });
        }
    }

    @SubscribeMessage(CHAT_EVENTS.Event)
    event(socket: Socket, data: RoomEvent): void {
        if (socket.rooms.has(data.room)) {
            const date = this.dateCreator();
            let dateFormatted: string;
            if (data.isMultiplayer) {
                dateFormatted = `${date} - ${data.event} par `;
            } else {
                dateFormatted = `${date} - ${data.event}.`;
            }

            this.server
                .to(data.room)
                .emit(CHAT_EVENTS.RoomMessage, { socketId: socket.id, message: dateFormatted, event: 'notification' } as RoomMessage);
        }
    }

    @SubscribeMessage(CHAT_EVENTS.Hint)
    hint(socket: Socket, room: string): void {
        if (socket.rooms.has(room)) {
            const date = this.dateCreator();
            const dateFormatted = `${date} - Indice utilisé.`;
            this.server
                .to(room)
                .emit(CHAT_EVENTS.RoomMessage, { socketId: CHAT_EVENTS.Event, message: dateFormatted, event: 'abandon' } as RoomMessage);
        }
    }

    @SubscribeMessage(CHAT_EVENTS.RoomMessage)
    roomMessage(socket: Socket, message: RoomManagement): void {
        if (socket.rooms.has(message.room)) {
            const transformedMessage = message.message.toString();
            this.server
                .to(message.room)
                .emit(CHAT_EVENTS.RoomMessage, { socketId: socket.id, message: transformedMessage, event: 'message' } as RoomMessage);
        }
    }

    @SubscribeMessage(CHAT_EVENTS.BestTime)
    bestTime(socket: Socket, data: GameHistoryDTO) {
        this.logger.log('ergerg');
        if (!data.isAbandon) {
            const date = this.dateCreator();
            // const position = this.gameCardService.updateTime();
            // if (position);
            const message = `${date} - ${data.winnerName} obtient la ${data.gameDuration} place dans les meilleurs temps du jeu ${data.gameName} en
            ${data.gameMode}.`;
            this.server.emit(CHAT_EVENTS.RoomMessage, { socketId: CHAT_EVENTS.Event, message, event: 'abandon' } as RoomMessage);
        }
        this.gameHistoryService.addGameToHistory(data);
    }

    handleDisconnect(socket: Socket): void {
        if (socket.data.room)
            this.server
                .to(socket.data.room)
                .emit(CHAT_EVENTS.Abandon, { socketId: socket.id, message: this.dateCreator(), event: 'abandon' } as RoomMessage);
    }

    dateCreator(): string {
        const date = new Date();
        return date.toLocaleTimeString('it-IT');
    }
}
