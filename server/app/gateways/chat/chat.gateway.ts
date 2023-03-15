import { AbandonGame, ChatEvents, Room, RoomEvent, RoomManagement } from '@common/chat.gateway.events';
import { MultiplayerDifferenceInformation, PlayerDifference } from '@common/difference-information';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MESSAGE_MAX_LENGTH } from './chat.gateway.constants';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    private waitingRoom: Room[] = [];

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(ChatEvents.Validate)
    validate(socket: Socket, message: string): void {
        if (message && message.length < MESSAGE_MAX_LENGTH) {
            socket.emit(ChatEvents.WordValidated, { isValidated: true, originalMessage: message });
        } else {
            const error = 'Votre message ne respecte pas le bon format. Veuillez entrer un nouveau message';
            socket.emit(ChatEvents.WordValidated, { isValidated: false, originalMessage: error });
        }
    }

    @SubscribeMessage(ChatEvents.Difference)
    difference(socket: Socket, data: MultiplayerDifferenceInformation) {
        if (socket.rooms.has(data.room)) {
            const differenceInformation: PlayerDifference = {
                differencesPosition: data.differencesPosition,
                lastDifferences: data.lastDifferences,
                socket: socket.id,
            };
            this.server.to(data.room).emit(ChatEvents.Difference, differenceInformation);
        }
    }

    @SubscribeMessage(ChatEvents.Event)
    event(socket: Socket, data: RoomEvent): void {
        if (socket.rooms.has(data.room)) {
            const date = this.dateCreator();
            let dateFormatted: string;
            if (data.isMultiplayer) {
                dateFormatted = `${date} - ${data.event} par `;
            } else {
                dateFormatted = `${date} - ${data.event}.`;
            }

            this.server.to(data.room).emit(ChatEvents.RoomMessage, { socketId: socket.id, message: dateFormatted, event: 'notification' });
        }
    }

    @SubscribeMessage(ChatEvents.Win)
    win(socket: Socket, room: string): void {
        if (socket.rooms.has(room)) {
            this.server.to(room).emit(ChatEvents.Win, socket.id);
        }
    }

    @SubscribeMessage(ChatEvents.Abandon)
    abandon(socket: Socket, data: AbandonGame): void {
        if (socket.rooms.has(data.room)) {
            const date = this.dateCreator();
            const dateFormatted = `${date} - ${data.name} a abandonné la partie.`;
            this.server.to(data.room).emit(ChatEvents.Abandon, { socketId: socket.id, message: dateFormatted, event: 'abandon' });
        }
    }
    @SubscribeMessage(ChatEvents.Hint)
    hint(socket: Socket, room: string): void {
        if (socket.rooms.has(room)) {
            const date = this.dateCreator();
            const dateFormatted = `${date} - Indice utilisé.`;
            this.server.to(room).emit(ChatEvents.RoomMessage, { socketId: ChatEvents.Event, message: dateFormatted, event: 'notification' });
        }
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: RoomManagement): void {
        if (socket.rooms.has(message.room)) {
            const transformedMessage = message.message.toString();
            this.server.to(message.room).emit(ChatEvents.RoomMessage, { socketId: socket.id, message: transformedMessage, event: 'message' });
        }
    }

    handleConnection(socket: Socket): void {
        socket.emit(ChatEvents.Hello, 'Hello World!');
    }

    handleDisconnect(socket: Socket): void {
        this.server.to(socket.data.room).emit(ChatEvents.Disconnect, socket.id);
    }

    dateCreator(): string {
        const date = new Date();
        const hour = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();
        const dateFormatted = `${hour}:${minutes}:${seconds}`;
        return dateFormatted;
    }
}
