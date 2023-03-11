/* eslint-disable no-underscore-dangle */
/* Required to allow for mongoDB unique _id to be reused in our database */
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HostWaitingRoomComponent } from '@app/modals/host-waiting-room/host-waiting-room.component';
import { STAGE } from '@app/services/server-routes';
import { SocketService } from '@app/services/socket/socket.service';
import { GameCardInformation } from '@common/game-card';
import { JoinHostInWaitingRequest, WaitingRoomEvents } from '@common/waiting-room-socket-communication';

@Component({
    selector: 'app-game-card-selection',
    templateUrl: './game-card-selection.component.html',
    styleUrls: ['./game-card-selection.component.scss'],
})
export class GameCardSelectionComponent implements OnInit {
    @Input() gameCardInformation: GameCardInformation;
    @Input() isConfig: boolean | null;
    image: string = '';
    createGameButton: boolean = true;

    constructor(public socket: SocketService, public dialog: MatDialog) {}
    ngOnInit(): void {
        this.image = `${STAGE}/image/${this.gameCardInformation.originalImageName}`;
    }

    hostOrJoinGame(): void {
        if (this.createGameButton) {
            this.socket.send(WaitingRoomEvents.HostGame, this.gameCardInformation._id);
            const dialogRef = this.dialog.open(HostWaitingRoomComponent, { disableClose: true });
            dialogRef.afterClosed().subscribe(() => {
                this.socket.send(WaitingRoomEvents.UnhostGame, this.gameCardInformation._id);
            });
        } else {
            this.socket.send<JoinHostInWaitingRequest>(WaitingRoomEvents.JoinHost, {
                stageId: this.gameCardInformation._id,
                playerName: 'NomJoueur1',
            });
        }
    }
}
