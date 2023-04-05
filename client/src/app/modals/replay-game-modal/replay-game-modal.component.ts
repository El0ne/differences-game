import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-replay-game-modal',
    templateUrl: './replay-game-modal.component.html',
    styleUrls: ['./replay-game-modal.component.scss'],
})
export class ReplayGameModalComponent implements OnInit {
    // isReplaySelected: boolean = false;

    constructor(private matDialogRef: MatDialogRef<ReplayGameModalComponent>, private router: Router) {}

    ngOnInit(): void {}

    confirm(): void {
        this.matDialogRef.close('quit');
        this.router.navigate(['/home']);
    }

    replay(): void {
        this.matDialogRef.close('replay');
    }
}
