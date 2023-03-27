import { Component, OnInit } from '@angular/core';
import { GameHistory } from '@common/game-history';

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}

const ELEMENT_DATA = [
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
    // { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    // { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    // { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    // { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    // { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
    // { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
    // { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    // { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    // { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    // { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

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
    ];
    dataSource = ELEMENT_DATA;
    displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

    // displayedColumns: string[] = ['startTime', 'gameDuration', 'gameMode', 'winnerName', 'loserName'];

    constructor() {}

    ngOnInit(): void {}
}
