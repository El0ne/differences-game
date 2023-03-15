import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-quit-game-modal',
    templateUrl: './quit-game-modal.component.html',
    styleUrls: ['./quit-game-modal.component.scss'],
})
export class QuitGameModalComponent {
    image: string = '../../../assets/crying-black-guy-meme.gif';
    constructor(private matDialogRef: MatDialogRef<QuitGameModalComponent>, private router: Router) {}

    confirm(): void {
        this.matDialogRef.close();
        this.router.navigate(['/stage-selection']);
    }

    cancel(): void {
        this.matDialogRef.close();
    }
}
