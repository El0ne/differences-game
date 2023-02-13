import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { STAGE } from '@app/services/server-routes';
import { GameInformation } from '@common/game-information';
import { BehaviorSubject, Observable } from 'rxjs';
import { GC_PATHS, IMAGE } from './game-creation-constants';

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

    readonly paths = GC_PATHS;

    gameTitle: string = '';
    originalFile: File | null = null;
    differentFile: File | null = null;
    radius: number = 3;

    originalId: string = 'upload-original';
    differentId: string = 'upload-different';

    image: string = '';
    differenceNumber: number = 0;

    constructor(public gameCardService: GameCardInformationService) {}

    ngOnInit(): void {
        this.display$ = this.modal.asObservable();
    }

    getTitle(title: string): void {
        this.gameTitle = title;
    }

    clearSingleFile(canvas: HTMLCanvasElement, id: string): void {
        const context = canvas.getContext('2d');
        const input = document.getElementById(id) as HTMLInputElement;
        const bothInput = document.getElementById('upload-both') as HTMLInputElement;
        input.value = '';
        bothInput.value = '';
        if (context) context.clearRect(0, 0, IMAGE.width, IMAGE.height);
    }

    clearFirstFile(canvas: HTMLCanvasElement, id: string): void {
        this.originalFile = null;
        this.clearSingleFile(canvas, id);
    }

    clearSecondFile(canvas: HTMLCanvasElement, id: string): void {
        this.differentFile = null;
        this.clearSingleFile(canvas, id);
    }

    fileValidation(e: Event): void {
        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (file !== undefined && file.size === IMAGE.size && file.type === 'image/bmp') {
            this.uploadImage(file, target);
        } else {
            alert('wrong size or file type please choose again');
            target.value = ''; // we ended up really needing it lol
        }
    }

    async uploadImage(file: File, target: HTMLInputElement): Promise<void> {
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
                    if (ogContext) ogContext.drawImage(img, 0, 0, IMAGE.width, IMAGE.height);
                    this.originalFile = target.files[0];
                } else if (target.id === this.differentId) {
                    if (diffContext) diffContext.drawImage(img, 0, 0, IMAGE.width, IMAGE.height);
                    this.differentFile = target.files[0];
                } else {
                    if (ogContext && diffContext) {
                        ogContext.drawImage(img, 0, 0, IMAGE.width, IMAGE.height);
                        diffContext.drawImage(img, 0, 0, IMAGE.width, IMAGE.height);
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

    async save(): Promise<void> {
        if (this.saveVerification() && this.originalFile && this.differentFile) {
            this.gameCardService.uploadImages(this.originalFile, this.differentFile, this.radius).subscribe((data) => {
                if (data.gameDifferenceNumber) {
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
                    this.gameCardService.createGame(gameInfo).subscribe();
                    this.modal.next('open');
                    this.gameCardService.getGameCardInfoFromId(data.gameId);
                } else {
                    alert("La partie n'a pas été créée. Vous devez avoir entre 3 et 9 différences");
                }
            });
        }
    }
}
