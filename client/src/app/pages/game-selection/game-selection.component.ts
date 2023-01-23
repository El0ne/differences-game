import { Component, OnInit } from '@angular/core';
import { GameInformation } from '@app/classes/game-information';
import { GAME_CARDS_TO_DISPLAY } from '../pages-constants';

@Component({
    selector: 'app-game-selection',
    templateUrl: './game-selection.component.html',
    styleUrls: ['./game-selection.component.scss'],
})
export class GameSelectionComponent implements OnInit {
    gameCards: GameInformation[] = [];
    numberOfGameInformations = 0;
    index: number = 0;
    endIndex: number = 0;

    ngOnInit(): void {
        // TODO appel a mongoDB pour recuperer infos pour numberOfGameInformations
        // for (let i = 0; i < 10; i++) {
        //     this.gameCards.push(new GameInformation());
        // }
        // this.numberOfGameInformations = 9;
        this.selectGameCards();
    }

    selectGameCards(): void {
        // TODO appel mongo db
        this.endIndex = Math.min(this.index + GAME_CARDS_TO_DISPLAY, this.numberOfGameInformations);
    }

    nextCards(): void {
        // TODO appel a mongoDB pour prendre les 4 images suivantes
        if (this.endIndex !== this.numberOfGameInformations) {
            this.index += GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
    }

    previousCards(): void {
        // TODO appel a mongoDB pour prendre les 4 images precedentes
        if (this.index !== 0) {
            this.index -= GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
    }
}
