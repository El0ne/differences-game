import { Component, OnInit } from '@angular/core';
import { GameCardInformation } from '@app/Classes/game-card';
import { GameOrConfigSelectionService } from '@app/services/game-or-config-selection/game-or-config-selection.service';
import { GAME_CARDS_TO_DISPLAY } from './game-selection-constants';

@Component({
    selector: 'app-game-selection',
    templateUrl: './game-selection.component.html',
    styleUrls: ['./game-selection.component.scss'],
})
export class GameSelectionComponent implements OnInit {
    gameCardInformations: GameCardInformation[] = []; // [game, game, game, game]; // TODO vider lorsque la BD est implementee
    numberOfGameInformations = 0;
    index: number = 0;
    endIndex: number = 0;
    isConfig: boolean | null;

    constructor(public gameOrConfigService: GameOrConfigSelectionService) {
        this.isConfig = gameOrConfigService.getConfigView();
    }

    ngOnInit(): void {
        // TODO appel a mongoDB pour recuperer infos pour numberOfGameInformations
        // this.numberOfGameInformations = gameCardInformations.lenght; //pour tester la vue des composantes
        this.selectGameCards();
    }

    selectGameCards(): void {
        // TODO appel mongo db
        this.endIndex = Math.min(this.index + GAME_CARDS_TO_DISPLAY, this.numberOfGameInformations);
    }

    nextCards(): void {
        // TODO appel a mongoDB pour prendre les 4 images suivantes
        if (!this.isShowingLastCard()) {
            this.index += GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
    }

    previousCards(): void {
        // TODO appel a mongoDB pour prendre les 4 images precedentes
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
