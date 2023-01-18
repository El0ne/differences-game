import { Component, OnInit } from '@angular/core';
import { GameInformation } from '@app/classes/game-information';
import { GAME_CARDS_TO_DISPLAY } from '../pages.constants';

@Component({
    selector: 'app-game-selection',
    templateUrl: './game-selection.component.html',
    styleUrls: ['./game-selection.component.scss'],
})
export class GameSelectionComponent implements OnInit {
    gameCards: GameInformation[] = [];
    index: number = 0;
    endIndex: number = 0;

    ngOnInit(): void {
        this.selectGameCards();
    }

    selectGameCards(): void {
        this.endIndex = Math.min(this.index + GAME_CARDS_TO_DISPLAY, this.gameCards.length);
    }

    next(): void {
        if (this.index + GAME_CARDS_TO_DISPLAY < this.gameCards.length) {
            this.index += GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
    }

    previous(): void {
        if (this.index - GAME_CARDS_TO_DISPLAY >= 0) {
            this.index -= GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
    }
}
