/* eslint-disable no-underscore-dangle */
/* Required to allow for mongoDB unique _id to be reused in our database */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { WaitingRoomComponent, WaitingRoomDataPassing } from '@app/modals/waiting-room/waiting-room.component';
import { STAGE } from '@app/services/server-routes';
import { SocketService } from '@app/services/socket/socket.service';
import { GameCardInformation } from '@common/game-card';
import { MATCH_EVENTS } from '@common/match-gateway-communication';
import { JoinHostInWaitingRequest, WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';

@Component({
    selector: 'app-game-card-selection',
    templateUrl: './game-card-selection.component.html',
    styleUrls: ['./game-card-selection.component.scss'],
})
export class GameCardSelectionComponent implements OnInit {
    @Input() gameCardInformation: GameCardInformation;
    @Input() isConfig: boolean | null;
    @Output() gameDeleted = new EventEmitter<void>();
    image: string = '';
    createGameButton: boolean = true;

    constructor(private socketService: SocketService, private dialog: MatDialog, private router: Router) {}
    ngOnInit(): void {
        this.image = `${STAGE}/image/${this.gameCardInformation.originalImageName}`;
    }

    deleteGame(): void {
        this.socketService.send(WAITING_ROOM_EVENTS.DeleteGame, this.gameCardInformation._id);
        // TODO find out where the emit went
    }

    hostOrJoinGame(): void {
        if (this.createGameButton) {
            this.socketService.send<string>(WAITING_ROOM_EVENTS.HostGame, this.gameCardInformation._id);
        } else {
            this.socketService.send<JoinHostInWaitingRequest>(WAITING_ROOM_EVENTS.JoinHost, {
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
                this.socketService.gameRoom = this.socketService.socketId;
                this.socketService.send(MATCH_EVENTS.createSoloGame, this.gameCardInformation._id);
                this.router.navigate(['/solo/' + this.gameCardInformation._id]);
            } else this.hostOrJoinGame();
        });
    }
}
