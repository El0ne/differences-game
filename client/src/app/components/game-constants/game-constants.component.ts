import { Component, OnInit } from '@angular/core';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameConstants } from '@common/game-constants';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    hintTimeNumber: number;
    countdownTimeNumber: number;
    differenceFoundTimeNumber: number;

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
        // console.log('rgerg');
    }
}
