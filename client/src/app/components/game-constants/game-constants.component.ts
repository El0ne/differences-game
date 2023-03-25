import { Component, OnInit } from '@angular/core';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameConstants } from '@common/game-constants';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    // hintTimeNumber: number;
    countdownTimeNumber: number;
    differenceFoundTimeNumber: number;
    hintTimeNumber: number;

    constructor(private gameConstantsService: GameConstantsService) {}

    ngOnInit(): void {
        this.gameConstantsService.getGameConstants().subscribe();
    }

    updateGameConstants(): void {
        // this.countdownTimeNumber = 25;
        const gameConstants: GameConstants = {
            countDown: this.countdownTimeNumber,
            hint: this.hintTimeNumber,
            difference: this.differenceFoundTimeNumber,
        };
        console.log('gameConstants', gameConstants);
        this.gameConstantsService.updateGameConstants(gameConstants).subscribe(() => {
            console.log('work');
        });
        console.log('rgerg');
    }

    checkNumber(event: KeyboardEvent, minValue: number, maxValue: number): number {
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

    checkHint(event: KeyboardEvent, minValue: number, maxValue: number): void {
        this.hintTimeNumber = this.checkNumber(event, minValue, maxValue);
        console.log('this.hintTimeNumber', this.hintTimeNumber);
    }

    // checkHint(event: KeyboardEvent, minValue: number, maxValue: number): void {
    //     console.log('this.hintTimeNumber', event);
    //     console.log(typeof event);
    // }

    //  checkNumber(inputValue: number, minValue: number, maxValue: number): number {
    //     // const inputValue = parseInt((event.target as HTMLInputElement).value, 10);
    //     // console.log('inputValue', inputValue);
    //     if (inputValue < minValue) {
    //         inputValue = minValue;
    //         return minValue;
    //     } else if (inputValue > maxValue) {
    //         inputValue = maxValue;
    //         return maxValue;
    //     }
    //     return 0;
    // }

    test(value: number, minValue: number, maxValue: number) {
        if (value < minValue) {
            value = minValue;
        } else if (value > maxValue) {
            value = maxValue;
        }
    }
}
