import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import {
    AcceptOpponentInformation,
    AcceptationInformation,
    PlayerInformations,
    WAITING_ROOM_EVENTS,
} from '@common/waiting-room-socket-communication';

export interface WaitingRoomDataPassing {
    stageId: string;
    isHost: boolean;
    isLimitedTimeMode: boolean;
}

@Component({
    selector: 'app-host-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
    clientsInWaitingRoom: Map<string, string> = new Map<string, string>();
    waitingRoomInfo: WaitingRoomDataPassing;

    // reason: need all parameters
    // eslint-disable-next-line max-params
    constructor(
        private dialogRef: MatDialogRef<WaitingRoomComponent>,
        private router: Router,
        private socket: SocketService,
        @Inject(MAT_DIALOG_DATA) data: WaitingRoomDataPassing,
    ) {
        this.waitingRoomInfo = data;
    }

    ngOnInit(): void {
        if (this.waitingRoomInfo.isHost) {
            this.socket.listen<PlayerInformations>(WAITING_ROOM_EVENTS.RequestMatch, (opponentInformations: PlayerInformations) => {
                this.clientsInWaitingRoom.set(opponentInformations.playerSocketId, opponentInformations.playerName);
                if (this.waitingRoomInfo.isLimitedTimeMode) {
                    this.acceptOpponent(opponentInformations.playerSocketId);
                }
            });

            this.socket.listen(WAITING_ROOM_EVENTS.UnrequestMatch, (opponentId: string) => {
                this.clientsInWaitingRoom.delete(opponentId);
            });

            this.socket.listen(WAITING_ROOM_EVENTS.MatchConfirmed, (roomId: string) => {
                this.navigateToMultiplayer(roomId);
            });
        } else {
            this.socket.listen<AcceptationInformation>(WAITING_ROOM_EVENTS.MatchAccepted, (acceptationInfo: AcceptationInformation) => {
                this.socket.names.set(acceptationInfo.playerSocketId, acceptationInfo.playerName);
                this.socket.opponentSocket = acceptationInfo.playerSocketId;
                this.navigateToMultiplayer(acceptationInfo.roomId);
            });
        }

        this.socket.listen(WAITING_ROOM_EVENTS.MatchRefused, (refusedReason: string) => {
            alert(refusedReason);
            this.dialogRef.close();
        });
    }

    navigateToMultiplayer(gameRoom: string): void {
        this.socket.gameRoom = gameRoom;
        this.dialogRef.close();
        if (!this.waitingRoomInfo.isLimitedTimeMode) {
            this.router.navigate(['/multiplayer/' + this.waitingRoomInfo.stageId]);
        }
    }

    ngOnDestroy(): void {
        this.socket.delete(WAITING_ROOM_EVENTS.RequestMatch);
        this.socket.delete(WAITING_ROOM_EVENTS.UnrequestMatch);
        this.socket.delete(WAITING_ROOM_EVENTS.MatchAccepted);
        this.socket.delete(WAITING_ROOM_EVENTS.MatchRefused);
        this.socket.delete(WAITING_ROOM_EVENTS.MatchConfirmed);
    }

    handleCancel(): void {
        this.socket.send(this.waitingRoomInfo.isHost ? WAITING_ROOM_EVENTS.UnhostGame : WAITING_ROOM_EVENTS.QuitHost);
        this.dialogRef.close();
    }

    acceptOpponent(opponentId: string): void {
        this.socket.send<AcceptOpponentInformation>(WAITING_ROOM_EVENTS.AcceptOpponent, {
            playerSocketId: opponentId,
            playerName: this.socket.names.get(this.socket.socketId) as string,
            isLimitedTimeMode: this.waitingRoomInfo.isLimitedTimeMode,
        });
        this.socket.opponentSocket = opponentId;
        this.socket.names.set(opponentId, this.clientsInWaitingRoom.get(opponentId) as string);
    }

    declineOpponent(opponentId: string): void {
        this.socket.send<string>(WAITING_ROOM_EVENTS.DeclineOpponent, opponentId);
        this.clientsInWaitingRoom.delete(opponentId);
    }
}
