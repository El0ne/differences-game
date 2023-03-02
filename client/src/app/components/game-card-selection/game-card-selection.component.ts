import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HostWaitingRoomComponent } from '@app/modals/host-waiting-room/host-waiting-room.component';
import { STAGE } from '@app/services/server-routes';
import { SocketService } from '@app/services/socket/socket.service';
import { GameCardInformation } from '@common/game-card';

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
    ngOnInit() {
        this.image = `${STAGE}/image/${this.gameCardInformation.originalImageName}`;
    }

    hostOrJoinGame() {
        if (this.createGameButton) {
            this.socket.send('hostGame', this.gameCardInformation.id);
            const dialogRef = this.dialog.open(HostWaitingRoomComponent, { disableClose: true });
            dialogRef.afterClosed().subscribe(() => {
                this.socket.send('unhostGame', this.gameCardInformation.id);
            });
        } else {
            this.socket.send('joinHost', this.gameCardInformation.id, 'NomJoueur1');
        }
    }

    // TODO: ajouter la logique pour que le reset des temps et le delete se fait pour le sprint 2

    // TODO: Ajouter la logique pour que les temps de configurations viennent du database pour dynamiquement les loader.
}
