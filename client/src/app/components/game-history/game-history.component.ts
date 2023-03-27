import { Component, OnInit } from '@angular/core';
import { GameHistory } from '@common/game-history';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
    gameHistory: GameHistory[] = [
        {
            id: 'gameID',
            winnerName: 'jo',
            loserName: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: false,
        },
        {
            id: 'gameID',
            winnerName: 'jo',
            loserName: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: false,
        },
        {
            id: 'gameID',
            winnerName: 'jo',
            loserName: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: false,
        },
        {
            id: 'gameID',
            winnerName: 'jo',
            loserName: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: false,
        },
    ];
    dataSource = this.gameHistory;
    displayedColumns: string[] = ['date', 'duration', 'mode', 'player1', 'player2'];

    constructor() {}

    ngOnInit(): void {}
}
