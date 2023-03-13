/* eslint-disable no-underscore-dangle */
/* Required to allow for mongoDB unique _id to be reused in our database */
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { WaitingRoomComponent, WaitingRoomDataPassing } from '@app/modals/waiting-room/waiting-room.component';
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

    playerName: string = 'Player';

    constructor(private socketService: SocketService, public dialog: MatDialog, public router: Router) {}
    ngOnInit(): void {
        this.image = `${STAGE}/image/${this.gameCardInformation.originalImageName}`;
    }

    hostOrJoinGame(): void {
        if (this.createGameButton) {
            this.socketService.send<string>(WaitingRoomEvents.HostGame, this.gameCardInformation._id);
        } else {
            this.socketService.send<JoinHostInWaitingRequest>(WaitingRoomEvents.JoinHost, {
                stageId: this.gameCardInformation._id,
                playerName: this.socketService.names.get(this.socketService.socketId) as string,
            });
        }
        const data: WaitingRoomDataPassing = { stageId: this.gameCardInformation._id, isHost: this.createGameButton };
        this.dialog.open(WaitingRoomComponent, { disableClose: true, data });
    }

    selectPlayerName(isSoloGame: boolean): void {
        const dialogRef = this.dialog.open(ChosePlayerNameDialogComponent, { disableClose: true });
        dialogRef.afterClosed().subscribe(() => {
            if (isSoloGame) {
                this.router.navigate(['/soloview/' + this.gameCardInformation._id]);
            } else this.hostOrJoinGame();
        });
    }
}
