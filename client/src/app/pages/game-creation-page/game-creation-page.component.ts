import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalPageComponent } from '@app/modals/modal-page/modal-page.component';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameCardDto } from '@common/game-card.dto';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { GC_PATHS } from './game-creation-constants';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements AfterViewInit {
    @ViewChild('canvas1') myOgCanvas: ElementRef;
    @ViewChild('canvas2') myDiffCanvas: ElementRef;

    @ViewChild('drawingCanvas2') drawnCanvas: ElementRef;
    @ViewChild('drawingCanvas3') rectCanvas: ElementRef;

    canvas1ZIndex: number = 3;
    canvas2ZIndex: number = 2;

    isRectEnabled: boolean = false;

    isUserClicking: boolean = false;
    rectInitialPosX: number;
    rectInitialPosY: number;

    color: string = '#ff124f';

    drawCtx: CanvasRenderingContext2D;
    rectCtx: CanvasRenderingContext2D;

    readonly paths = GC_PATHS;

    gameTitle: string = '';
    originalFile: File | null = null;
    differentFile: File | null = null;
    radius: number = 3;

    originalId: string = 'upload-original';
    differentId: string = 'upload-different';

    isDisabled = false;
    image: string = '';
    differenceNumber: number = 0;
    difficulty: string = '';

    createdGameInfo: GameCardDto;

    private listener: (e: MouseEvent) => void;

    constructor(public gameCardService: GameCardInformationService, private matDialog: MatDialog, public router: Router) {}

    ngAfterViewInit() {
        const drawingCanvas = this.drawnCanvas.nativeElement;
        this.drawCtx = drawingCanvas.getContext('2d');

        const rectangleCanvas = this.rectCanvas.nativeElement;
        this.rectCtx = rectangleCanvas.getContext('2d');
    }

    getTitle(title: string): void {
        this.gameTitle = title;
    }

    openModal() {
        const dialogRef = this.matDialog.open(ModalPageComponent, {
            data: {
                image: this.image,
                difference: this.differenceNumber,
                difficulty: this.difficulty,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            result.image = '';
            this.router.navigate(['/config']);
        });
    }

    clearSingleFile(canvas: HTMLCanvasElement, id: string): void {
        const context = canvas.getContext('2d');
        const input = document.getElementById(id) as HTMLInputElement;
        const bothInput = document.getElementById('upload-both') as HTMLInputElement;
        input.value = '';
        bothInput.value = '';
        if (context) context.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    }

    clearFirstFile(canvas: HTMLCanvasElement, id: string): void {
        this.originalFile = null;
        this.clearSingleFile(canvas, id);
    }

    clearSecondFile(canvas: HTMLCanvasElement, id: string): void {
        this.differentFile = null;
        this.clearSingleFile(canvas, id);
        this.drawCtx.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    }

    fileValidation(e: Event): void {
        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (file !== undefined && file.size === IMAGE_DIMENSIONS.size && file.type === 'image/bmp') {
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
                    if (ogContext) ogContext.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
                    this.originalFile = target.files[0];
                } else if (target.id === this.differentId) {
                    if (diffContext) diffContext.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
                    this.differentFile = target.files[0];
                } else {
                    if (ogContext && diffContext) {
                        ogContext.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
                        diffContext.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
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

    mergeCanvas() {
        const diffContext = this.myDiffCanvas.nativeElement.getContext('2d');
        diffContext.drawImage(this.drawnCanvas.nativeElement, 0, 0);
        // this.drawCtx.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height); // just here to verify that merge works well
        const binaryData = new Uint8Array(
            this.myDiffCanvas.nativeElement
                .toDataURL('image/bmp')
                .split(',')[1]
                .split('')
                .map((c: string) => c.charCodeAt(0)),
        );
        const blob = new Blob([binaryData], { type: 'image/bmp' });
        this.differentFile = new File([blob], 'mergedImage.bmp', { type: 'image/bmp' });
    }

    async save(): Promise<void> {
        if (this.saveVerification() && this.originalFile && this.differentFile) {
            console.log(this.differentFile);
            this.mergeCanvas();
            console.log(this.differentFile);

            this.isDisabled = true;
            // this.gameCardService.uploadImages(this.originalFile, this.differentFile, this.radius).subscribe((data) => {
            //     if (data.gameDifferenceNumber) {
            //         this.createdGameInfo = {
            //             _id: data.gameId,
            //             name: this.gameTitle,
            //             difficulty: data.gameDifficulty,
            //             baseImage: data.originalImageName,
            //             differenceImage: data.differenceImageName,
            //             radius: this.radius,
            //             differenceNumber: data.gameDifferenceNumber,
            //         };
            //         this.difficulty = data.gameDifficulty;
            //         this.differenceNumber = data.gameDifferenceNumber;
            //         this.image = `${STAGE}/image/difference-image.bmp`;
            //         this.gameCardService.createGame(this.createdGameInfo).subscribe();
            //         this.openModal();
            //     } else {
            //         this.isDisabled = false;
            //         alert("La partie n'a pas été créée. Vous devez avoir entre 3 et 9 différences");
            //     }
            // });
        }
    }

    startRec(e: MouseEvent) {
        const canvasRect = this.rectCanvas.nativeElement.getBoundingClientRect();

        this.isUserClicking = true;
        this.rectInitialPosX = e.clientX - canvasRect.left;
        this.rectInitialPosY = e.clientY - canvasRect.top;
    }

    stopRec() {
        this.isUserClicking = false;
        this.drawCtx.drawImage(this.rectCanvas.nativeElement, 0, 0);
        this.rectCtx.clearRect(0, 0, this.rectCanvas.nativeElement.width, this.rectCanvas.nativeElement.height);
    }

    paintRectangle(e: MouseEvent) {
        if (this.isUserClicking) {
            console.log('coucou');
            const canvasRect = this.rectCanvas.nativeElement.getBoundingClientRect();
            this.rectCtx.fillStyle = this.color;
            this.rectCtx.clearRect(0, 0, this.rectCanvas.nativeElement.width, this.rectCanvas.nativeElement.height); // Clears the previous canvas
            this.rectCtx.fillRect(
                this.rectInitialPosX,
                this.rectInitialPosY,
                e.clientX - canvasRect.left - this.rectInitialPosX,
                e.clientY - canvasRect.top - this.rectInitialPosY,
            );
        }
    }

    drawRectangle() {
        console.log('inDrawRectangle', this);

        this.listener = this.startRec.bind(this);
        this.rectCanvas.nativeElement.addEventListener('mousedown', this.listener);

        this.listener = this.stopRec.bind(this);
        this.rectCanvas.nativeElement.addEventListener('mouseup', this.listener);

        this.listener = this.paintRectangle.bind(this);
        this.rectCanvas.nativeElement.addEventListener('mousemove', this.listener);
    }

    startPen() {
        this.isUserClicking = true;
    }

    stopPen() {
        this.isUserClicking = false;
        this.drawCtx.beginPath();
    }

    writing(e: MouseEvent) {
        if (this.isUserClicking) {
            const canvasRect = this.drawnCanvas.nativeElement.getBoundingClientRect();

            this.drawCtx.lineWidth = 10;
            this.drawCtx.lineCap = 'round';
            this.drawCtx.strokeStyle = this.color;

            this.drawCtx.lineTo(e.clientX - canvasRect.left, e.clientY - canvasRect.top);
            this.drawCtx.stroke();
            this.drawCtx.beginPath();
            this.drawCtx.moveTo(e.clientX - canvasRect.left, e.clientY - canvasRect.top);
        }
    }

    drawPen() {
        this.listener = this.startPen.bind(this);
        this.drawnCanvas.nativeElement.addEventListener('mousedown', this.listener);

        this.listener = this.stopPen.bind(this);
        this.drawnCanvas.nativeElement.addEventListener('mouseup', this.listener);

        this.listener = this.writing.bind(this);
        this.drawnCanvas.nativeElement.addEventListener('mousemove', this.listener);
    }

    startErase(e: MouseEvent) {
        this.isUserClicking = true;
        const canvasRect = this.drawnCanvas.nativeElement.getBoundingClientRect();
        this.drawCtx.clearRect(e.clientX - canvasRect.left, e.clientY - canvasRect.top, 10, 10);
    }

    stopErase() {
        this.isUserClicking = false;
    }

    erasing(e: MouseEvent) {
        if (this.isUserClicking) {
            const canvasRect = this.drawnCanvas.nativeElement.getBoundingClientRect();
            this.drawCtx.clearRect(e.clientX - canvasRect.left, e.clientY - canvasRect.top, 10, 10);
        }
    }

    erase() {
        this.listener = this.startErase.bind(this);
        this.drawnCanvas.nativeElement.addEventListener('mousedown', this.listener);
        this.listener = this.stopErase.bind(this);
        this.drawnCanvas.nativeElement.addEventListener('mouseup', this.listener);
        this.listener = this.erasing.bind(this);
        this.drawnCanvas.nativeElement.addEventListener('mousemove', this.listener);
    }

    removingListeners() {
        this.rectCanvas.nativeElement.removeEventListener('mousedown', this.listener);
        this.rectCanvas.nativeElement.removeEventListener('mouseup', this.listener);
        this.rectCanvas.nativeElement.removeEventListener('mousemove', this.listener);

        this.drawnCanvas.nativeElement.removeEventListener('mousedown', this.listener);
        this.drawnCanvas.nativeElement.removeEventListener('mouseup', this.listener);
        this.drawnCanvas.nativeElement.removeEventListener('mousemove', this.listener);

        this.drawnCanvas.nativeElement.removeEventListener('mousedown', this.listener);
        this.drawnCanvas.nativeElement.removeEventListener('mouseup', this.listener);
        this.drawnCanvas.nativeElement.removeEventListener('mousemove', this.listener);
    }

    changeZindex() {
        if (this.isRectEnabled) {
            this.canvas2ZIndex = 3;
            this.canvas1ZIndex = 2;
        } else {
            this.canvas2ZIndex = 2;
            this.canvas1ZIndex = 3;
        }
    }

    toggleButton(id: string) {
        this.removingListeners();

        switch (id) {
            case 'pen':
                this.isRectEnabled = false;
                this.changeZindex();
                this.drawPen();

                break;
            case 'rectangle':
                this.isRectEnabled = true;
                this.changeZindex();
                this.drawRectangle();

                break;
            case 'erase':
                this.isRectEnabled = false;
                this.changeZindex();
                this.erase();
                break;
        }
    }
}
