import { MatchGateway } from '@app/gateways/match/match/match.gateway';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { AcceptationInformation, JoinHostInWaitingRequest, PlayerInformations, WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';
import { Injectable } from '@nestjs/common/decorators';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
@Injectable()
export class StageWaitingRoomGateway implements OnGatewayDisconnect, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    gameHosts: Map<string, string> = new Map<string, string>();

    constructor(private gameManagerService: GameManagerService, private gameCardService: GameCardService, private matchGateway: MatchGateway) {}

    @SubscribeMessage(WAITING_ROOM_EVENTS.ScanForHost)
    scanForHosts(@ConnectedSocket() socket: Socket, @MessageBody() stagesIds: string[]): void {
        this.clearRooms(socket);
        socket.join(stagesIds);
        for (const stageId of stagesIds) {
            if (this.gameHosts.has(stageId)) {
                socket.emit(WAITING_ROOM_EVENTS.MatchCreated, stageId);
            }
        }
    }

    @SubscribeMessage(WAITING_ROOM_EVENTS.HostGame)
    hostGame(@ConnectedSocket() socket: Socket, @MessageBody() stageId: string): void {
        this.gameHosts.set(stageId, socket.id);
        socket.data.stageInHosting = stageId;
        socket.to(stageId).emit(WAITING_ROOM_EVENTS.MatchCreated, stageId);
    }

    @SubscribeMessage(WAITING_ROOM_EVENTS.UnhostGame)
    unhostGame(@ConnectedSocket() socket: Socket): void {
        this.gameHosts.delete(socket.data.stageInHosting);
        socket.to(socket.data.stageInHosting).emit(WAITING_ROOM_EVENTS.MatchRefused, "la partie n'a plus d'hôte");
        socket.to(socket.data.stageInHosting).emit(WAITING_ROOM_EVENTS.MatchDeleted, socket.data.stageInHosting);
        socket.data.stageInHosting = null;
    }

    @SubscribeMessage(WAITING_ROOM_EVENTS.JoinHost)
    joinHost(@ConnectedSocket() socket: Socket, @MessageBody() joinRequest: JoinHostInWaitingRequest): void {
        socket.data.stageInWaiting = joinRequest.stageId;
        const playerInformations: PlayerInformations = { playerName: joinRequest.playerName, playerSocketId: socket.id };
        socket.to(this.gameHosts.get(joinRequest.stageId)).emit(WAITING_ROOM_EVENTS.RequestMatch, playerInformations);
    }

    @SubscribeMessage(WAITING_ROOM_EVENTS.QuitHost)
    quitHost(@ConnectedSocket() socket: Socket): void {
        socket.to(this.gameHosts.get(socket.data.stageInWaiting)).emit(WAITING_ROOM_EVENTS.UnrequestMatch, socket.id);
        socket.data.stageInWaiting = null;
    }

    @SubscribeMessage(WAITING_ROOM_EVENTS.AcceptOpponent)
    acceptOpponent(@ConnectedSocket() socket: Socket, @MessageBody() acceptation: PlayerInformations): void {
        const opponentSocket: Socket = this.server.sockets.sockets.get(acceptation.playerSocketId);
        this.clearRooms(socket);
        this.clearRooms(opponentSocket);
        const roomId = randomUUID();
        socket.join(roomId);
        socket.data.room = roomId;
        socket.data.stageId = socket.data.stageInHosting;
        opponentSocket.join(roomId);
        opponentSocket.data.room = roomId;
        opponentSocket.data.stageId = socket.data.stageInHosting;
        this.matchGateway.timer(roomId);
        this.gameHosts.delete(socket.data.stageInHosting);
        this.gameManagerService.addGame(socket.data.stageInHosting, 2);

        const acceptationInfo: AcceptationInformation = { playerName: acceptation.playerName, playerSocketId: socket.id, roomId };
        socket.to(acceptation.playerSocketId).emit(WAITING_ROOM_EVENTS.MatchAccepted, acceptationInfo);
        socket.emit(WAITING_ROOM_EVENTS.MatchConfirmed, roomId);
        socket.to(socket.data.stageInHosting).emit(WAITING_ROOM_EVENTS.MatchRefused, "l'hôte a trouvé un autre adversaire");
        socket.to(socket.data.stageInHosting).emit(WAITING_ROOM_EVENTS.MatchDeleted, socket.data.stageInHosting);

        socket.data.stageInHosting = null;
        opponentSocket.data.stageInWaiting = null;
    }

    @SubscribeMessage(WAITING_ROOM_EVENTS.DeclineOpponent)
    declineOpponent(@ConnectedSocket() socket: Socket, @MessageBody() opponentId: string): void {
        socket.to(opponentId).emit(WAITING_ROOM_EVENTS.MatchRefused, "l'hôte ne souhaite pas faire une partie avec vous");
    }

    @SubscribeMessage(WAITING_ROOM_EVENTS.DeleteGame)
    async deleteGame(@MessageBody() stageId: string): Promise<void> {
        await this.gameCardService.deleteGameCard(stageId);
        await this.gameManagerService.deleteGame(stageId);

        this.gameHosts.delete(stageId);

        this.server.to(stageId).emit(WAITING_ROOM_EVENTS.GameDeleted);
        this.server.to(stageId).emit(WAITING_ROOM_EVENTS.MatchRefused, "La fiche n'est plus disponible pour jouer");
    }

    handleDisconnect(socket: Socket) {
        if (socket.data.stageInHosting) {
            this.unhostGame(socket);
        } else if (socket.data.stageInWaiting) {
            this.quitHost(socket);
        }
    }

    private clearRooms(socket: Socket): void {
        for (const room of socket.rooms) {
            socket.leave(room);
        }
        socket.join(socket.id);
    }
}
