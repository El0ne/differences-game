import { AbandonGame, ChatEvents, MultiplayerRequestInformation, Room, RoomEvent, RoomManagement } from '@common/chat.gateway.events';
import { differenceInformation } from '@common/difference-information';
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

    @SubscribeMessage(ChatEvents.Message)
    message(_: Socket, message: string): void {
        this.logger.log(`Message reçu : ${message}`);
    }

    @SubscribeMessage(ChatEvents.Validate)
    validate(socket: Socket, message: string): void {
        if (message && message.length < MESSAGE_MAX_LENGTH) {
            socket.emit(ChatEvents.WordValidated, { validated: true, originalMessage: message });
        } else {
            const error = 'Votre message ne respecte pas le bon format. Veuillez entrer un nouveau message';
            socket.emit(ChatEvents.WordValidated, { validated: false, originalMessage: error });
        }
    }

    // temporary function in order to test chat functionality.
    // it will be removed when time for integration (no use to test in this scenario)
    @SubscribeMessage(ChatEvents.RoomCheck)
    check(socket: Socket, data: MultiplayerRequestInformation): void {
        for (const room of this.waitingRoom) {
            if (room.gameId === data.game) {
                socket.join(room.roomId);
                const index = this.waitingRoom.indexOf(room);
                this.waitingRoom.splice(index, 1);
                this.logger.log(room.awaitingPlayer, data.name);
                this.server.to(room.roomId).emit(ChatEvents.PlayerWaiting, { room: room.roomId, adversary: room.awaitingPlayer, player: data.name });
                return;
            }
        }
        this.waitingRoom.push({ roomId: socket.id, gameId: data.game, awaitingPlayer: data.name });
        socket.emit(ChatEvents.WaitingRoom);
    }

    @SubscribeMessage(ChatEvents.Difference)
    difference(socket: Socket, data: differenceInformation) {
        if (socket.rooms.has(data.room)) {
            this.server.to(data.room).emit(ChatEvents.Difference, { differenceInformation: data, socket: socket.id });
        }
    }

    @SubscribeMessage(ChatEvents.Event)
    event(socket: Socket, data: RoomEvent): void {
        if (socket.rooms.has(data.room)) {
            const date = this.dateCreator();
            let dateFormatted: string;
            if (data.multiplayer) {
                dateFormatted = `${date} - ${data.event} par `;
            } else {
                dateFormatted = `${date} - ${data.event}.`;
            }

            this.server.to(data.room).emit(ChatEvents.RoomMessage, { socketId: socket.id, message: dateFormatted, event: true });
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
            this.server.to(data.room).emit(ChatEvents.Abandon, { socketId: socket.id, message: dateFormatted, event: true });
        }
    }
    @SubscribeMessage(ChatEvents.Hint)
    hint(socket: Socket, room: string): void {
        if (socket.rooms.has(room)) {
            const date = this.dateCreator();
            const dateFormatted = `${date} - Indice utilisé.`;
            this.server.to(room).emit(ChatEvents.RoomMessage, { socketId: 'event', message: dateFormatted, event: true });
        }
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string): void {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinRoom(socket: Socket, room: string): void {
        socket.join(room);
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: RoomManagement): void {
        // Seulement un membre de la salle peut envoyer un message aux autres
        if (socket.rooms.has(message.room)) {
            const transformedMessage = message.message.toString();
            this.server.to(message.room).emit(ChatEvents.RoomMessage, { socketId: socket.id, message: transformedMessage, event: false });
        }
    }

    handleConnection(socket: Socket): void {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        // message initial
        socket.emit(ChatEvents.Hello, 'Hello World!');
    }

    handleDisconnect(socket: Socket): void {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
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
