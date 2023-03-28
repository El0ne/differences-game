import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameConstants } from '@common/game-constants';

const FAKE_DATA = [
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

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    @Output() bestTimeReset = new EventEmitter<void>();
    gameConstants: GameConstants;

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

        FAKE_DATA.forEach((gameHistory) => {
            this.gameHistoryService.addGameHistory(gameHistory).subscribe();
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

    openGameHistory() {
        this.dialog.open(GameHistoryComponent);
    }

    deleteGameHistory(): void {
        this.gameHistoryService.deleteGameHistory().subscribe();
    }
}
