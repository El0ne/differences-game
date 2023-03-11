import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalPageComponent } from '@app/modals/modal-page/modal-page.component';
import { FileManipulationService } from '@app/services/file-manipulation.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { STAGE } from '@app/services/server-routes';
import { GameCardDto } from '@common/game-card.dto';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { BehaviorSubject, Observable } from 'rxjs';
import { GC_PATHS } from './game-creation-constants';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    @ViewChild('canvas1') originalCanvas: ElementRef;
    @ViewChild('canvas2') differenceCanvas: ElementRef;

    originalFile: File | null = null;
    differentFile: File | null = null;

    originalId: string = 'upload-original';
    differentId: string = 'upload-different';

    modal: BehaviorSubject<'open' | 'close'> = new BehaviorSubject<'open' | 'close'>('close');

    display$: Observable<'open' | 'close'>;

    readonly paths = GC_PATHS;

    gameTitle: string = '';
    radius: number = 3;

    isDisabled = false;
    image: string = '';
    differenceNumber: number = 0;
    difficulty: string = '';

    createdGameInfo: GameCardDto;

    // we need more than 3 services/router/dialog in this file
    // eslint-disable-next-line max-params
    constructor(
        public gameCardService: GameCardInformationService,
        private matDialog: MatDialog,
        public router: Router,
        private fileManipulationService: FileManipulationService,
    ) {}

    ngOnInit(): void {
        this.display$ = this.modal.asObservable();
    }

    getTitle(title: string): void {
        this.gameTitle = title;
    }

    openModal(): void {
        const dialogRef = this.matDialog.open(ModalPageComponent, {
            disableClose: true,
            data: {
                image: this.image,
                difference: this.differenceNumber,
                difficulty: this.difficulty,
                gameInfo: this.createdGameInfo,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            result.image = '';
            this.router.navigate(['/config']);
        });
    }

    clearFile(canvas: HTMLCanvasElement, id: string, file: File | null): void {
        this.fileManipulationService.clearFile(canvas, id, file);
    }

    async fileValidation(event: Event): Promise<void> {
        // this.fileManipulationService.fileValidation(event);
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (file !== undefined && file.size === IMAGE_DIMENSIONS.size && file.type === 'image/bmp') {
            await this.uploadImages(file, target);
        } else {
            alert('wrong size or file type please choose again');
            target.value = '';
        }
    }

    async uploadImages(file: File, target: HTMLInputElement): Promise<void> {
        if (target.id === this.originalId) {
            this.originalFile = await this.fileManipulationService.uploadImage(file, target, this.originalCanvas.nativeElement);
        } else if (target.id === this.differentId) {
            this.differentFile = await this.fileManipulationService.uploadImage(file, target, this.differenceCanvas.nativeElement);
        } else {
            this.originalFile = await this.fileManipulationService.uploadImage(file, target, this.originalCanvas.nativeElement);
            this.differentFile = await this.fileManipulationService.uploadImage(file, target, this.differenceCanvas.nativeElement);
        }
    }

    // drawToCanvas(canvas: HTMLCanvasElement, target: HTMLInputElement, img: HTMLImageElement): File | null {
    //     const context = canvas.getContext('2d');
    //     if (!target.files?.length) {
    //         return null;
    //     }
    //     if (context) context.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    //     return target.files[0];
    // }

    saveVerification(): boolean {
        if (this.gameTitle === '' && this.originalFile === null && this.differentFile === null) {
            alert('Il manque une image et un titre à votre jeu !');
            return false;
        } else if (this.gameTitle === '') {
            alert("N'oubliez pas d'ajouter un titre à votre jeu !");
            return false;
        } else if (this.originalFile === null || this.differentFile === null) {
            alert('Un jeu de différences sans image est pour ainsi dire... intéressant ? Ajoutez une image.');
            return false;
        }
        return true;
    }

    async save(): Promise<void> {
        if (this.saveVerification() && this.originalFile && this.differentFile) {
            this.isDisabled = true;
            this.gameCardService.uploadImages(this.originalFile, this.differentFile, this.radius).subscribe((data) => {
                if (data.gameDifferenceNumber) {
                    this.createdGameInfo = {
                        _id: data.gameId,
                        name: this.gameTitle,
                        difficulty: data.gameDifficulty,
                        baseImage: data.originalImageName,
                        differenceImage: data.differenceImageName,
                        radius: this.radius,
                        differenceNumber: data.gameDifferenceNumber,
                    };
                    this.difficulty = data.gameDifficulty;
                    this.differenceNumber = data.gameDifferenceNumber;
                    this.image = `${STAGE}/image/difference-image.bmp`;
                    this.openModal();
                    this.isDisabled = false;
                } else {
                    this.isDisabled = false;
                    alert("La partie n'a pas été créée. Vous devez avoir entre 3 et 9 différences");
                }
            });
        }
    }
}
