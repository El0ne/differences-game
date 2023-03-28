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
            player1Name: 'jo',
            player2Name: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: false,
        },
        {
            id: 'gameID',
            winnerName: 'seph',
            player1Name: 'jo',
            player2Name: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: false,
        },
        {
            id: 'gameID',
            winnerName: 'seph',
            player1Name: 'jo',
            player2Name: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: true,
        },
        {
            id: 'gameID',
            winnerName: 'jo',
            player1Name: 'jo',
            player2Name: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: true,
        },
        {
            id: 'gameID',
            winnerName: '',
            player1Name: 'jo',
            player2Name: '',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: true,
        },
        {
            id: 'gameID',
            winnerName: 'jo',
            player1Name: 'jo',
            player2Name: '',
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
            player1Name: 'jo',
            player2Name: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: false,
        },
        {
            id: 'gameID',
            winnerName: 'seph',
            player1Name: 'jo',
            player2Name: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: false,
        },
        {
            id: 'gameID',
            winnerName: 'seph',
            player1Name: 'jo',
            player2Name: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: true,
        },
        {
            id: 'gameID',
            winnerName: 'jo',
            player1Name: 'jo',
            player2Name: 'seph',
            gameName: 'game-name',
            gameMode: 'game-mode',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: true,
        },
        {
            id: 'gameID',
            winnerName: '',
            player1Name: 'jo',
            player2Name: '',
            gameName: 'game-name',
            gameMode: 'Classique',
            gameDuration: 170, // timerservice convert
            startTime: '27/03/2023 13:09:07',
            isMultiplayer: true,
            isAbandon: true,
        },
        {
            id: 'gameID',
            winnerName: 'jo',
            player1Name: 'jo',
            player2Name: '',
            gameName: 'Temps limité',
            gameMode: 'Temps limité',
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
