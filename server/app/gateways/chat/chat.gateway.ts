import { GameCardService } from '@app/services/game-card/game-card.service';
import { RoomMessage } from '@common/chat-gateway-constants';
import { CHAT_EVENTS, MESSAGE_MAX_LENGTH, Room, RoomEvent, RoomManagement } from '@common/chat-gateway-events';
import { gameHistory } from '@common/game-history';
import { RankingBoard } from '@common/ranking-board';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    private waitingRoom: Room[] = [];
    constructor(private gameCardService: GameCardService, private logger: Logger) {}

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
    async bestTime(socket: Socket, data: gameHistory) {
        if (!data.isAbandon) {
            const date = this.dateCreator();
            // const position = this.gameCardService.updateTime();
            // if (position);
            const gameCard = await this.gameCardService.getGameCardById(data.id);
            const playerRankingBoard: RankingBoard = {
                name: data.winnerName,
                time: data.gameDuration,
            };
            let position: number;
            const updatedGame = await this.gameCardService.updateGameCard(gameCard, playerRankingBoard, data.isMultiplayer);
            for (const ranking of data.isMultiplayer ? updatedGame.multiTimes : updatedGame.soloTimes) {
                if (ranking.name === data.winnerName) {
                    position = (data.isMultiplayer ? updatedGame.multiTimes : updatedGame.soloTimes).indexOf(ranking);
                }
            }
            if (position + 1 <= 3) {
                const message = `${date} - ${data.winnerName} obtient la ${position + 1} place dans les meilleurs temps du jeu ${data.gameName} en 
                ${data.gameMode}.`;
                this.server.emit(CHAT_EVENTS.RoomMessage, { socketId: CHAT_EVENTS.Event, message, event: 'abandon' } as RoomMessage);
            }
        }
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
