import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-game-lose-modal',
    templateUrl: './game-lose-modal.component.html',
    styleUrls: ['./game-lose-modal.component.scss'],
})
export class GameLoseModalComponent implements OnInit {
    constructor(private matDialogRef: MatDialogRef<GameLoseModalComponent>, private router: Router) {}

    ngOnInit(): void {}
}
