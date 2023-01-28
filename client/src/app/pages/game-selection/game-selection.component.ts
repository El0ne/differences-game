import { Component, OnInit } from '@angular/core';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameOrConfigSelectionService } from '@app/services/game-or-config-selection/game-or-config-selection.service';
import { GameCardInformation } from '@common/game-card';
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

    constructor(public gameOrConfigService: GameOrConfigSelectionService, public gameCardService: GameCardInformationService) {
        this.isConfig = gameOrConfigService.getConfigView();
    }

    ngOnInit(): void {
        // TODO appel a mongoDB pour recuperer infos pour numberOfGameInformations
        // this.numberOfGameInformations = this.gameCardInformations.length; // pour tester la vue des composantes
        this.gameCardService.getNumbnerOfGameCardInformation().subscribe((data) => {
            this.numberOfGameInformations = data;
        });
        this.selectGameCards();
    }

    selectGameCards(): void {
        // TODO appel mongo db
        this.gameCardService.getGameCardsInformations(this.index, this.endIndex).subscribe((data) => {
            this.gameCardInformations = data;
        });
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
