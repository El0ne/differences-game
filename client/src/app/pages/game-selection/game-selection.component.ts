import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { game, GameCardInformation } from '@app/Classes/game-card';
import { GAME_CARDS_TO_DISPLAY } from './game-selection-constants';

@Component({
    selector: 'app-game-selection',
    templateUrl: './game-selection.component.html',
    styleUrls: ['./game-selection.component.scss'],
})
export class GameSelectionComponent implements OnInit {
    gameCardInformations: GameCardInformation[] = [game, game, game, game];
    numberOfGameInformations = 0;
    index: number = 0;
    endIndex: number = 0;
    pageMode: string | null;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.pageMode = this.route.snapshot.paramMap.get('gameMode');
        // TODO appel a mongoDB pour recuperer infos pour numberOfGameInformations
        this.numberOfGameInformations = 4;
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
