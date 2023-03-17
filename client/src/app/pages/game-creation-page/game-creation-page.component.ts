/* eslint-disable max-lines */
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalPageComponent } from '@app/modals/modal-page/modal-page.component';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameCardDto } from '@common/game-card.dto';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { GC_PATHS } from './game-creation-constants';

const PEN_SIZE = 10;
const ERASER_SIZE = 50;

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    @ViewChild('canvas1') originalCanvas: ElementRef;
    @ViewChild('canvas2') differenceCanvas: ElementRef;

    @ViewChild('drawingCanvas1') originalDrawnCanvas: ElementRef;
    @ViewChild('drawingCanvas2') differenceDrawnCanvas: ElementRef;
    @ViewChild('drawingCanvas3') differenceRectangleCanvas: ElementRef;
    @ViewChild('drawingCanvas4') originalRectangleCanvas: ElementRef;

    drawingCanvas1: HTMLCanvasElement;
    drawingCanvas2: HTMLCanvasElement;

    canvas1ZIndex: number = 3;
    canvas2ZIndex: number = 2;

    isRectangleEnabled: boolean = false;
    isPenEnabled: boolean = false;
    isEraserEnabled: boolean = false;
    isDuplicateEnabled: boolean = false;
    isClearEnabled: boolean = false;
    isUserClicking: boolean = false;

    rectangleInitialX: number;
    rectangleInitialY: number;

    selectedColor: string = '#ff124f';
    penSize: number = PEN_SIZE;
    eraserSize: number = ERASER_SIZE;
    readonly paths = GC_PATHS;

    gameTitle: string = '';
    originalFile: File | null = null;
    differentFile: File | null = null;
    differenceRadius: number = 3;

    originalId: string = 'upload-original';
    differentId: string = 'upload-different';

    isSaveDisabled = false;
    differenceImage: string = '';
    differenceNumber: number = 0;
    difficulty: string = '';

    createdGameInfo: GameCardDto;

    rightCanvasArray: string[] = [];
    leftCanvasArray: string[] = [];
    actionsArray: boolean[] = [];
    nbElements: number = 0;
    leftArrayPointer: number = 0;
    rightArrayPointer: number = 0;
    isFirstTimeInRightCanvas: boolean = true;
    isFirstTimeInLeftCanvas: boolean = true;

    isInOriginalCanvas: boolean = false;

    private eraseListener: ((mouseEvent: MouseEvent) => void)[] = [this.startErase.bind(this), this.stopErase.bind(this), this.erasing.bind(this)];
    private rectangleListener: ((mouseEvent: MouseEvent) => void)[] = [
        this.startDrawingRectangle.bind(this),
        this.stopDrawingRectangle.bind(this),
        this.paintRectangle.bind(this),
    ];
    private penListener: ((mouseEvent: MouseEvent) => void)[] = [this.startPen.bind(this), this.stopPen.bind(this), this.writing.bind(this)];

    constructor(public gameCardService: GameCardInformationService, private matDialog: MatDialog, public router: Router) {}

    @HostListener('document:keydown.control.z', ['$event'])
    onCtrlZ(event: KeyboardEvent) {
        event.preventDefault();
        this.undo();
    }

    @HostListener('document:keydown.control.shift.z', ['$event'])
    onCtrlShiftZ(event: KeyboardEvent) {
        event.preventDefault();
        this.redo();
    }

    ngOnInit(): void {
        const emptyCanvas = document.createElement('canvas');
        emptyCanvas.width = IMAGE_DIMENSIONS.width;
        emptyCanvas.height = IMAGE_DIMENSIONS.height;

        this.leftCanvasArray.push(emptyCanvas.toDataURL());
        this.rightCanvasArray.push(emptyCanvas.toDataURL());
    }

    getTitle(title: string): void {
        this.gameTitle = title;
    }

    consoleStuff() {
        // const right = this.rightCanvasArray;
        // console.log('this.rightCanvasArray', this.rightCanvasArray);
        // console.log('this.rightArrayPointer', right);
        // console.log('this.leftCanvasArray', this.leftCanvasArray);
        // console.log('this.leftArrayPointer', this.leftArrayPointer);
        // console.log('this.actionsArray', this.actionsArray);
        // console.log('this.nbElements', this.nbElements);
    }

    openSaveModal() {
        const dialogRef = this.matDialog.open(ModalPageComponent, {
            data: {
                differenceImage: this.differenceImage,
                difference: this.differenceNumber,
                difficulty: this.difficulty,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            result.differenceImage = '';
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
        const ogContext = this.originalCanvas.nativeElement.getContext('2d');
        const diffContext = this.differenceCanvas.nativeElement.getContext('2d');
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
            alert('Il manque une differenceImage et un titre à votre jeu !');
            return false;
        } else if (this.gameTitle === '') {
            alert("N'oubliez pas d'ajouter un titre à votre jeu !");
            return false;
        } else if (this.originalFile === null || this.differentFile === null) {
            alert('Un jeu de différences sans differenceImage est pour ainsi dire... intéressant ? Ajoutez une differenceImage.');
            return false;
        }
        return true;
    }

    mergeCanvas(): void {
        // const diffContext = this.differenceCanvas.nativeElement.getContext('2d');
        // diffContext.drawImage(this.differenceDrawnCanvas.nativeElement, 0, 0);
        // this.drawCtx.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height); // just here to verify that merge works well
        const binaryData = new Uint8Array(
            this.differenceCanvas.nativeElement
                .toDataURL('differenceImage/bmp')
                .split(',')[1]
                .split('')
                .map((c: string) => c.charCodeAt(0)),
        );
        const blob = new Blob([binaryData], { type: 'differenceImage/bmp' });
        this.differentFile = new File([blob], 'mergedImage.bmp', { type: 'differenceImage/bmp' });
    }

    async save(): Promise<void> {
        if (this.saveVerification() && this.originalFile && this.differentFile) {
            console.log(this.differentFile);
            this.mergeCanvas();
            console.log(this.differentFile);

            this.isSaveDisabled = true;
            // this.gameCardService.uploadImages(this.originalFile, this.differentFile, this.differenceRadius).subscribe((data) => {
            //     if (data.gameDifferenceNumber) {
            //         this.createdGameInfo = {
            //             _id: data.gameId,
            //             name: this.gameTitle,
            //             difficulty: data.gameDifficulty,
            //             baseImage: data.originalImageName,
            //             differenceImage: data.differenceImageName,
            //             differenceRadius: this.differenceRadius,
            //             differenceNumber: data.gameDifferenceNumber,
            //         };
            //         this.difficulty = data.gameDifficulty;
            //         this.differenceNumber = data.gameDifferenceNumber;
            //         this.differenceImage = `${STAGE}/differenceImage/difference-differenceImage.bmp`;
            //         this.gameCardService.createGame(this.createdGameInfo).subscribe();
            //         this.openSaveModal();
            //     } else {
            //         this.isSaveDisabled = false;
            //         alert("La partie n'a pas été créée. Vous devez avoir entre 3 et 9 différences");
            //     }
            // });
        }
    }

    choseCanvas(mouseEvent: MouseEvent): void {
        if ([this.differenceRectangleCanvas.nativeElement, this.differenceDrawnCanvas.nativeElement].includes(mouseEvent.target)) {
            this.isInOriginalCanvas = false;
            this.drawingCanvas1 = this.differenceDrawnCanvas.nativeElement;
            this.drawingCanvas2 = this.differenceRectangleCanvas.nativeElement;
        } else if ([this.originalRectangleCanvas.nativeElement, this.originalDrawnCanvas.nativeElement].includes(mouseEvent.target)) {
            this.isInOriginalCanvas = true;
            this.drawingCanvas1 = this.originalDrawnCanvas.nativeElement;
            this.drawingCanvas2 = this.originalRectangleCanvas.nativeElement;
        }
    }

    startDrawingRectangle(mouseEvent: MouseEvent): void {
        const canvas = this.drawingCanvas2.getBoundingClientRect();
        this.isUserClicking = true;

        this.rectangleInitialX = mouseEvent.clientX - canvas.left;
        this.rectangleInitialY = mouseEvent.clientY - canvas.top;
    }

    stopDrawingRectangle(): void {
        const firstContext = this.drawingCanvas1.getContext('2d');
        const secondContext = this.drawingCanvas2.getContext('2d');
        this.isUserClicking = false;

        if (firstContext) firstContext.drawImage(this.drawingCanvas2, 0, 0);
        if (secondContext) secondContext.clearRect(0, 0, this.drawingCanvas2.width, this.drawingCanvas2.height);

        this.pushCanvas(this.drawingCanvas1);
    }

    paintRectangle(mouseEvent: MouseEvent): void {
        this.choseCanvas(mouseEvent);
        const context = this.drawingCanvas2.getContext('2d');

        if (context && this.isUserClicking) {
            const canvas = this.drawingCanvas2.getBoundingClientRect();
            context.fillStyle = this.selectedColor;
            context.clearRect(0, 0, this.drawingCanvas2.width, this.drawingCanvas2.height);

            const width = mouseEvent.clientX - canvas.left - this.rectangleInitialX;
            const height = mouseEvent.clientY - canvas.top - this.rectangleInitialY;

            if (mouseEvent.shiftKey) {
                const size = Math.min(Math.abs(width), Math.abs(height));
                const signX = Math.sign(width);
                const signY = Math.sign(height);
                context.fillRect(this.rectangleInitialX, this.rectangleInitialY, size * signX, size * signY);
            } else {
                context.fillRect(this.rectangleInitialX, this.rectangleInitialY, width, height);
            }
        }
    }

    drawRectangle(): void {
        this.originalRectangleCanvas.nativeElement.addEventListener('mousedown', this.rectangleListener[0]);
        this.differenceRectangleCanvas.nativeElement.addEventListener('mousedown', this.rectangleListener[0]);

        this.originalRectangleCanvas.nativeElement.addEventListener('mouseup', this.rectangleListener[1]);
        this.differenceRectangleCanvas.nativeElement.addEventListener('mouseup', this.rectangleListener[1]);

        this.originalRectangleCanvas.nativeElement.addEventListener('mousemove', this.rectangleListener[2]);
        this.differenceRectangleCanvas.nativeElement.addEventListener('mousemove', this.rectangleListener[2]);
    }

    startPen(mouseEvent: MouseEvent): void {
        this.isUserClicking = true;
        const context = this.drawingCanvas1.getContext('2d');
        const canvas = this.drawingCanvas1.getBoundingClientRect();

        if (context) {
            context.lineWidth = this.penSize;
            context.lineCap = 'round';
            context.strokeStyle = this.selectedColor;
            context.beginPath();
            context.arc(mouseEvent.clientX - canvas.left, mouseEvent.clientY - canvas.top, 0, 0, 2 * Math.PI);
            context.stroke();
            context.beginPath();
        }
    }

    stopPen() {
        // console.log('stopped writing');
        const ctx1 = this.drawingCanvas1.getContext('2d');
        if (ctx1) {
            this.isUserClicking = false;
            ctx1.beginPath();
        }
        // this.savePixels();
        this.pushCanvas(this.drawingCanvas1);
        console.log('finished drawing');
        this.consoleStuff();
    }

    writing(e: MouseEvent) {
        this.choseCanvas(e);
        const ctx1 = this.drawingCanvas1.getContext('2d');

        if (ctx1 && this.isUserClicking) {
            const canvasRect = this.drawingCanvas1.getBoundingClientRect();

            ctx1.lineWidth = this.penSize;
            ctx1.lineCap = 'round';
            ctx1.strokeStyle = this.selectedColor;

            ctx1.lineTo(e.clientX - canvasRect.left, e.clientY - canvasRect.top);
            ctx1.stroke();
            ctx1.beginPath();
            ctx1.moveTo(e.clientX - canvasRect.left, e.clientY - canvasRect.top);

            // this.drawingActions.push({
            //     position: this.isInOgCanvas,
            //     data: [e.clientX - e.clientY - canvasRect.top],
            // });
        }
    }

    drawPen() {
        // this.penListener = this.startPen.bind(this);
        this.originalDrawnCanvas.nativeElement.addEventListener('mousedown', this.penListener[0]);
        this.differenceDrawnCanvas.nativeElement.addEventListener('mousedown', this.penListener[0]);

        // this.penListener = this.stopPen.bind(this);
        this.originalDrawnCanvas.nativeElement.addEventListener('mouseup', this.penListener[1]);
        this.differenceDrawnCanvas.nativeElement.addEventListener('mouseup', this.penListener[1]);

        // this.penListener = this.writing.bind(this);
        this.originalDrawnCanvas.nativeElement.addEventListener('mousemove', this.penListener[2]);
        this.differenceDrawnCanvas.nativeElement.addEventListener('mousemove', this.penListener[2]);
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
        this.pushCanvas(this.drawingCanvas1);
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
        // this.eraseListener = this.startErase.bind(this);
        this.originalDrawnCanvas.nativeElement.addEventListener('mousedown', this.eraseListener[0]);
        this.differenceDrawnCanvas.nativeElement.addEventListener('mousedown', this.eraseListener[0]);

        // this.eraseListener = this.stopErase.bind(this);
        this.originalDrawnCanvas.nativeElement.addEventListener('mouseup', this.eraseListener[1]);
        this.differenceDrawnCanvas.nativeElement.addEventListener('mouseup', this.eraseListener[1]);

        // this.eraseListener = this.erasing.bind(this);
        this.originalDrawnCanvas.nativeElement.addEventListener('mousemove', this.eraseListener[2]);
        this.differenceDrawnCanvas.nativeElement.addEventListener('mousemove', this.eraseListener[2]);
    }

    removingListeners() {
        this.originalRectangleCanvas.nativeElement.removeEventListener('mousedown', this.rectangleListener[0]);
        this.differenceRectangleCanvas.nativeElement.removeEventListener('mousedown', this.rectangleListener[0]);
        this.originalRectangleCanvas.nativeElement.removeEventListener('mouseup', this.rectangleListener[1]);
        this.differenceRectangleCanvas.nativeElement.removeEventListener('mouseup', this.rectangleListener[1]);
        this.originalRectangleCanvas.nativeElement.removeEventListener('mousemove', this.rectangleListener[2]);
        this.differenceRectangleCanvas.nativeElement.removeEventListener('mousemove', this.rectangleListener[2]);

        this.originalDrawnCanvas.nativeElement.removeEventListener('mousedown', this.penListener[0]);
        this.differenceDrawnCanvas.nativeElement.removeEventListener('mousedown', this.penListener[0]);
        this.originalDrawnCanvas.nativeElement.removeEventListener('mouseup', this.penListener[1]);
        this.differenceDrawnCanvas.nativeElement.removeEventListener('mouseup', this.penListener[1]);
        this.originalDrawnCanvas.nativeElement.removeEventListener('mousemove', this.penListener[2]);
        this.differenceDrawnCanvas.nativeElement.removeEventListener('mousemove', this.penListener[2]);

        this.originalDrawnCanvas.nativeElement.removeEventListener('mousedown', this.eraseListener[0]);
        this.differenceDrawnCanvas.nativeElement.removeEventListener('mousedown', this.eraseListener[0]);
        this.originalDrawnCanvas.nativeElement.removeEventListener('mouseup', this.eraseListener[1]);
        this.differenceDrawnCanvas.nativeElement.removeEventListener('mouseup', this.eraseListener[1]);
        this.originalDrawnCanvas.nativeElement.removeEventListener('mousemove', this.eraseListener[2]);
        this.differenceDrawnCanvas.nativeElement.removeEventListener('mousemove', this.eraseListener[2]);
    }

    changeZindex() {
        if (this.isRectangleEnabled) {
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
                this.isRectangleEnabled = false;
                this.isEraserEnabled = false;
                this.isDuplicateEnabled = false;
                this.isClearEnabled = false;
                this.changeZindex();
                if (this.isPenEnabled) this.drawPen();

                break;
            case 'rectangle':
                this.isRectangleEnabled = !this.isRectangleEnabled;
                this.isPenEnabled = false;
                this.isEraserEnabled = false;
                this.isDuplicateEnabled = false;
                this.isClearEnabled = false;
                this.changeZindex();
                if (this.isRectangleEnabled) this.drawRectangle();

                break;
            case 'erase':
                this.isEraserEnabled = !this.isEraserEnabled;
                this.isPenEnabled = false;
                this.isRectangleEnabled = false;
                this.isDuplicateEnabled = false;
                this.isClearEnabled = false;

                this.changeZindex();
                if (this.isEraserEnabled) this.erase();
                break;
            case 'duplicate':
                this.isDuplicateEnabled = !this.isDuplicateEnabled;
                this.isPenEnabled = false;
                this.isRectangleEnabled = false;
                this.isEraserEnabled = false;
                this.isClearEnabled = false;

                break;
            case 'clear':
                this.isClearEnabled = !this.isClearEnabled;
                this.isPenEnabled = false;
                this.isRectangleEnabled = false;
                this.isEraserEnabled = false;
                this.isDuplicateEnabled = false;

                break;
        }
    }

    invert() {
        const ctxDiffDrawing = this.differenceDrawnCanvas.nativeElement.getContext('2d');
        const ctxOgDrawing = this.originalDrawnCanvas.nativeElement.getContext('2d');
        const ctxOgRectangle = this.originalRectangleCanvas.nativeElement.getContext('2d');

        if (ctxOgRectangle) ctxOgRectangle.drawImage(this.differenceDrawnCanvas.nativeElement, 0, 0);

        if (ctxDiffDrawing) {
            ctxDiffDrawing.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            ctxDiffDrawing.drawImage(this.originalDrawnCanvas.nativeElement, 0, 0);
        }

        if (ctxOgDrawing) {
            ctxOgDrawing.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            ctxOgDrawing.drawImage(this.originalRectangleCanvas.nativeElement, 0, 0);
        }

        if (ctxOgRectangle) ctxOgRectangle.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    }

    duplicate(side: string) {
        const ctxDiffDrawing = this.differenceDrawnCanvas.nativeElement.getContext('2d');
        const ctxOgDrawing = this.originalDrawnCanvas.nativeElement.getContext('2d');

        if (side === 'right') {
            // console.log('right');
            ctxDiffDrawing.drawImage(this.originalDrawnCanvas.nativeElement, 0, 0);
        } else if (side === 'left') {
            // console.log('left');
            ctxOgDrawing.drawImage(this.differenceDrawnCanvas.nativeElement, 0, 0);
        }
    }

    clearPainting(side: string) {
        const ctxDiffDrawing = this.differenceDrawnCanvas.nativeElement.getContext('2d');
        const ctxOgDrawing = this.originalDrawnCanvas.nativeElement.getContext('2d');
        if (side === 'right') {
            ctxDiffDrawing.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            this.isInOriginalCanvas = false;
        } else if (side === 'left') {
            ctxOgDrawing.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            this.isInOriginalCanvas = true;
        }

        this.pushCanvas(this.drawingCanvas1);
    }

    // verifyFirstTime(position: string) {
    //     const emptyCanvas = document.createElement('canvas');
    //     emptyCanvas.width = 640;
    //     emptyCanvas.height = 480;
    //     if (position === 'right') {
    //         this.rigthCanvasArray.push({ canvas: emptyCanvas.toDataURL(), isInLeftCanvas: false });
    //         this.isFirstTimeInRightCanvas = false;
    //     } else if (position === 'left') {
    //         this.rigthCanvasArray.push({ canvas: emptyCanvas.toDataURL(), isInLeftCanvas: true });
    //         this.isFirstTimeInLeftCanvas = false;
    //     }
    // }

    pushCanvas(canvas: HTMLCanvasElement) {
        this.nbElements++;
        // if (this.nbElements < this.actionsArray.length) {
        //     // added this to make sure that if someone undos then adds new modifications
        //     // that it won't allow user to undo back to the old saved canvases
        //     this.actionsArray.length = this.nbElements;
        // }

        const canvasDataURL = canvas.toDataURL();
        if (this.isInOriginalCanvas) {
            // if (this.isFirstTimeInLeftCanvas) this.verifyFirstTime('left');
            this.actionsArray.push(true);
            this.leftArrayPointer++;
            this.leftCanvasArray.push(canvasDataURL);
        } else {
            this.actionsArray.push(false);
            this.rightArrayPointer++;
            this.rightCanvasArray.push(canvasDataURL);
            // if (this.isFirstTimeInRightCanvas) this.verifyFirstTime('right');
        }

        this.consoleStuff();
    }

    undoAction(array: string[], pointer: number) {
        const ctx = this.actionsArray[this.nbElements]
            ? this.originalDrawnCanvas.nativeElement.getContext('2d')
            : this.differenceDrawnCanvas.nativeElement.getContext('2d');

        const canvasPic = new Image();
        canvasPic.src = array[pointer];
        canvasPic.onload = () => {
            ctx.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
            ctx.drawImage(canvasPic, 0, 0);
        };
        const test = `undo on the left canvas: ${this.actionsArray[this.nbElements]} at index ${pointer}`;
        console.log(test);
    }
    undo() {
        if (this.nbElements > 0) {
            this.nbElements--;

            if (this.actionsArray[this.nbElements]) {
                this.leftArrayPointer--;
                this.undoAction(this.leftCanvasArray, this.leftArrayPointer);
            } else {
                this.rightArrayPointer--;
                this.undoAction(this.rightCanvasArray, this.rightArrayPointer);
            }
        }
        this.consoleStuff();
    }

    redoAction(array: string[], pointer: number) {
        const ctx = this.actionsArray[this.nbElements]
            ? this.originalDrawnCanvas.nativeElement.getContext('2d')
            : this.differenceDrawnCanvas.nativeElement.getContext('2d');

        const canvasPic = new Image();
        canvasPic.src = array[pointer];

        canvasPic.onload = () => {
            ctx.drawImage(canvasPic, 0, 0);
        };
        ctx.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
        const test = `redo on the left canvas: ${this.actionsArray[this.nbElements]} at index ${pointer}`;
        console.log(test);
    }

    redo() {
        console.log('this.actionsArray', this.actionsArray);
        if (this.nbElements < this.actionsArray.length) {
            console.log('this.nbElements', this.nbElements);
            if (this.actionsArray[this.nbElements]) {
                this.leftArrayPointer++;
                this.redoAction(this.leftCanvasArray, this.leftArrayPointer);
            } else {
                this.rightArrayPointer++;
                this.redoAction(this.rightCanvasArray, this.rightArrayPointer);
            }
            this.nbElements++;
        }
        this.consoleStuff();
    }
}
