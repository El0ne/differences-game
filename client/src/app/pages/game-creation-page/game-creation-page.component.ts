// we have to disable this rule because exceeds 355 lines.
/* eslint-disable max-lines */
// Due to previous implementation, we have too many dependencies related to each other
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { ModalPageComponent } from '@app/modals/modal-page/modal-page.component';
import { Routes } from '@app/modules/routes';
import { CanvasSelectionService } from '@app/services/canvas-selection/canvas-selection.service';
import { DrawManipulationService } from '@app/services/draw-manipulation/draw-manipulation.service';
import { EraserService } from '@app/services/eraser/eraser.service';
import { FileManipulationService } from '@app/services/file-manipulation/file-manipulation.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { PenService } from '@app/services/pen-service/pen-service.service';
import { RectangleService } from '@app/services/rectangle/rectangle.service';
import { IMAGE } from '@app/services/server-routes';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CanvasInformations } from '@common/canvas-informations';
import { GameCardDto } from '@common/game-card.dto';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { Buffer } from 'buffer';
import { ERASER_SIZE, GC_PATHS, ONLOAD_DELAY, PEN_SIZE } from './game-creation-constants';

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

    canvasInformations: CanvasInformations;

    eraseListener: ((mouseEvent: MouseEvent) => void)[] = [
        this.eraserService.startErase.bind(this),
        this.eraserService.stopErase.bind(this),
        this.eraserService.erasing.bind(this),
    ];
    rectangleListener: ((mouseEvent: MouseEvent) => void)[] = [
        this.rectangleService.startDrawingRectangle.bind(this),
        this.rectangleService.stopDrawingRectangle.bind(this),
        this.rectangleService.paintRectangle.bind(this),
    ];
    penListener: ((mouseEvent: MouseEvent) => void)[] = [
        this.penService.startPen.bind(this),
        this.penService.stopPen.bind(this),
        this.penService.writing.bind(this),
    ];

    // we need more than 3 Services/Routers/Dialogs
    // eslint-disable-next-line max-params
    constructor(
        private gameCardService: GameCardInformationService,
        private matDialog: MatDialog,
        private router: Router,
        private fileManipulationService: FileManipulationService,
        private canvasSelectionService: CanvasSelectionService,
        private penService: PenService,
        private rectangleService: RectangleService,
        private eraserService: EraserService,
        private drawManipulationService: DrawManipulationService,
        private undoRedoService: UndoRedoService,
    ) {}

    @HostListener('document:keydown.control.z', ['$event'])
    onCtrlZ(event: KeyboardEvent): void {
        event.preventDefault();
        this.undo();
    }

    @HostListener('document:keydown.control.shift.z', ['$event'])
    onCtrlShiftZ(event: KeyboardEvent): void {
        event.preventDefault();
        this.redo();
    }

    ngOnInit(): void {
        const emptyCanvas = document.createElement('canvas');
        emptyCanvas.width = IMAGE_DIMENSIONS.width;
        emptyCanvas.height = IMAGE_DIMENSIONS.height;

        this.leftCanvasArray.push(emptyCanvas.toDataURL());
        this.rightCanvasArray.push(emptyCanvas.toDataURL());
        setTimeout(() => {
            this.canvasInformations = this.setObject();
            this.canvasSelectionService.setProperties(this.canvasInformations);
            this.fileManipulationService.updateAttributes({
                originalFile: this.originalFile,
                differenceFile: this.differentFile,
                originalCanvas: this.originalCanvas.nativeElement,
                differenceCanvas: this.differenceCanvas.nativeElement,
            });
        }, ONLOAD_DELAY);
    }

    setDrawingProperty(): void {
        this.canvasInformations.selectedColor = this.selectedColor;
        this.canvasInformations.penSize = this.penSize;
        this.canvasInformations.eraserSize = this.eraserSize;
    }

    setObject(): CanvasInformations {
        return {
            differenceRectangleCanvas: this.differenceRectangleCanvas.nativeElement,
            differenceDrawnCanvas: this.differenceDrawnCanvas.nativeElement,

            originalRectangleCanvas: this.originalRectangleCanvas.nativeElement,
            originalDrawnCanvas: this.originalDrawnCanvas.nativeElement,

            drawingCanvas1: this.drawingCanvas1,
            drawingCanvas2: this.drawingCanvas2,

            isInOriginalCanvas: this.isInOriginalCanvas,

            rightCanvasArray: this.rightCanvasArray,
            leftCanvasArray: this.leftCanvasArray,
            actionsArray: this.actionsArray,
            nbElements: this.nbElements,
            leftArrayPointer: this.leftArrayPointer,
            rightArrayPointer: this.rightArrayPointer,
            isFirstTimeInLeftCanvas: this.isFirstTimeInLeftCanvas,
            isFirstTimeInRightCanvas: this.isFirstTimeInRightCanvas,
            isUserClicking: false,

            rectangleInitialX: 0,
            rectangleInitialY: 0,

            selectedColor: '#ff124f',
            penSize: PEN_SIZE,
            eraserSize: ERASER_SIZE,
        };
    }

    getTitle(title: string): void {
        this.gameTitle = title;
    }

    openSaveModal(): void {
        const dialogRef = this.matDialog.open(ModalPageComponent, {
            disableClose: true,
            data: {
                image: this.differenceImage,
                difference: this.differenceNumber,
                difficulty: this.difficulty,
                gameInfo: this.createdGameInfo,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            result.image = '';
            this.router.navigate([`/${Routes.Config}`]);
        });
    }

    clearFile(canvas: HTMLCanvasElement, id: string, file: File | null): void {
        this.fileManipulationService.clearFile(canvas, id, file);
        file = null;
    }

    async fileValidation(event: Event): Promise<void> {
        await this.fileManipulationService.fileValidation(event);
    }

    mergeCanvas(canvas: HTMLCanvasElement, canvas2: HTMLCanvasElement): Blob {
        const contextCanvas = canvas.getContext('2d');
        const contextCanvas2 = canvas2.getContext('2d');
        if (contextCanvas && contextCanvas2) {
            contextCanvas.drawImage(canvas2, 0, 0);
            contextCanvas2.clearRect(0, 0, canvas2.width, canvas2.height);
        }

        return this.createBlob(canvas);
    }

    createBlob(canvas: HTMLCanvasElement): Blob {
        const imageData = canvas.toDataURL('image/bmp');
        const byteString = imageData.split(',')[1];
        const arrayBuffer = Buffer.from(byteString, 'base64');
        const uint8Array = new Uint8Array(arrayBuffer);
        return new Blob([uint8Array], { type: 'image/bmp' });
    }

    async choseGameTitle(): Promise<void> {
        this.isSaveDisabled = true;

        const dialogRef = this.matDialog.open(ChosePlayerNameDialogComponent, { disableClose: true, data: { isChosingGameTitle: true } });
        dialogRef.afterClosed().subscribe((gameTitle: string | boolean) => {
            if (gameTitle) {
                this.gameTitle = gameTitle.toString();
                this.save();
            } else {
                this.isSaveDisabled = false;
            }
        });
    }

    drawWhiteCanvas(canvas: HTMLCanvasElement): void {
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(this.originalDrawnCanvas.nativeElement, 0, 0);
            context.fillStyle = 'white';

            context.fillRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
        }
    }

    async save(): Promise<void> {
        const updatedFiles = this.fileManipulationService.updateFiles();
        this.originalFile = updatedFiles[0];
        this.differentFile = updatedFiles[1];
        if (!this.originalFile) {
            this.drawWhiteCanvas(this.originalCanvas.nativeElement);
        }

        if (!this.differentFile) {
            this.drawWhiteCanvas(this.differenceCanvas.nativeElement);
        }

        const originalBlob = this.mergeCanvas(this.originalCanvas.nativeElement, this.originalDrawnCanvas.nativeElement);
        const differenceBlob = this.mergeCanvas(this.differenceCanvas.nativeElement, this.differenceDrawnCanvas.nativeElement);

        this.gameCardService.uploadImages(originalBlob, differenceBlob, this.differenceRadius).subscribe((data) => {
            if (data) {
                this.createdGameInfo = {
                    _id: data.gameId,
                    name: this.gameTitle,
                    difficulty: data.gameDifficulty,
                    radius: this.differenceRadius,
                    differenceNumber: data.gameDifferenceNumber,
                };
                this.difficulty = data.gameDifficulty;
                this.differenceNumber = data.gameDifferenceNumber;
                this.differenceImage = `${IMAGE}/file/difference-image.bmp`;
                this.openSaveModal();
            } else {
                alert("La partie n'a pas été créée. Vous devez avoir entre 3 et 9 différences");
            }
            this.isSaveDisabled = false;
        });
    }

    drawPen(): void {
        this.penService.setProperties(this.canvasInformations);

        this.canvasInformations.originalDrawnCanvas.addEventListener('mousedown', this.penListener[0]);
        this.canvasInformations.differenceDrawnCanvas.addEventListener('mousedown', this.penListener[0]);

        this.canvasInformations.originalDrawnCanvas.addEventListener('mouseup', this.penListener[1]);
        this.canvasInformations.differenceDrawnCanvas.addEventListener('mouseup', this.penListener[1]);

        this.canvasInformations.originalDrawnCanvas.addEventListener('mousemove', this.penListener[2]);
        this.canvasInformations.differenceDrawnCanvas.addEventListener('mousemove', this.penListener[2]);
    }

    drawRectangle(): void {
        this.rectangleService.setProperties(this.canvasInformations);

        this.canvasInformations.originalRectangleCanvas.addEventListener('mousedown', this.rectangleListener[0]);
        this.canvasInformations.differenceRectangleCanvas.addEventListener('mousedown', this.rectangleListener[0]);

        this.canvasInformations.originalRectangleCanvas.addEventListener('mouseup', this.rectangleListener[1]);
        this.canvasInformations.differenceRectangleCanvas.addEventListener('mouseup', this.rectangleListener[1]);

        this.canvasInformations.originalRectangleCanvas.addEventListener('mousemove', this.rectangleListener[2]);
        this.canvasInformations.differenceRectangleCanvas.addEventListener('mousemove', this.rectangleListener[2]);
    }

    erase(): void {
        this.eraserService.setProperties(this.canvasInformations);
        this.canvasInformations.originalDrawnCanvas.addEventListener('mousedown', this.eraseListener[0]);
        this.canvasInformations.differenceDrawnCanvas.addEventListener('mousedown', this.eraseListener[0]);

        this.canvasInformations.originalDrawnCanvas.addEventListener('mouseup', this.eraseListener[1]);
        this.canvasInformations.differenceDrawnCanvas.addEventListener('mouseup', this.eraseListener[1]);

        this.canvasInformations.originalDrawnCanvas.addEventListener('mousemove', this.eraseListener[2]);
        this.canvasInformations.differenceDrawnCanvas.addEventListener('mousemove', this.eraseListener[2]);
    }

    removingListeners(): void {
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

    changeZindex(): void {
        if (this.isRectangleEnabled) {
            this.canvas2ZIndex = 3;
            this.canvas1ZIndex = 2;
        } else {
            this.canvas2ZIndex = 2;
            this.canvas1ZIndex = 3;
        }
    }

    toggleButton(id: string): void {
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

    invert(): void {
        this.drawManipulationService.setProperties(this.canvasInformations);
        this.drawManipulationService.invert();
    }

    duplicate(side: string): void {
        this.drawManipulationService.setProperties(this.canvasInformations);
        this.drawManipulationService.duplicate(side);
    }

    clearPainting(side: string): void {
        this.drawManipulationService.setProperties(this.canvasInformations);
        this.drawManipulationService.clearPainting(side);
    }

    undo(): void {
        this.undoRedoService.setProperties(this.canvasInformations);
        this.undoRedoService.undo();
    }
    redo(): void {
        this.undoRedoService.setProperties(this.canvasInformations);
        this.undoRedoService.redo();
    }
}
