import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Routes } from '@app/modules/routes';

@Component({
    selector: 'app-game-lose-modal',
    templateUrl: './game-lose-modal.component.html',
    styleUrls: ['./game-lose-modal.component.scss'],
})
export class GameLoseModalComponent {
    constructor(private matDialogRef: MatDialogRef<GameLoseModalComponent>, private router: Router) {}

    confirm(): void {
        this.matDialogRef.close();
        this.router.navigate([`/${Routes.Home}`]);
    }
}
