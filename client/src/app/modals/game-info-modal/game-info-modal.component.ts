import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameCardInformation } from '@common/game-card';

export interface GameInfoModalData {
    gameCardInfo: GameCardInformation;
    numberOfDifferences: number;
    numberOfPlayers: number;
}

@Component({
    selector: 'app-game-info-modal',
    templateUrl: './game-info-modal.component.html',
    styleUrls: ['./game-info-modal.component.scss'],
})
export class GameInfoModalComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        private data: GameInfoModalData,
    ) {}

    get gameInfo(): GameInfoModalData {
        return this.data;
    }
}
