import { Component, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GAMES } from '@app/mock/game-cards';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameCardInformation } from '@common/game-card';
import { GAME_CARDS_TO_DISPLAY } from './game-selection-constants';

@Component({
    selector: 'app-game-selection',
    templateUrl: './game-selection.component.html',
    styleUrls: ['./game-selection.component.scss'],
})
export class GameSelectionComponent implements OnInit, OnChanges {
    gameCardInformations: GameCardInformation[] = GAMES; // TODO vider lorsque la BD est implementee
    numberOfGameInformations = 0; // this.gameCardInformations.length; // TODO initialiser a 0 lorsque le service est fonctionnel
    index: number = 0;
    endIndex: number = 0;
    isConfig: boolean | null;

    constructor(public gameCardService: GameCardInformationService, public router: Router) {}

    async ngOnInit(): Promise<void> {
        this.isConfig = this.router.url === '/config';
        this.gameCardService.getNumberOfGameCardInformation().subscribe((data) => {
            this.numberOfGameInformations = data;
        });
        this.selectGameCards();
    }

    async ngOnChanges(): Promise<void> {
        await this.selectGameCards();
    }

    async selectGameCards(): Promise<void> {
        this.gameCardService.getGameCardsInformations(this.index, this.endIndex).subscribe((data) => {
            this.gameCardInformations = data;
        });
        this.endIndex = Math.min(this.index + GAME_CARDS_TO_DISPLAY, this.numberOfGameInformations);
    }

    nextCards(): void {
        if (!this.isShowingLastCard()) {
            this.index += GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
    }

    previousCards(): void {
        if (!this.isShowingFirstCard()) {
            this.index -= GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
    }

    isShowingFirstCard(): boolean {
        return this.index === 0;
    }

    isShowingLastCard(): boolean {
        return this.endIndex === this.numberOfGameInformations;
    }
}
