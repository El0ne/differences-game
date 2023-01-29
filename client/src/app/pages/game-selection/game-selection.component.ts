import { Component, OnInit } from '@angular/core';
import { game, game2, GameCardInformation } from '@app/Classes/game-card';
import { GameOrConfigSelectionService } from '@app/services/game-or-config-selection/game-or-config-selection.service';
import { GAME_CARDS_TO_DISPLAY } from './game-selection-constants';

@Component({
    selector: 'app-game-selection',
    templateUrl: './game-selection.component.html',
    styleUrls: ['./game-selection.component.scss'],
})
export class GameSelectionComponent implements OnInit {
    gameCardInformations: GameCardInformation[] = [game, game, game, game2, game, game2]; // TODO vider lorsque la BD est implementee
    numberOfGameInformations = this.gameCardInformations.length;
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
        console.log('nextCard called');
    }

    previousCards(): void {
        // TODO appel a mongoDB pour prendre les 4 images precedentes
        if (!this.isShowingFirstCard()) {
            this.index -= GAME_CARDS_TO_DISPLAY;
            this.selectGameCards();
        }
    }

    isShowingFirstCard(): boolean {
        console.log('this.index === 0', this.index === 0);
        return this.index === 0;
    }

    isShowingLastCard(): boolean {
        console.log('this.index === this.numberOfGameInformations', this.index === this.numberOfGameInformations);
        return this.endIndex === this.numberOfGameInformations;
    }
}
