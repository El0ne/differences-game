import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { STAGE } from '@app/services/server-routes';
import { GameInformation } from '@common/game-information';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    @ViewChild('canvas1') myOgCanvas: ElementRef;
    @ViewChild('canvas2') myDiffCanvas: ElementRef;
    @ViewChild('og') og: ElementRef;

    modal: BehaviorSubject<'open' | 'close'> = new BehaviorSubject<'open' | 'close'>('close');

    display$: Observable<'open' | 'close'>;

    gameTitle: string = '';
    originalFile: File | null = null;
    differentFile: File | null = null;
    radius: number = 3;

    testId: string = 'upload-original';
    otherId: string = 'upload-different';

    image: string = '';
    differenceNumber: number = 0;

    constructor(private gameCardService: GameCardInformationService) {}

    ngOnInit(): void {
        this.display$ = this.modal.asObservable();
    }

    getTitle(title: string) {
        this.gameTitle = title;
    }

    clearSingleFile(canvas: HTMLCanvasElement, id: string) {
        const context = canvas.getContext('2d');
        const input = document.getElementById(id) as HTMLInputElement;
        const bothInput = document.getElementById('upload-both') as HTMLInputElement;
        input.value = '';
        bothInput.value = '';
        if (context) context.clearRect(0, 0, 640, 480);
    }

    clearFirstFile(canvas: HTMLCanvasElement, id: string) {
        this.originalFile = null;
        this.clearSingleFile(canvas, id);
    }

    clearSecondFile(canvas: HTMLCanvasElement, id: string) {
        this.differentFile = null;
        this.clearSingleFile(canvas, id);
    }

    fileValidation(e: Event) {
        const ogContext = this.myOgCanvas.nativeElement.getContext('2d');
        const diffContext = this.myDiffCanvas.nativeElement.getContext('2d');
        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (file !== undefined && file.size === 921654 && file.type === 'image/bmp') {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    if (img.naturalWidth !== 640 && img.naturalHeight !== 480) {
                        alert('wrong size');
                    } else {
                        if (!target.files?.length) {
                            return;
                        }

                        if (target.id === 'upload-original') {
                            if (ogContext) ogContext.drawImage(img, 0, 0, 640, 480);
                            this.originalFile = target.files[0];
                            console.log(this.originalFile);
                        } else if (target.id === 'upload-different') {
                            if (diffContext) diffContext.drawImage(img, 0, 0, 640, 480);
                            this.differentFile = target.files[0];
                        } else {
                            if (ogContext) ogContext.drawImage(img, 0, 0, 640, 480);
                            this.originalFile = target.files[0];
                            if (diffContext) diffContext.drawImage(img, 0, 0, 640, 480);
                            this.differentFile = target.files[0];
                        }
                    }
                };
            };
        } else {
            alert('wrong size or file type please choose again');
            target.value = ''; // check if useful
        }
    }

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
    save(): void {
        if (this.saveVerification() && this.originalFile && this.differentFile) {
            this.gameCardService.uploadImages(this.originalFile, this.differentFile, this.radius).subscribe((data) => {
                const gameInfo: GameInformation = {
                    id: data.gameId,
                    name: this.gameTitle,
                    difficulty: data.gameDifficulty,
                    baseImage: data.originalImageName,
                    differenceImage: data.differenceImageName,
                    radius: this.radius,
                    differenceNumber: data.gameDifferenceNumber,
                };
                this.differenceNumber = data.gameDifferenceNumber;
                this.image = `${STAGE}/image/difference-image.bmp`;
                this.gameCardService.createGame(gameInfo).subscribe((e) => {});
                this.modal.next('open');
            });
        }
    }
}
