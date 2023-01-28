import { Component, Input } from '@angular/core';
import { GameCardInformation } from '@app/Classes/game-card';

@Component({
    selector: 'app-game-card-selection',
    templateUrl: './game-card-selection.component.html',
    styleUrls: ['./game-card-selection.component.scss'],
})
export class GameCardSelectionComponent {
    @Input() gameCardInformation: GameCardInformation;
    @Input() isConfig: boolean | null;

    // TODO: ajouter la logique pour que le reset des temps et le delete se fait
}
