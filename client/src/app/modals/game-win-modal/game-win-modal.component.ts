import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Routes } from '@app/modules/routes';
import { EndGame } from '@common/chat-dialog-constants';

@Component({
    selector: 'app-game-win-modal',
    templateUrl: './game-win-modal.component.html',
    styleUrls: ['./game-win-modal.component.scss'],
})
export class GameWinModalComponent {
    constructor(private matDialogRef: MatDialogRef<GameWinModalComponent>, private router: Router, @Inject(MAT_DIALOG_DATA) private data: EndGame) {}

    get endGameInfo(): EndGame {
        return this.data;
    }

    confirm(): void {
        this.matDialogRef.close();
        this.router.navigate([`/${Routes.Home}`]);
    }
}
