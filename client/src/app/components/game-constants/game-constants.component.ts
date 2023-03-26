import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameConstants } from '@common/game-constants';

const DEFAULT_COUNTDOWN_TIME = 30;
const DEFAULT_HINT_TIME = 5;
const DEFAULT_DIFFERENCE_FOUND_TIME = 5;
@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    @Output() bestTimeReset = new EventEmitter<void>();
    countdownTimeNumber: number;
    differenceFoundTimeNumber: number;
    hintTimeNumber: number;

    constructor(private gameConstantsService: GameConstantsService, private gameCardService: GameCardInformationService) {}

    ngOnInit(): void {
        this.gameConstantsService.getGameConstants().subscribe((gameConstants: GameConstants) => {
            this.countdownTimeNumber = gameConstants.countDown;
            this.differenceFoundTimeNumber = gameConstants.difference;
            this.hintTimeNumber = gameConstants.hint;
        });
    }

    updateGameConstants(): void {
        const gameConstants: GameConstants = {
            countDown: this.countdownTimeNumber,
            hint: this.hintTimeNumber,
            difference: this.differenceFoundTimeNumber,
        };
        this.gameConstantsService.updateGameConstants(gameConstants).subscribe();
    }

    resetGameConstants(): void {
        this.countdownTimeNumber = DEFAULT_COUNTDOWN_TIME;
        this.hintTimeNumber = DEFAULT_HINT_TIME;
        this.differenceFoundTimeNumber = DEFAULT_DIFFERENCE_FOUND_TIME;
        this.updateGameConstants();
    }

    resetBestTimes(): void {
        this.gameCardService.resetBestTimes().subscribe(() => {
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
}
