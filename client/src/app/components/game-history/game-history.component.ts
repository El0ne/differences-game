import { Component, OnInit } from '@angular/core';
import { GameHistory } from '@common/game-history';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
    gameHistory: GameHistory = {
        id: 'gameID',
        winnerName: 'jo',
        loserName: 'seph',
        gameName: 'game-name',
        gameDuration: 170, // timerservice convert
        startTime: '27/03/2023 13:09:07',
        isMultiplayer: true,
        isAbandon: false,
    };
    constructor() {}

    ngOnInit(): void {}
}
