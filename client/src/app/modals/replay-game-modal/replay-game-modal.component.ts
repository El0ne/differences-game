import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-replay-game-modal',
    templateUrl: './replay-game-modal.component.html',
    styleUrls: ['./replay-game-modal.component.scss'],
})
export class ReplayGameModalComponent {
    constructor(private matDialogRef: MatDialogRef<ReplayGameModalComponent>, private router: Router) {}

    confirm(): void {
        this.matDialogRef.close('quit');
        this.router.navigate(['/home']);
    }

    replay(): void {
        this.matDialogRef.close('replay');
    }
}
