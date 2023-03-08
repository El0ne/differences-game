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

    constructor(public socket: SocketService, public dialog: MatDialog, public router: Router) {}
    ngOnInit() {
        this.image = `${STAGE}/image/${this.gameCardInformation.originalImageName}`;
    }

    hostOrJoinGame() {
        if (this.createGameButton) {
            this.socket.send<string>(WaitingRoomEvents.HostGame, this.gameCardInformation.id);
        } else {
            this.socket.send<JoinHostInWaitingRequest>(WaitingRoomEvents.JoinHost, {
                stageId: this.gameCardInformation.id,
                playerName: this.socket.names.get(this.socket.socketId) as string,
            });
        }
        const data: WaitingRoomDataPassing = { stageId: this.gameCardInformation.id, isHost: this.createGameButton };
        this.dialog.open(WaitingRoomComponent, { disableClose: true, data });
    }

    selectPlayerName(isSoloGame: boolean) {
        const dialogRef = this.dialog.open(ChosePlayerNameDialogComponent, { disableClose: true });
        dialogRef.afterClosed().subscribe(() => {
            if (isSoloGame) {
                this.router.navigate(['/soloview/' + this.gameCardInformation.id]);
            } else this.hostOrJoinGame();
        });
    }
    // TODO: ajouter la logique pour que le reset des temps et le delete se fait pour le sprint 2

    // TODO: Ajouter la logique pour que les temps de configurations viennent du database pour dynamiquement les loader.
}
