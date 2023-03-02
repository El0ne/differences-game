import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { PlayerInformations } from '@common/playerInformations';

@Component({
    selector: 'app-host-waiting-room',
    templateUrl: './host-waiting-room.component.html',
    styleUrls: ['./host-waiting-room.component.scss'],
})
export class HostWaitingRoomComponent implements OnInit {
    clientsInWaitingRoom: Map<string, string> = new Map<string, string>();

    constructor(public dialogRef: MatDialogRef<HostWaitingRoomComponent>, public socket: SocketService) {}

    ngOnInit(): void {
        this.socket.listen<PlayerInformations>('requestGame', (opponentInformations: PlayerInformations) => {
            this.clientsInWaitingRoom.set(opponentInformations.playerSocketId, opponentInformations.playerName);
        });

        this.socket.listen('unrequestGame', (opponentId: string) => {
            this.clientsInWaitingRoom.delete(opponentId);
        });
    }

    acceptOpponent(opponentId: string): void {
        this.socket.send('acceptOpponent', opponentId);
    }
    declineOpponent(opponentId: string): void {
        this.socket.send('declineOpponent', opponentId);
        this.clientsInWaitingRoom.delete(opponentId);
    }
}
