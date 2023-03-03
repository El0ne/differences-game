import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { OpponentApproval, PlayerInformations, WaitingRoomEvents } from '@common/waiting-room-socket-communication';

@Component({
    selector: 'app-host-waiting-room',
    templateUrl: './host-waiting-room.component.html',
    styleUrls: ['./host-waiting-room.component.scss'],
})
export class HostWaitingRoomComponent implements OnInit, OnDestroy {
    clientsInWaitingRoom: Map<string, string> = new Map<string, string>();
    stageId: string;

    constructor(
        public dialogRef: MatDialogRef<HostWaitingRoomComponent>,
        public socket: SocketService,
        @Inject(MAT_DIALOG_DATA) data: { stageId: string },
    ) {
        this.stageId = data.stageId;
    }

    ngOnInit(): void {
        this.socket.listen<PlayerInformations>(WaitingRoomEvents.RequestMatch, (opponentInformations: PlayerInformations) => {
            this.clientsInWaitingRoom.set(opponentInformations.playerSocketId, opponentInformations.playerName);
        });

        this.socket.listen(WaitingRoomEvents.UnrequestMatch, (opponentId: string) => {
            this.clientsInWaitingRoom.delete(opponentId);
        });
    }

    ngOnDestroy(): void {
        this.socket.send(WaitingRoomEvents.UnhostGame, this.stageId);
    }

    acceptOpponent(opponentId: string): void {
        this.socket.send<OpponentApproval>(WaitingRoomEvents.AcceptOpponent, { opponentId, stageId: this.stageId });
    }
    declineOpponent(opponentId: string): void {
        this.socket.send(WaitingRoomEvents.DeclineOpponent, opponentId);
        this.clientsInWaitingRoom.delete(opponentId);
    }
}
