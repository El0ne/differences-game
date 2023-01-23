import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { game } from '@app/game-card';

@Component({
    selector: 'app-game-card-selection',
    templateUrl: './game-card-selection.component.html',
    styleUrls: ['./game-card-selection.component.scss'],
})
export class GameCardSelectionComponent implements OnInit {
    gameCard = game;
    constructor(private router: Router) {}

    ngOnInit(): void {}

    playSolo(): void {
        this.router.navigate(['/soloGame']);
    }

    playOneVsOne(): void {
        this.router.navigate(['/waitingRoom']);
    }
}
