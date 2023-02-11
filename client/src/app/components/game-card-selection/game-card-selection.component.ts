import { Component, Input, OnInit } from '@angular/core';
import { IdTransferService } from '@app/services/id-transfer/id-transfer.service';
import { GameCardInformation } from '@common/game-card';

@Component({
    selector: 'app-game-card-selection',
    templateUrl: './game-card-selection.component.html',
    styleUrls: ['./game-card-selection.component.scss'],
})
export class GameCardSelectionComponent implements OnInit {
    @Input() gameCardInformation: GameCardInformation;
    @Input() isConfig: boolean | null;
    // TODO : delete when actually implemented

    randomId: string = Math.floor(Math.random() * 11).toString();

    constructor(private idTransferService: IdTransferService) {}

    ngOnInit(): void {
        console.log(this.randomId);
    }

    getId() {
        this.idTransferService.setIdFromGameCard(this.randomId);
    }
    // TODO: ajouter la logique pour que le reset des temps et le delete se fait pour le sprint 2

    // TODO: Ajouter la logique pour que les temps de configurations viennent du database pour dynamiquement les loader.
}
