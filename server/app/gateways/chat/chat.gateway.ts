import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { RoomMessage } from '@common/chat-gateway-constants';
import { CHAT_EVENTS, MESSAGE_MAX_LENGTH, Room, RoomEvent, RoomManagement, SECOND_CONVERTION } from '@common/chat-gateway-events';
import { GameHistoryDTO } from '@common/game-history.dto';
import { RankingBoard } from '@common/ranking-board';
import { Injectable } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    private waitingRoom: Room[] = [];
    constructor(private gameHistoryService: GameHistoryService, private gameCardService: GameCardService) {}

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

            this.server.to(data.room).emit(CHAT_EVENTS.RoomMessage, { socketId: socket.id, message: dateFormatted, event: 'event' } as RoomMessage);
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
    async bestTime(socket: Socket, data: GameHistoryDTO) {
        if (await this.gameCardService.getGameCardById(data.gameId)) {
            if (!(data.player1.hasAbandon || data.player2?.hasAbandon)) {
                const date = this.dateCreator();
                const gameCard = await this.gameCardService.getGameCardById(data.gameId);
                const winnerName = data.player1.hasWon ? data.player1.name : data.player2?.name;
                const playerRankingBoard: RankingBoard = {
                    name: winnerName,
                    time: data.gameDuration,
                };
                const updatedGame = await this.gameCardService.updateGameCard(gameCard, playerRankingBoard, data.isMultiplayer);
                const rankingList = data.isMultiplayer ? updatedGame.multiTimes : updatedGame.soloTimes;
                for (const ranking of rankingList) {
                    if (ranking.name === winnerName) {
                        const position = rankingList.indexOf(ranking) + 1;
                        if (position <= 3) {
                            const message = `${date} - ${winnerName} obtient la ${position} place dans les meilleurs temps du jeu ${data.gameName} en
                            ${data.isMultiplayer ? 'multijoueur' : 'solo'}.`;
                            this.server.emit(CHAT_EVENTS.RoomMessage, { socketId: CHAT_EVENTS.Event, message, event: 'notification' } as RoomMessage);
                        }
                    }
                }
            }
            socket.data.isSolo = false;

            this.gameHistoryService.addGameToHistory(data);
        }
    }

    handleDisconnect(socket: Socket): void {
        if (socket.data.room) {
            this.server
                .to(socket.data.room)
                .emit(CHAT_EVENTS.Abandon, { socketId: socket.id, message: this.dateCreator(), event: 'notification' } as RoomMessage);
        }
        if (socket.data.isSolo) {
            const endGameTime = Date.now();
            const startTime = socket.data.soloGame.gameDuration;
            const duration = Math.floor((endGameTime - startTime) / SECOND_CONVERTION);
            socket.data.soloGame.gameDuration = duration;
            this.bestTime(socket, socket.data.soloGame);
        }
    }

    dateCreator(): string {
        const date = new Date();
        return date.toLocaleTimeString('it-IT');
    }
}
