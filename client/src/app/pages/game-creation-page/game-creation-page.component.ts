/* eslint-disable max-lines */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalPageComponent } from '@app/modals/modal-page/modal-page.component';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { STAGE } from '@app/services/server-routes';
import { GameCardDto } from '@common/game-card.dto';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { GC_PATHS } from './game-creation-constants';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    @ViewChild('canvas1') myOgCanvas: ElementRef;
    @ViewChild('canvas2') myDiffCanvas: ElementRef;

    @ViewChild('drawingCanvas1') ogDrawnCanvas: ElementRef;
    @ViewChild('drawingCanvas2') diffDrawnCanvas: ElementRef;
    @ViewChild('drawingCanvas3') diffRectCanvas: ElementRef;
    @ViewChild('drawingCanvas4') ogRectCanvas: ElementRef;

    drawingCanvas1: HTMLCanvasElement;
    drawingCanvas2: HTMLCanvasElement;

    canvas1ZIndex: number = 3;
    canvas2ZIndex: number = 2;

    isRectEnabled: boolean = false;
    isPenEnabled: boolean = false;
    isEraserEnabled: boolean = false;
    isDuplicateEnabled: boolean = false;

    isUserClicking: boolean = false;
    rectInitialPosX: number;
    rectInitialPosY: number;

    color: string = '#ff124f';
    penSize: number = 10;
    eraserSize: number = 50;
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

    canvasArray: string[] = [];
    nbElements: number = 0;

    isInOgCanvas: boolean = false;

    private listener: (e: MouseEvent) => void;
    private listener2: (e: MouseEvent) => void;

    constructor(public gameCardService: GameCardInformationService, private matDialog: MatDialog, public router: Router) {
        // const emptyCanvas = document.createElement('canvas');
        // emptyCanvas.width = 640;
        // emptyCanvas.height = 480;
        // this.canvasArray.push(emptyCanvas.toDataURL());
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

        const drawCtx = this.ogDrawnCanvas.nativeElement.getContext('2d');
        drawCtx.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    }

    clearSecondFile(canvas: HTMLCanvasElement, id: string): void {
        this.differentFile = null;
        this.clearSingleFile(canvas, id);

        const drawCtx = this.diffDrawnCanvas.nativeElement.getContext('2d');
        drawCtx.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
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

    // async mergeCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
    //     const diffContext = canvas.getContext('2d');
    //     if (diffContext) diffContext.drawImage(canvas, 0, 0);
    //     return await this.createBlob(canvas);
    // }

    // async createBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             const imageData = canvas.toDataURL('image/bmp');
    //             const byteString = atob(imageData.split(',')[1]);
    //             const arrayBuffer = new ArrayBuffer(byteString.length);
    //             const uint8Array = new Uint8Array(arrayBuffer);
    //             for (let i = 0; i < byteString.length; i++) {
    //                 uint8Array[i] = byteString.charCodeAt(i);
    //             }
    //             resolve(new Blob([uint8Array], { type: 'image/bmp' }));
    //         }, 5000);
    //     });
    // }
    mergeCanvas(canvas: HTMLCanvasElement, canvas2: HTMLCanvasElement): Blob {
        console.log('canvas', canvas);
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(canvas2, 0, 0);
            console.log('tes');
        }
        console.log('canvas', canvas);

        return this.createBlob(canvas);
    }
    createBlob(canvas: HTMLCanvasElement): Blob {
        const imageData = canvas.toDataURL('image/bmp');
        const byteString = atob(imageData.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        return new Blob([uint8Array], { type: 'image/bmp' });
    }

    async save() {
        if (this.saveVerification() && this.originalFile && this.differentFile) {
            // this.isDisabled = true;
            const originalBlob = await this.mergeCanvas(this.myOgCanvas.nativeElement, this.ogDrawnCanvas.nativeElement);
            const differenceBlob = await this.mergeCanvas(this.myDiffCanvas.nativeElement, this.diffDrawnCanvas.nativeElement);
            this.gameCardService.uploadImages(originalBlob, differenceBlob, this.radius).subscribe((data) => {
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

    choseCanvas(e: MouseEvent) {
        if ([this.diffRectCanvas.nativeElement, this.diffDrawnCanvas.nativeElement].includes(e.target)) {
            console.log('in diff canvas');
            this.isInOgCanvas = false;
            this.drawingCanvas1 = this.diffDrawnCanvas.nativeElement;
            this.drawingCanvas2 = this.diffRectCanvas.nativeElement;
        } else if ([this.ogRectCanvas.nativeElement, this.ogDrawnCanvas.nativeElement].includes(e.target)) {
            console.log('in og canvas');
            this.isInOgCanvas = true;
            this.drawingCanvas1 = this.ogDrawnCanvas.nativeElement;
            this.drawingCanvas2 = this.ogRectCanvas.nativeElement;
        }
    }

    startRec(e: MouseEvent) {
        const canvasRect = this.drawingCanvas2.getBoundingClientRect();

        this.isUserClicking = true;
        this.rectInitialPosX = e.clientX - canvasRect.left;
        this.rectInitialPosY = e.clientY - canvasRect.top;
    }

    stopRec() {
        const ctx1 = this.drawingCanvas1.getContext('2d');
        const ctx2 = this.drawingCanvas2.getContext('2d');

        this.isUserClicking = false;
        if (ctx1) ctx1.drawImage(this.drawingCanvas2, 0, 0);
        if (ctx2) ctx2.clearRect(0, 0, this.drawingCanvas2.width, this.drawingCanvas2.height);
    }

    paintRectangle(e: MouseEvent) {
        this.choseCanvas(e);
        const ctx2 = this.drawingCanvas2.getContext('2d');
        if (ctx2 && this.isUserClicking) {
            const canvasRect = this.drawingCanvas2.getBoundingClientRect();
            ctx2.fillStyle = this.color;
            ctx2.clearRect(0, 0, this.drawingCanvas2.width, this.drawingCanvas2.height); // Clears the previous canvas

            ctx2.fillRect(
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
        this.ogRectCanvas.nativeElement.addEventListener('mousedown', this.listener);
        this.diffRectCanvas.nativeElement.addEventListener('mousedown', this.listener);

        this.listener = this.stopRec.bind(this);
        this.ogRectCanvas.nativeElement.addEventListener('mouseup', this.listener);
        this.diffRectCanvas.nativeElement.addEventListener('mouseup', this.listener);

        this.listener = this.paintRectangle.bind(this);
        this.ogRectCanvas.nativeElement.addEventListener('mousemove', this.listener);
        this.diffRectCanvas.nativeElement.addEventListener('mousemove', this.listener);
    }

    startPen() {
        console.log('starting drawing');
        this.isUserClicking = true;
    }

    stopPen() {
        console.log('stopped writing');
        const ctx1 = this.drawingCanvas1.getContext('2d');
        if (ctx1) {
            this.isUserClicking = false;
            ctx1.beginPath();
        }

        // this.nbElements++;
        // this.canvasArray.push(this.drawingCanvas1.toDataURL());

        this.pushCanvas(this.drawingCanvas1);
    }

    writing(e: MouseEvent) {
        this.choseCanvas(e);
        const ctx1 = this.drawingCanvas1.getContext('2d');

        if (ctx1 && this.isUserClicking) {
            const canvasRect = this.drawingCanvas1.getBoundingClientRect();

            ctx1.lineWidth = this.penSize;
            ctx1.lineCap = 'round';
            ctx1.strokeStyle = this.color;

            ctx1.lineTo(e.clientX - canvasRect.left, e.clientY - canvasRect.top);
            ctx1.stroke();
            ctx1.beginPath();
            ctx1.moveTo(e.clientX - canvasRect.left, e.clientY - canvasRect.top);
        }
    }

    drawPen() {
        this.listener = this.startPen.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mousedown', this.listener);
        this.diffDrawnCanvas.nativeElement.addEventListener('mousedown', this.listener);

        this.listener = this.stopPen.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mouseup', this.listener);
        this.diffDrawnCanvas.nativeElement.addEventListener('mouseup', this.listener);

        this.listener = this.writing.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mousemove', this.listener);
        this.diffDrawnCanvas.nativeElement.addEventListener('mousemove', this.listener);
    }

    startErase(e: MouseEvent) {
        this.isUserClicking = true;
        const ctx1 = this.drawingCanvas1.getContext('2d');

        const canvasRect = this.drawingCanvas1.getBoundingClientRect();

        if (ctx1)
            ctx1.clearRect(
                e.clientX - canvasRect.left - this.eraserSize / 2,
                e.clientY - canvasRect.top - this.eraserSize / 2,
                this.eraserSize,
                this.eraserSize,
            );
    }

    stopErase() {
        this.isUserClicking = false;
    }

    erasing(e: MouseEvent) {
        this.choseCanvas(e);
        const ctx1 = this.drawingCanvas1.getContext('2d');

        if (ctx1 && this.isUserClicking) {
            const canvasRect = this.drawingCanvas1.getBoundingClientRect();
            ctx1.clearRect(
                e.clientX - canvasRect.left - this.eraserSize / 2,
                e.clientY - canvasRect.top - this.eraserSize / 2,
                this.eraserSize,
                this.eraserSize,
            );
        }
    }

    erase() {
        this.listener2 = this.startErase.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mousedown', this.listener2);
        this.diffDrawnCanvas.nativeElement.addEventListener('mousedown', this.listener2);

        this.listener = this.stopErase.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mouseup', this.listener);
        this.diffDrawnCanvas.nativeElement.addEventListener('mouseup', this.listener);

        this.listener = this.erasing.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mousemove', this.listener);
        this.diffDrawnCanvas.nativeElement.addEventListener('mousemove', this.listener);
    }

    removingListeners() {
        this.ogRectCanvas.nativeElement.removeEventListener('mousedown', this.listener);
        this.diffRectCanvas.nativeElement.removeEventListener('mousedown', this.listener);
        this.ogRectCanvas.nativeElement.removeEventListener('mouseup', this.listener);
        this.diffRectCanvas.nativeElement.removeEventListener('mouseup', this.listener);
        this.ogRectCanvas.nativeElement.removeEventListener('mousemove', this.listener);
        this.diffRectCanvas.nativeElement.removeEventListener('mousemove', this.listener);

        this.ogDrawnCanvas.nativeElement.removeEventListener('mousedown', this.listener);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mousedown', this.listener);
        this.ogDrawnCanvas.nativeElement.removeEventListener('mouseup', this.listener);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mouseup', this.listener);
        this.ogDrawnCanvas.nativeElement.removeEventListener('mousemove', this.listener);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mousemove', this.listener);

        this.ogDrawnCanvas.nativeElement.removeEventListener('mousedown', this.listener2);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mousedown', this.listener2);
        this.ogDrawnCanvas.nativeElement.removeEventListener('mouseup', this.listener);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mouseup', this.listener);
        this.ogDrawnCanvas.nativeElement.removeEventListener('mousemove', this.listener);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mousemove', this.listener);
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
                this.isPenEnabled = !this.isPenEnabled;
                this.isRectEnabled = false;
                this.isEraserEnabled = false;
                this.isDuplicateEnabled = false;
                this.changeZindex();
                if (this.isPenEnabled) this.drawPen();

                break;
            case 'rectangle':
                this.isRectEnabled = !this.isRectEnabled;
                this.isPenEnabled = false;
                this.isEraserEnabled = false;
                this.isDuplicateEnabled = false;
                console.log(this.isRectEnabled);
                this.changeZindex();
                if (this.isRectEnabled) this.drawRectangle();

                break;
            case 'erase':
                this.isEraserEnabled = !this.isEraserEnabled;
                this.isPenEnabled = false;
                this.isRectEnabled = false;
                this.isDuplicateEnabled = false;
                this.changeZindex();
                if (this.isEraserEnabled) this.erase();
                break;
            case 'duplicate':
                this.isDuplicateEnabled = !this.isDuplicateEnabled;
                this.isPenEnabled = false;
                this.isRectEnabled = false;
                this.isEraserEnabled = false;
                break;
        }
    }

    invert() {
        const ctxDiffDrawing = this.diffDrawnCanvas.nativeElement.getContext('2d');
        const ctxOgDrawing = this.ogDrawnCanvas.nativeElement.getContext('2d');
        const ctxOgRectangle = this.ogRectCanvas.nativeElement.getContext('2d');

        if (ctxOgRectangle) ctxOgRectangle.drawImage(this.diffDrawnCanvas.nativeElement, 0, 0);

        if (ctxDiffDrawing) {
            ctxDiffDrawing.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            ctxDiffDrawing.drawImage(this.ogDrawnCanvas.nativeElement, 0, 0);
        }

        if (ctxOgDrawing) {
            ctxOgDrawing.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            ctxOgDrawing.drawImage(this.ogRectCanvas.nativeElement, 0, 0);
        }

        if (ctxOgRectangle) ctxOgRectangle.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    }

    duplicate(side: string) {
        const ctxDiffDrawing = this.diffDrawnCanvas.nativeElement.getContext('2d');
        const ctxOgDrawing = this.ogDrawnCanvas.nativeElement.getContext('2d');

        if (side === 'right') {
            console.log('right');
            ctxDiffDrawing.drawImage(this.ogDrawnCanvas.nativeElement, 0, 0);
        } else if (side === 'left') {
            console.log('left');
            ctxOgDrawing.drawImage(this.diffDrawnCanvas.nativeElement, 0, 0);
        }
    }

    pushCanvas(canvas: HTMLCanvasElement) {
        this.nbElements++;
        if (this.nbElements < this.canvasArray.length) {
            this.canvasArray.length = this.nbElements;
        }

        this.canvasArray.push(canvas.toDataURL());
    }

    undo() {
        console.log('nb éléments : ', this.nbElements);
        for (let i = 0; i < this.nbElements; i++) {
            console.log('canvas#', i, ': ', this.canvasArray[i]);
        }

        if (this.nbElements > 0) {
            const ctxOgDrawing = this.ogDrawnCanvas.nativeElement.getContext('2d');
            const canvasPic = new Image();
            this.nbElements--;

            console.log('nb éléments : ', this.nbElements);
            console.log(this.canvasArray[this.nbElements]);

            ctxOgDrawing.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            canvasPic.src = this.canvasArray[this.nbElements] as string;
            canvasPic.onload = () => {
                ctxOgDrawing.drawImage(canvasPic, 0, 0);
            };
        }
    }
}
