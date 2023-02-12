import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { BehaviorSubject, Observable } from 'rxjs';

export const IMAGE_WIDTH = 640; // in pixels
export const IMAGE_HEIGHT = 480; // in pixels
export const IMAGE_SIZE = 921654; // 640px * 480px * 3 bytes (24 bits). This value means that only files with these specific properties work.
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    @ViewChild('canvas1') myOgCanvas: ElementRef;
    @ViewChild('canvas2') myDiffCanvas: ElementRef;

    modal: BehaviorSubject<'open' | 'close'> = new BehaviorSubject<'open' | 'close'>('close');

    display$: Observable<'open' | 'close'>;

    gameTitle: string = '';
    originalFile: File | null = null;
    differentFile: File | null = null;
    radius: number = 3;

    originalId: string = 'upload-original';
    differentId: string = 'upload-different';

    constructor(public gameCardService: GameCardInformationService) {}

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
        if (context) context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
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
        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (file !== undefined && file.size === IMAGE_SIZE && file.type === 'image/bmp') {
            this.uploadImage(file, target);
        } else {
            alert('wrong size or file type please choose again');
            target.value = ''; // we ended up really needing it lol
        }
    }

    async uploadImage(file: File, target: HTMLInputElement) {
        const ogContext = this.myOgCanvas.nativeElement.getContext('2d');
        const diffContext = this.myDiffCanvas.nativeElement.getContext('2d');
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
                if (!target.files?.length) {
                    return;
                }
                if (target.id === this.originalId) {
                    if (ogContext) ogContext.drawImage(img, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
                    this.originalFile = target.files[0];
                } else if (target.id === this.differentId) {
                    if (diffContext) diffContext.drawImage(img, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
                    this.differentFile = target.files[0];
                } else {
                    if (ogContext && diffContext) {
                        ogContext.drawImage(img, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
                        diffContext.drawImage(img, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
                        this.originalFile = target.files[0];
                        this.differentFile = target.files[0];
                    }
                }
            };
        };
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
            // this.gameCardService.uploadImages(this.originalFile, this.differentFile, this.radius).subscribe((data) => {
            //     const gameInfo = {
            //         name: this.gameTitle,
            //         baseImage: data[0].filename,
            //         differenceImage: data[1].filename,
            //         radius: this.radius,
            //     };
            //     this.gameCardService.createGame(gameInfo).subscribe((e) => console.log(e));
            //     this.modal.next('open');
            // });
        }
    }
}
