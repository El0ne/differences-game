import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { SocketService } from '@app/services/socket/socket.service';
import { GameCardInformation } from '@common/game-card';
import { GAME_CARDS_TO_DISPLAY } from './game-selection-constants';

@Component({
    selector: 'app-game-selection',
    templateUrl: './game-selection.component.html',
    styleUrls: ['./game-selection.component.scss'],
})
export class GameSelectionComponent implements OnInit {
    gameCardInformations: GameCardInformation[] = [];
    numberOfGameInformations = 0;
    index: number = 0;
    isConfig: boolean | null;

    constructor(public gameCardService: GameCardInformationService, public router: Router, public socket: SocketService) {}

    ngOnInit(): void {
        this.isConfig = this.router.url === '/config';
        this.gameCardService.getNumberOfGameCardInformation().subscribe((data) => {
            this.numberOfGameInformations = data;
            this.selectGameCards();
        });
        this.socket.connect();
        this.socket.listen('yo', (data) => console.log(data));
        this.socket.send('test', 'salut');
    }

    selectGameCards(): void {
        const endIndex = Math.min(this.numberOfGameInformations, this.index + GAME_CARDS_TO_DISPLAY);
        this.gameCardService.getGameCardsInformations(this.index, endIndex).subscribe((data) => {
            this.gameCardInformations = data;
        });
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
        return this.index <= 0;
    }

    isShowingLastCard(): boolean {
        return this.index + GAME_CARDS_TO_DISPLAY >= this.numberOfGameInformations;
    }
}
