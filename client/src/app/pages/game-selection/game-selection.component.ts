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
    nextButton: HTMLButtonElement;
    previousButton: HTMLButtonElement;

    ngOnInit(): void {
        this.nextButton = (<HTMLButtonElement>document.getElementById("next-button")); //ou faire des getElementById chaque fois?
        this.previousButton = (<HTMLButtonElement>document.getElementById("previous-button"));
        this.next();
        this.previous();
    }

    selectGameCards(): void {
        this.endIndex = Math.min(this.index + GAME_CARDS_TO_DISPLAY, this.gameCards.length);
    }

    next(): void {
        if (this.index + GAME_CARDS_TO_DISPLAY < this.gameCards.length) {
            this.index += GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
        this.switchButtons();
    }

    previous(): void {
        if (this.index - GAME_CARDS_TO_DISPLAY >= 0) {
            this.index -= GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
        this.switchButtons();
    }

    switchButtons() {
        let isLastGameCardReached: boolean = this.endIndex === this.gameCards.length;
            this.nextButton.disabled = isLastGameCardReached;
        let isIndexAtBeggin: boolean = this.index === 0;
            this.previousButton.disabled = isIndexAtBeggin;
    }
}
