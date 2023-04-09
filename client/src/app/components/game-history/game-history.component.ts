import { Component, OnInit } from '@angular/core';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';
import { GameHistoryDTO } from '@common/game-history.dto';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
    gameHistory: GameHistoryDTO[];

    displayedColumns: string[] = ['date', 'duration', 'mode', 'player1', 'player2'];

    constructor(private gameHistoryService: GameHistoryService, private timerService: TimerSoloService) {}

    ngOnInit(): void {
        this.gameHistoryService.getGameHistory().subscribe((gameHistory) => {
            this.gameHistory = gameHistory;
        });
    }
    convertToMinute(seconds: number): string {
        return this.timerService.convert(seconds);
    }
}
