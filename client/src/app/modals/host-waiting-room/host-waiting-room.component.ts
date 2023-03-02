import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-host-waiting-room',
    templateUrl: './host-waiting-room.component.html',
    styleUrls: ['./host-waiting-room.component.scss'],
})
export class HostWaitingRoomComponent implements OnInit {
    clientsInWaitingRoom: Map<string, string> = new Map<string, string>();

    constructor(public dialogRef: MatDialogRef<HostWaitingRoomComponent>, public socket: SocketService) {}

    ngOnInit(): void {
        this.socket.listen('requestGame', (opponentName: string, opponentId: string) => {
            this.clientsInWaitingRoom.set(opponentId, opponentName);
        });
    }

    acceptOpponent(opponent: string): void {}
    declineOpponent(opponent: string): void {}
}
