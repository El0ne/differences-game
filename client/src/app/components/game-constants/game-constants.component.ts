import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { ConfirmationModalComponent } from '@app/modals/confirmation-modal/confirmation-modal/confirmation-modal.component';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { SocketService } from '@app/services/socket/socket.service';
import { GameConstants, getDefaultGameConstants } from '@common/game-constants';
import { WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    @Output() bestTimeReset = new EventEmitter<void>();
    gameConstants: GameConstants;

    // need more than 3 services and dialog
    // eslint-disable-next-line max-params
    constructor(
        private gameConstantsService: GameConstantsService,
        private gameCardService: GameCardInformationService,
        private dialog: MatDialog,
        private gameHistoryService: GameHistoryService,
        private socketService: SocketService,
    ) {}

    ngOnInit(): void {
        this.gameConstantsService.getGameConstants().subscribe((gameConstants: GameConstants) => {
            this.gameConstants = gameConstants;
        });
    }

    updateGameConstants(): void {
        this.gameConstantsService.updateGameConstants(this.gameConstants).subscribe();
    }

    resetGameConstants(): void {
        this.gameConstants = getDefaultGameConstants();
        this.updateGameConstants();
    }

    resetAllBestTimes(): void {
        this.gameCardService.resetAllBestTimes().subscribe(() => {
            this.bestTimeReset.emit();
        });
    }

    deleteAllGames(): void {
        const dialog = this.dialog.open(ConfirmationModalComponent, { data: { message: 'Supprimer toutes les parties?' } });
        dialog.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.socketService.send(WAITING_ROOM_EVENTS.DeleteAllGames);
            }
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

    openGameHistory(): void {
        this.dialog.open(GameHistoryComponent);
    }

    deleteGameHistory(): void {
        const dialog = this.dialog.open(ConfirmationModalComponent, { data: { message: "Supprimer l'historique de partie?" } });
        dialog.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.gameHistoryService.deleteGameHistory().subscribe();
            }
        });
    }
}
