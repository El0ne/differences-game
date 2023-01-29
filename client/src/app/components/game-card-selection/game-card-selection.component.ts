import { Component, Input } from '@angular/core';
import { game, GameCardInformation } from '@app/Classes/game-card';

@Component({
    selector: 'app-game-card-selection',
    templateUrl: './game-card-selection.component.html',
    styleUrls: ['./game-card-selection.component.scss'],
})
export class GameCardSelectionComponent {
    @Input() gameCardInformation: GameCardInformation;
    @Input() isConfig: boolean | null;

    gameCardInformationTest = game;
    isConfigTest = true;

    // TODO: ajouter la logique pour que le reset des temps et le delete se fait pour le sprint 2
}
