import { Component, Inject, NgZone, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameCardDto } from '@common/game-card.dto';

@Component({
    selector: 'app-modal-page',
    templateUrl: './modal-page.component.html',
    styleUrls: ['./modal-page.component.scss'],
})
export class ModalPageComponent implements OnDestroy {
    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            image: string;
            difference: number;
            difficulty: string;
            gameInfo: GameCardDto;
        },
        public matDialogRef: MatDialogRef<ModalPageComponent>,
        public router: Router,
        private gameCardService: GameCardInformationService,
        private ngZone: NgZone,
    ) {}

    ngOnDestroy() {
        this.matDialogRef.close(this.data);
    }
    createGame(): void {
        this.gameCardService.createGame(this.data.gameInfo).subscribe();
        this.redirection('/config');
    }

    deleteImages(): void {
        // TODO call service to delete images uploaded and difference object
        this.redirection('/creatingGame');
    }

    redirection(path: string): void {
        this.matDialogRef.close(this.data);
        this.matDialogRef.afterClosed().subscribe((result) => {
            result.image = '';
            this.ngZone.run(() => {
                this.router.navigate([path]);
            });
        });
    }
}
