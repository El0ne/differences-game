import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameConstants } from '@common/game-constants';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    @Output() bestTimeReset = new EventEmitter<void>();
    gameConstants: GameConstants;

    // need more than 3 services and dialog
    // eslint-disable-next-line max-params
    constructor(
        private gameConstantsService: GameConstantsService,
        private gameCardService: GameCardInformationService,
        private dialog: MatDialog,
        private gameHistoryService: GameHistoryService,
    ) {}

    ngOnInit(): void {
        this.gameConstantsService.getGameConstants().subscribe((gameConstants: GameConstants) => {
            this.gameConstants = gameConstants;
        });
    }

    updateGameConstants(): void {
        this.gameConstantsService.updateGameConstants(this.gameConstants).subscribe();
    }

    resetGameConstants(): void {
        this.gameConstants = {
            countDown: 30,
            hint: 5,
            difference: 5,
        };

        this.updateGameConstants();
    }

    resetBestTimes(): void {
        this.gameCardService.resetBestTimes().subscribe(() => {
            this.bestTimeReset.emit();
        });
    }

    deleteAllGames(): void {
        this.gameCardService.deleteAllGames().subscribe(() => {
            this.bestTimeReset.emit();
        });
    }

    checkNumber(event: FocusEvent, minValue: number, maxValue: number): number {
        const inputValue = parseInt((event.target as HTMLInputElement).value, 10);
        if (inputValue < minValue) {
            (event.target as HTMLInputElement).value = minValue.toString();
            return minValue;
        } else if (inputValue > maxValue) {
            (event.target as HTMLInputElement).value = maxValue.toString();
            return maxValue;
        } else {
            return inputValue;
        }
    }

    isConstantNull(): boolean {
        return !this.gameConstants.countDown || !this.gameConstants.difference || !this.gameConstants.hint;
    }

    openGameHistory(): void {
        this.dialog.open(GameHistoryComponent);
    }

    deleteGameHistory(): void {
        this.gameHistoryService.deleteGameHistory().subscribe();
    }
}
