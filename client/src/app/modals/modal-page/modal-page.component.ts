import { Component, Inject, NgZone, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameCardDto } from '@common/game-card.dto';

@Component({
    selector: 'app-modal-page',
    templateUrl: './modal-page.component.html',
    styleUrls: ['./modal-page.component.scss'],
})
export class ModalPageComponent implements OnDestroy {
    // eslint-disable-next-line max-params
    // We have more than 3 necessary parameters
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
        private clickService: ClickEventService,
        private ngZone: NgZone,
    ) {}

    ngOnDestroy() {
        this.matDialogRef.close(this.data);
    }
    createGame(): void {
        this.gameCardService.createGame(this.data.gameInfo).subscribe();
        this.redirection('/config');
    }

    dropGame(): void {
        // using _id property which causes linting error
        // eslint-disable-next-line no-underscore-dangle
        this.clickService.deleteDifferences(this.data.gameInfo._id).subscribe();
        this.gameCardService.deleteImage(this.data.gameInfo.baseImage).subscribe();
        this.gameCardService.deleteImage(this.data.gameInfo.differenceImage).subscribe();
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
