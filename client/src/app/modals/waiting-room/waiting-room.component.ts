import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { AcceptationInformation, PlayerInformations, WaitingRoomEvents } from '@common/waiting-room-socket-communication';

export interface WaitingRoomDataPassing {
    stageId: string;
    isHost: boolean;
}

@Component({
    selector: 'app-host-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
    clientsInWaitingRoom: Map<string, string> = new Map<string, string>();
    waitingRoomInfo: WaitingRoomDataPassing;

    // raison: besoin de tous les parametres
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<WaitingRoomComponent>,
        public router: Router,
        public socket: SocketService,
        @Inject(MAT_DIALOG_DATA) data: WaitingRoomDataPassing,
    ) {
        this.waitingRoomInfo = data;
    }

    ngOnInit(): void {
        if (this.waitingRoomInfo.isHost) {
            this.socket.listen<PlayerInformations>(WaitingRoomEvents.RequestMatch, (opponentInformations: PlayerInformations) => {
                this.clientsInWaitingRoom.set(opponentInformations.playerSocketId, opponentInformations.playerName);
            });

            this.socket.listen(WaitingRoomEvents.UnrequestMatch, (opponentId: string) => {
                this.clientsInWaitingRoom.delete(opponentId);
            });

            this.socket.listen(WaitingRoomEvents.MatchConfirmed, (roomId: string) => {
                this.navigateTo1v1(roomId);
            });
        } else {
            this.socket.listen<AcceptationInformation>(WaitingRoomEvents.MatchAccepted, (acceptationInfo: AcceptationInformation) => {
                this.socket.names.set(acceptationInfo.playerSocketId, acceptationInfo.playerName);
                this.navigateTo1v1(acceptationInfo.roomId);
            });

            this.socket.listen(WaitingRoomEvents.MatchRefused, (refusedReason: string) => {
                alert(refusedReason);
                this.dialogRef.close();
            });
        }
    }

    navigateTo1v1(gameRoom: string) {
        this.socket.gameRoom = gameRoom;
        this.dialogRef.close();
        this.router.navigate(['/1v1/' + this.waitingRoomInfo.stageId]);
    }

    ngOnDestroy(): void {
        this.socket.delete(WaitingRoomEvents.RequestMatch);
        this.socket.delete(WaitingRoomEvents.UnrequestMatch);
        this.socket.delete(WaitingRoomEvents.MatchAccepted);
        this.socket.delete(WaitingRoomEvents.MatchRefused);
        this.socket.delete(WaitingRoomEvents.MatchConfirmed);
    }

    handleCancel(): void {
        this.socket.send(this.waitingRoomInfo.isHost ? WaitingRoomEvents.UnhostGame : WaitingRoomEvents.QuitHost);
        this.dialogRef.close();
    }

    acceptOpponent(opponentId: string): void {
        this.socket.send<PlayerInformations>(WaitingRoomEvents.AcceptOpponent, {
            playerSocketId: opponentId,
            playerName: this.socket.names.get(this.socket.socketId) as string,
        });
        this.socket.names.set(opponentId, this.clientsInWaitingRoom.get(opponentId) as string);
    }
    declineOpponent(opponentId: string): void {
        this.socket.send<string>(WaitingRoomEvents.DeclineOpponent, opponentId);
        this.clientsInWaitingRoom.delete(opponentId);
    }
}
