// using _id property which causes linting error
/* eslint-disable no-underscore-dangle */
import { Component, Inject, NgZone } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Routes } from '@app/modules/routes';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { ImagesService } from '@app/services/images/images.service';
import { GameCardDto } from '@common/game-card.dto';

@Component({
    selector: 'app-modal-page',
    templateUrl: './modal-page.component.html',
    styleUrls: ['./modal-page.component.scss'],
})
export class ModalPageComponent {
    // We have more than 3 necessary parameters
    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA)
        private data: {
            image: string;
            difference: number;
            difficulty: string;
            gameInfo: GameCardDto;
        },
        private matDialogRef: MatDialogRef<ModalPageComponent>,
        private router: Router,
        private gameCardService: GameCardInformationService,
        private clickService: ClickEventService,
        private ngZone: NgZone,
        private imagesServices: ImagesService,
    ) {}

    get image(): string {
        return this.data.image;
    }

    get difference(): number {
        return this.data.difference;
    }

    get difficulty(): string {
        return this.data.difficulty;
    }

    createGame(): void {
        this.gameCardService.createGame(this.data.gameInfo).subscribe();
        this.redirection(`/${Routes.Config}`);
    }

    dropGame(): void {
        this.clickService.deleteDifferences(this.data.gameInfo._id).subscribe();
        this.imagesServices.deleteImageObjects(this.data.gameInfo._id).subscribe();
        this.redirection(`/${Routes.CreatingGame}`);
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
