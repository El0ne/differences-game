import { Component, Input, OnInit } from '@angular/core';
import { IdTransferService } from '@app/services/id-transfer/id-transfer.service';
import { STAGE } from '@app/services/server-routes';
import { GameCardInformation } from '@common/game-card';

@Component({
    selector: 'app-game-card-selection',
    templateUrl: './game-card-selection.component.html',
    styleUrls: ['./game-card-selection.component.scss'],
})
export class GameCardSelectionComponent implements OnInit {
    @Input() gameCardInformation: GameCardInformation;
    @Input() isConfig: boolean | null;

    image: string;

    constructor(private idTransferService: IdTransferService) {}

    ngOnInit(): void {
        this.image = `${STAGE}/image/${this.gameCardInformation.originalImageName}`;
    }

    getId() {
        this.idTransferService.setIdFromGameCard(this.gameCardInformation.id);
    }
    // TODO: ajouter la logique pour que le reset des temps et le delete se fait pour le sprint 2

    // TODO: Ajouter la logique pour que les temps de configurations viennent du database pour dynamiquement les loader.
}
