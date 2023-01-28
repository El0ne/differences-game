import { Component, Input } from '@angular/core';
import { GameCardInformation } from '@common/game-card';

@Component({
    selector: 'app-game-card-selection',
    templateUrl: './game-card-selection.component.html',
    styleUrls: ['./game-card-selection.component.scss'],
})
export class GameCardSelectionComponent {
    @Input() gameCardInformation: GameCardInformation;
}
