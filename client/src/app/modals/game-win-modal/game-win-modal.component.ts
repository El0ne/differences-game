import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-game-win-modal',
    templateUrl: './game-win-modal.component.html',
    styleUrls: ['./game-win-modal.component.scss'],
})
export class GameWinModalComponent {
    constructor(public matDialogRef: MatDialogRef<GameWinModalComponent>, public router: Router) {}

    confirm() {
        this.matDialogRef.close();
        this.router.navigate(['/home']);
    }
}
