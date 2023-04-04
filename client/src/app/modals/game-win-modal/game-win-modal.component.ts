import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndGame } from '@common/chat-dialog-constants';

@Component({
    selector: 'app-game-win-modal',
    templateUrl: './game-win-modal.component.html',
    styleUrls: ['./game-win-modal.component.scss'],
})
export class GameWinModalComponent {
    isReplaySelected: boolean = false;
    constructor(private matDialogRef: MatDialogRef<GameWinModalComponent>, private router: Router, @Inject(MAT_DIALOG_DATA) public data: EndGame) {}

    confirm(): void {
        this.matDialogRef.close();
        this.router.navigate(['/home']);
    }

    replay(): void {
        this.matDialogRef.close();
        this.isReplaySelected = true;
    }
}
