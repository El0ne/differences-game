import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameCardInformation } from '@common/game-card';

@Component({
    selector: 'app-game-info-modal',
    templateUrl: './game-info-modal.component.html',
    styleUrls: ['./game-info-modal.component.scss'],
})
export class GameInfoModalComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            gameCardInfo: GameCardInformation;
            numberOfDifferences: number;
            numberOfPlayers: number;
        },
        public matDialogRef: MatDialogRef<GameInfoModalComponent>,
    ) {}
}
