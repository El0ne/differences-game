import { Component, OnInit } from '@angular/core';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameConstants } from '@common/game-constants';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    // countdownTimeNumber: number;
    // differenceFoundTimeNumber: number;
    // hintTimeNumber: number;
    gameConstants: GameConstants;

    constructor(private gameConstantsService: GameConstantsService) {}

    ngOnInit(): void {
        this.gameConstantsService.getGameConstants().subscribe((gameConstants: GameConstants) => {
            this.gameConstants = gameConstants;
        });
    }

    updateGameConstants(): void {
        // const gameConstants: GameConstants = {
        //     countDown: this.countdownTimeNumber,
        //     hint: this.hintTimeNumber,
        //     difference: this.differenceFoundTimeNumber,
        // };
        this.gameConstantsService.updateGameConstants(this.gameConstants).subscribe();
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
