import { AbandonGame, ChatEvents, MultiplayerRequestInformation, Room, RoomEvent, RoomManagement } from '@common/chat.gateway.events';
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
    message(_: Socket, message: string) {
        this.logger.log(`Message reçu : ${message}`);
    }

    @SubscribeMessage(ChatEvents.Validate)
    validate(socket: Socket, message: string) {
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
    check(socket: Socket, data: MultiplayerRequestInformation) {
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

    @SubscribeMessage(ChatEvents.Event)
    event(socket: Socket, data: RoomEvent) {
        if (socket.rooms.has(data.room)) {
            const date = this.dateCreator();
            let dateFormatted: string;
            if (data.multiplayer) {
                dateFormatted = `${date.hour}:${date.minutes}:${date.seconds} - ${data.event} par `;
            } else {
                dateFormatted = `${date.hour}:${date.minutes}:${date.seconds} - ${data.event}.`;
            }

            this.server.to(data.room).emit(ChatEvents.Event, { socketId: socket.id, message: dateFormatted, event: true });
        }
    }

    @SubscribeMessage(ChatEvents.Abandon)
    abandon(socket: Socket, data: AbandonGame) {
        if (socket.rooms.has(data.room)) {
            const date = this.dateCreator();
            const dateFormatted = `${date.hour}:${date.minutes}:${date.seconds} - ${data.name} a abandonné la partie.`;
            this.server.to(data.room).emit(ChatEvents.Abandon, { socketId: socket.id, message: dateFormatted, event: true });
        }
    }
    @SubscribeMessage(ChatEvents.Hint)
    hint(socket: Socket, room: string) {
        if (socket.rooms.has(room)) {
            const date = this.dateCreator();
            const dateFormatted = `${date.hour}:${date.minutes}:${date.seconds} - Indice utilisé.`;
            this.server.to(room).emit(ChatEvents.Event, { socketId: 'event', message: dateFormatted, event: true });
        }
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinRoom(socket: Socket, room: string) {
        socket.join(room);
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: RoomManagement) {
        // Seulement un membre de la salle peut envoyer un message aux autres
        if (socket.rooms.has(message.room)) {
            const transformedMessage = message.message.toString();
            this.server.to(message.room).emit(ChatEvents.RoomMessage, { socketId: socket.id, message: transformedMessage, event: false });
        }
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        // message initial
        socket.emit(ChatEvents.Hello, 'Hello World!');
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }

    dateCreator() {
        const date = new Date();
        const hour = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const seconds = date.getSeconds().toString();
        return { hour, minutes, seconds };
    }
}
