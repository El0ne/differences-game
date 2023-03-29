import { Component, OnInit } from '@angular/core';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameHistoryDTO } from '@common/game-history.dto';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
    gameHistory: GameHistoryDTO[]; // = FAKE_DATA;

    displayedColumns: string[] = ['date', 'duration', 'mode', 'player1', 'player2'];

    constructor(private gameHistoryService: GameHistoryService) {}

    ngOnInit(): void {
        this.gameHistoryService.getGameHistory().subscribe((gameHistory) => {
            this.gameHistory = gameHistory;
        });
    }
}
