/* eslint-disable no-underscore-dangle */
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { GameCardSelectionComponent } from '@app/components/game-card-selection/game-card-selection.component';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { SocketService } from '@app/services/socket/socket.service';
import { GameCardInformation } from '@common/game-card';
import { WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';
import { GAME_CARDS_TO_DISPLAY } from './game-selection-constants';

const DELAY_BEFORE_REFRESH = 100;
@Component({
    selector: 'app-game-selection',
    templateUrl: './game-selection.component.html',
    styleUrls: ['./game-selection.component.scss'],
})
export class GameSelectionComponent implements OnInit {
    @ViewChildren('stages') stages: QueryList<GameCardSelectionComponent>;
    gameCardInformations: GameCardInformation[] = [];
    numberOfGameInformations = 0;
    index: number = 0;
    isConfig: boolean | null;

    constructor(public gameCardService: GameCardInformationService, public router: Router, private socket: SocketService) {}

    ngOnInit(): void {
        this.isConfig = this.router.url === '/config';
        this.socket.connect();
        if (!this.isConfig) {
            this.socket.listen(WAITING_ROOM_EVENTS.MatchCreated, (stageId: string) => {
                this.setGameCardCreateOrJoin(false, stageId);
            });

            this.socket.listen(WAITING_ROOM_EVENTS.MatchDeleted, (stageId: string) => {
                this.setGameCardCreateOrJoin(true, stageId);
            });
        }
        this.socket.listen(WAITING_ROOM_EVENTS.GameDeleted, () => {
            this.refreshGameCards();
        });

        this.refreshGameCards();
    }

    selectGameCards(): void {
        const endIndex = Math.min(this.numberOfGameInformations, this.index + GAME_CARDS_TO_DISPLAY) - 1;
        this.gameCardService.getGameCardsInformations(this.index, endIndex).subscribe((data) => {
            this.gameCardInformations = data;

            this.socket.send(
                WAITING_ROOM_EVENTS.ScanForHost,
                this.gameCardInformations.map((gameCardInfo: GameCardInformation) => gameCardInfo._id),
            );
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

    refreshGameCards(): void {
        setTimeout(() => {
            this.gameCardService.getNumberOfGameCardInformation().subscribe((data) => {
                this.numberOfGameInformations = data;
                this.selectGameCards();
            });
        }, DELAY_BEFORE_REFRESH);
    }

    setGameCardCreateOrJoin(isCreate: boolean, stageId: string) {
        for (const gameCardSelection of this.stages) {
            if (gameCardSelection.gameCardInformation._id === stageId) {
                gameCardSelection.createGameButton = isCreate;
                break;
            }
        }
    }
}
