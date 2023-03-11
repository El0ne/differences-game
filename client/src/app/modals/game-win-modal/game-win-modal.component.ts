import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndGame } from '@common/chat-dialog-constants';

@Component({
    selector: 'app-game-win-modal',
    templateUrl: './game-win-modal.component.html',
    styleUrls: ['./game-win-modal.component.scss'],
})
export class GameWinModalComponent {
    constructor(public matDialogRef: MatDialogRef<GameWinModalComponent>, public router: Router, @Inject(MAT_DIALOG_DATA) public data: EndGame) {}

    confirm(): void {
        this.matDialogRef.close();
        this.router.navigate(['/stage-selection']);
    }
}
