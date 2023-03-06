import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { PlayerInformations, WaitingRoomEvents } from '@common/waiting-room-socket-communication';

export interface WaitingRoomDataPassing {
    stageId: string;
    isHost: boolean;
}

@Component({
    selector: 'app-host-waiting-room',
    templateUrl: './host-waiting-room.component.html',
    styleUrls: ['./host-waiting-room.component.scss'],
})
export class HostWaitingRoomComponent implements OnInit, OnDestroy {
    clientsInWaitingRoom: Map<string, string> = new Map<string, string>();
    waitingRoomInfo: WaitingRoomDataPassing;

    constructor(
        public dialogRef: MatDialogRef<HostWaitingRoomComponent>,
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
        } else {
            this.socket.listen(WaitingRoomEvents.MatchAccepted, () => {
                alert('match accepte');
                this.dialogRef.close();
            });

            this.socket.listen(WaitingRoomEvents.MatchRefused, (refusedReason: string) => {
                alert(refusedReason);
                this.dialogRef.close();
            });
        }
    }

    ngOnDestroy(): void {
        this.socket.delete(WaitingRoomEvents.RequestMatch);
        this.socket.delete(WaitingRoomEvents.UnrequestMatch);
        this.socket.delete(WaitingRoomEvents.MatchAccepted);
        this.socket.delete(WaitingRoomEvents.MatchRefused);
    }

    handleCancel(): void {
        this.socket.send(this.waitingRoomInfo.isHost ? WaitingRoomEvents.UnhostGame : WaitingRoomEvents.QuitHost);
        this.dialogRef.close();
    }

    acceptOpponent(opponentId: string): void {
        this.socket.send<string>(WaitingRoomEvents.AcceptOpponent, opponentId);
    }
    declineOpponent(opponentId: string): void {
        this.socket.send<string>(WaitingRoomEvents.DeclineOpponent, opponentId);
        this.clientsInWaitingRoom.delete(opponentId);
    }
}
