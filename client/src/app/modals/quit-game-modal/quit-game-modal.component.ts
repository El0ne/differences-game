import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Routes } from '@app/modules/routes';

@Component({
    selector: 'app-quit-game-modal',
    templateUrl: './quit-game-modal.component.html',
    styleUrls: ['./quit-game-modal.component.scss'],
})
export class QuitGameModalComponent {
    image: string = '@app/assets/crying-black-guy-meme.gif';
    constructor(
        @Inject(MAT_DIALOG_DATA)
        private data: {
            isButtonDisabled: boolean;
        },

        private matDialogRef: MatDialogRef<QuitGameModalComponent>,
        private router: Router,
    ) {}

    get gameData(): { isButtonDisabled: boolean } {
        return this.data;
    }

    confirm(): void {
        this.matDialogRef.close();
        this.router.navigate([`/${Routes.Home}`]);
    }

    cancel(): void {
        this.matDialogRef.close();
    }
}
