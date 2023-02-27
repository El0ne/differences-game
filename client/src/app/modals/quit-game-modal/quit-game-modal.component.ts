import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-quit-game-modal',
    templateUrl: './quit-game-modal.component.html',
    styleUrls: ['./quit-game-modal.component.scss'],
})
export class QuitGameModalComponent {
    constructor(public matDialogRef: MatDialogRef<QuitGameModalComponent>, public router: Router) {}

    confirm() {
        this.matDialogRef.close();
        this.router.navigate(['/stage-selection']);
    }

    cancel() {
        this.matDialogRef.close();
    }
}
