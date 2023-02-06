import { Component, ElementRef, ViewChild } from '@angular/core';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { Observable } from 'rxjs';
import { ModalDiffPageService } from './modal-diff-page.service';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    @ViewChild('canvas1') myOgCanvas: ElementRef;
    @ViewChild('canvas2') myDiffCanvas: ElementRef;
    @ViewChild('og') og: ElementRef;

    display$: Observable<'open' | 'close'>;

    gameTitle: string = '';
    originalFile: File | null = null;
    differentFile: File | null = null;
    radius: number = 3;

    testId: string = 'upload-original';
    otherId: string = 'upload-different';

    constructor(public modalDiffService: ModalDiffPageService, private gameCardService: GameCardInformationService) {}

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
        console.log(this.gameTitle);
        if (this.saveVerification() && this.originalFile && this.differentFile) {
            this.gameCardService.uploadImages(this.originalFile, this.differentFile).subscribe((data) => {
                const gameInfo = {
                    name: this.gameTitle,
                    baseImage: data[0].filename,
                    differenceImage: data[1].filename,
                    radius: this.radius,
                };
                this.gameCardService.createGame(gameInfo).subscribe((e) => console.log(e));
                this.modalDiffService.open();
            });
        }
    }
}
