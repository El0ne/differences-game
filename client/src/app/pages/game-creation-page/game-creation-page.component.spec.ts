/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { getFakeCanvasInformations } from '@app/services/canvas-informations.constants';
import { CanvasSelectionService } from '@app/services/canvas-selection/canvas-selection.service';
import { DrawManipulationService } from '@app/services/draw-manipulation/draw-manipulation.service';
import { EraserService } from '@app/services/eraser/eraser.service';
import { FileManipulationService } from '@app/services/file-manipulation/file-manipulation.service';
import { PenService } from '@app/services/pen-service/pen-service.service';
import { RectangleService } from '@app/services/rectangle/rectangle.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { of } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let canvasOg: HTMLCanvasElement;
    let rectangleService: RectangleService;
    let fileManipulationService: FileManipulationService;
    let penService: PenService;
    let canvasSelectionService: CanvasSelectionService;
    let eraserService: EraserService;
    let undoRedoService: UndoRedoService;
    let drawManipulationService: DrawManipulationService;
    let matDialog: MatDialog;
    let choseNameAfterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;

    beforeEach(async () => {
        penService = jasmine.createSpyObj('PenService', ['setProperties', 'startPen', 'stopPen', 'writing']);
        rectangleService = jasmine.createSpyObj('RectangleService', [
            'setProperties',
            'startDrawingRectangle',
            'stopDrawingRectangle',
            'paintRectangle',
        ]);
        eraserService = jasmine.createSpyObj('EraserButtonService', ['setProperties', 'startErase', 'stopErase', 'erasing']);
        fileManipulationService = jasmine.createSpyObj('FileManipulationService', [
            'setProperties',
            'updateAttributes',
            'clearFile',
            'fileValidation',
        ]);
        drawManipulationService = jasmine.createSpyObj('DrawManipulationService', ['setProperties', 'invert', 'duplicate', 'clearPainting']);
        canvasSelectionService = jasmine.createSpyObj('CanvasSelectionService', ['setProperties', 'choseCanvas']);
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['setProperties', 'pushCanvas', 'undoAction', 'undo', 'redoAction', 'redo']);
        matDialog = jasmine.createSpyObj('MatDialog', ['open']);

        choseNameAfterClosedSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['afterClosed']);

        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent],
            imports: [HttpClientModule, FormsModule, MatDialogModule, RouterTestingModule, MatIconModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialog, useValue: matDialog },
                { provide: MatDialogRef, useValue: {} },
                { provide: PenService, useValue: penService },
                { provide: RectangleService, useValue: rectangleService },
                { provide: FileManipulationService, useValue: fileManipulationService },
                { provide: CanvasSelectionService, useValue: canvasSelectionService },
                { provide: EraserService, useValue: eraserService },
                { provide: DrawManipulationService, useValue: drawManipulationService },
                { provide: UndoRedoService, useValue: undoRedoService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        canvasOg = document.createElement('canvas');
        canvasOg.width = IMAGE_DIMENSIONS.width;
        canvasOg.height = IMAGE_DIMENSIONS.height;
        component.canvasInformations = getFakeCanvasInformations();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set canvas informations after timeout', fakeAsync(() => {
        component.ngOnInit();

        tick(50);

        expect(component.setObject()).toEqual(component.canvasInformations);
        expect(canvasSelectionService.setProperties).toHaveBeenCalledWith(component.canvasInformations);
        expect(fileManipulationService.updateAttributes).toHaveBeenCalledWith({
            originalFile: component.originalFile,
            differenceFile: component.differentFile,
            originalCanvas: component.originalCanvas.nativeElement,
            differenceCanvas: component.differenceCanvas.nativeElement,
        });
    }));

    it('pressing on ctrl z should call undo method', () => {
        const keyboardEvent = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
        });
        const preventDefaultSpy = spyOn(keyboardEvent, 'preventDefault');
        const undoSpy = spyOn(component, 'undo');

        component.onCtrlZ(keyboardEvent);

        expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
        expect(undoSpy).toHaveBeenCalledTimes(1);
    });

    it('pressing on ctrl shift z should call undo method', () => {
        const keyboardEvent = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
        });
        const preventDefaultSpy = spyOn(keyboardEvent, 'preventDefault');
        const redoSpy = spyOn(component, 'redo');

        component.onCtrlShiftZ(keyboardEvent);

        expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
        expect(redoSpy).toHaveBeenCalledTimes(1);
    });

    it('should get a title', () => {
        const input = 'Test title';
        component.getTitle(input);
        expect(component.gameTitle).toBe(input);
    });

    it('should call setDrawing and set the proper value to the canvas Informations', () => {
        component.setDrawingProperty();
        expect(component.canvasInformations.selectedColor).toBe(component.selectedColor);
        expect(component.canvasInformations.penSize).toBe(component.penSize);
        expect(component.canvasInformations.eraserSize).toBe(component.eraserSize);
    });
    it('should set objects', () => {
        const canvasInfo = component.setObject();

        expect(canvasInfo.differenceRectangleCanvas).toBe(component.differenceRectangleCanvas.nativeElement);
        expect(canvasInfo.differenceDrawnCanvas).toBe(component.differenceDrawnCanvas.nativeElement);
        expect(canvasInfo.originalRectangleCanvas).toBe(component.originalRectangleCanvas.nativeElement);
        expect(canvasInfo.originalDrawnCanvas).toBe(component.originalDrawnCanvas.nativeElement);
        expect(canvasInfo.drawingCanvas1).toBe(component.drawingCanvas1);
        expect(canvasInfo.drawingCanvas2).toBe(component.drawingCanvas2);
        expect(canvasInfo.isInOriginalCanvas).toBe(component.isInOriginalCanvas);
        expect(canvasInfo.rightCanvasArray).toBe(component.rightCanvasArray);
        expect(canvasInfo.leftCanvasArray).toBe(component.leftCanvasArray);
        expect(canvasInfo.actionsArray).toBe(component.actionsArray);
        expect(canvasInfo.nbElements).toBe(component.nbElements);
        expect(canvasInfo.leftArrayPointer).toBe(component.leftArrayPointer);
        expect(canvasInfo.rightArrayPointer).toBe(component.rightArrayPointer);
        expect(canvasInfo.isFirstTimeInLeftCanvas).toBe(component.isFirstTimeInLeftCanvas);
        expect(canvasInfo.isFirstTimeInRightCanvas).toBe(component.isFirstTimeInRightCanvas);
        expect(canvasInfo.isUserClicking).toBe(false);
        expect(canvasInfo.rectangleInitialX).toBe(0);
        expect(canvasInfo.rectangleInitialY).toBe(0);
        expect(canvasInfo.selectedColor).toBe(component.selectedColor);
        expect(canvasInfo.penSize).toBe(component.penSize);
        expect(canvasInfo.eraserSize).toBe(component.eraserSize);
    });

    it('should call the clearFile method of the fileManipulation service', () => {
        const canvas = document.createElement('canvas');
        const id = 'upload-different';
        const file = new File([], 'filename');
        component.clearFile(canvas, id, file);
        expect(fileManipulationService.clearFile).toHaveBeenCalledWith(canvas, id, file);
    });

    it('should call the fileValidation of the fileManipulation service', async () => {
        const event = new Event('change');
        await component.fileValidation(event);
        expect(fileManipulationService.fileValidation).toHaveBeenCalledWith(event);
    });

    it('should add event listeners when user draws on the canvases with a pen', () => {
        const addEventListenerOriginalSpy = spyOn(component.canvasInformations.originalDrawnCanvas, 'addEventListener');
        const addEventListenerDifferenceSpy = spyOn(component.canvasInformations.differenceDrawnCanvas, 'addEventListener');

        component.drawPen();

        expect(penService.setProperties).toHaveBeenCalledWith(component.canvasInformations);

        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mousedown', component.penListener[0]);
        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mouseup', component.penListener[1]);
        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mousemove', component.penListener[2]);

        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mousedown', component.penListener[0]);
        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mouseup', component.penListener[1]);
        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mousemove', component.penListener[2]);
    });

    it('should add event listeners when user draws a rectangle on the canvases', () => {
        const addEventListenerOriginalSpy = spyOn(component.canvasInformations.originalRectangleCanvas, 'addEventListener');
        const addEventListenerDifferenceSpy = spyOn(component.canvasInformations.differenceRectangleCanvas, 'addEventListener');

        component.drawRectangle();

        expect(rectangleService.setProperties).toHaveBeenCalledWith(component.canvasInformations);

        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mousedown', component.rectangleListener[0]);
        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mouseup', component.rectangleListener[1]);
        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mousemove', component.rectangleListener[2]);

        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mousedown', component.rectangleListener[0]);
        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mouseup', component.rectangleListener[1]);
        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mousemove', component.rectangleListener[2]);
    });

    it('should add event listeners when user erases on the canvas', () => {
        const addEventListenerOriginalSpy = spyOn(component.canvasInformations.originalDrawnCanvas, 'addEventListener');
        const addEventListenerDifferenceSpy = spyOn(component.canvasInformations.differenceDrawnCanvas, 'addEventListener');

        component.erase();

        expect(eraserService.setProperties).toHaveBeenCalledWith(component.canvasInformations);

        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mousedown', component.eraseListener[0]);
        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mouseup', component.eraseListener[1]);
        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mousemove', component.eraseListener[2]);

        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mousedown', component.eraseListener[0]);
        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mouseup', component.eraseListener[1]);
        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mousemove', component.eraseListener[2]);
    });

    it('should remove event listeners on drawn canvases', () => {
        const originalDrawnCanvasSpy = spyOn(component.originalDrawnCanvas.nativeElement, 'removeEventListener');
        const differenceDrawnCanvasSpy = spyOn(component.differenceDrawnCanvas.nativeElement, 'removeEventListener');
        component.removingListeners();

        expect(originalDrawnCanvasSpy).toHaveBeenCalledWith('mousedown', component.penListener[0]);
        expect(originalDrawnCanvasSpy).toHaveBeenCalledWith('mouseup', component.penListener[1]);
        expect(originalDrawnCanvasSpy).toHaveBeenCalledWith('mousemove', component.penListener[2]);

        expect(originalDrawnCanvasSpy).toHaveBeenCalledWith('mousedown', component.eraseListener[0]);
        expect(originalDrawnCanvasSpy).toHaveBeenCalledWith('mouseup', component.eraseListener[1]);
        expect(originalDrawnCanvasSpy).toHaveBeenCalledWith('mousemove', component.eraseListener[2]);

        expect(differenceDrawnCanvasSpy).toHaveBeenCalledWith('mousedown', component.penListener[0]);
        expect(differenceDrawnCanvasSpy).toHaveBeenCalledWith('mouseup', component.penListener[1]);
        expect(differenceDrawnCanvasSpy).toHaveBeenCalledWith('mousemove', component.penListener[2]);

        expect(differenceDrawnCanvasSpy).toHaveBeenCalledWith('mousedown', component.eraseListener[0]);
        expect(differenceDrawnCanvasSpy).toHaveBeenCalledWith('mouseup', component.eraseListener[1]);
        expect(differenceDrawnCanvasSpy).toHaveBeenCalledWith('mousemove', component.eraseListener[2]);
    });

    it('should remove event listeners on rectangle canvases', () => {
        const originalRectangleCanvasSpy = spyOn(component.originalRectangleCanvas.nativeElement, 'removeEventListener');
        const differenceRectangleCanvasSpy = spyOn(component.differenceRectangleCanvas.nativeElement, 'removeEventListener');
        component.removingListeners();

        expect(originalRectangleCanvasSpy).toHaveBeenCalledWith('mousedown', component.rectangleListener[0]);
        expect(originalRectangleCanvasSpy).toHaveBeenCalledWith('mouseup', component.rectangleListener[1]);
        expect(originalRectangleCanvasSpy).toHaveBeenCalledWith('mousemove', component.rectangleListener[2]);

        expect(differenceRectangleCanvasSpy).toHaveBeenCalledWith('mousedown', component.rectangleListener[0]);
        expect(differenceRectangleCanvasSpy).toHaveBeenCalledWith('mouseup', component.rectangleListener[1]);
        expect(differenceRectangleCanvasSpy).toHaveBeenCalledWith('mousemove', component.rectangleListener[2]);
    });

    it('should change the z indexes if the rectangle button is enabled', () => {
        component.isRectangleEnabled = true;
        component.changeZindex();

        expect(component.canvas2ZIndex).toEqual(3);
        expect(component.canvas1ZIndex).toEqual(2);
    });

    it('should change the z indexes if the rectangle button is disabled', () => {
        component.isRectangleEnabled = false;
        component.changeZindex();

        expect(component.canvas2ZIndex).toEqual(2);
        expect(component.canvas1ZIndex).toEqual(3);
    });

    it('should toggle pen state and call drawPen if pen button is clicked', () => {
        spyOn(component, 'removingListeners');
        spyOn(component, 'changeZindex');
        spyOn(component, 'drawPen');

        component.toggleButton('pen');

        expect(component.removingListeners).toHaveBeenCalled();
        expect(component.changeZindex).toHaveBeenCalled();
        expect(component.isPenEnabled).toBeTrue();
        expect(component.isRectangleEnabled).toBeFalse();
        expect(component.isEraserEnabled).toBeFalse();
        expect(component.isDuplicateEnabled).toBeFalse();
        expect(component.isClearEnabled).toBeFalse();
        expect(component.drawPen).toHaveBeenCalled();
    });

    it('should toggle rectangle state and call drawRectangle if rectangle button is clicked', () => {
        spyOn(component, 'removingListeners');
        spyOn(component, 'changeZindex');
        spyOn(component, 'drawRectangle');

        component.toggleButton('rectangle');

        expect(component.removingListeners).toHaveBeenCalled();
        expect(component.changeZindex).toHaveBeenCalled();
        expect(component.isPenEnabled).toBeFalse();
        expect(component.isRectangleEnabled).toBeTrue();
        expect(component.isEraserEnabled).toBeFalse();
        expect(component.isDuplicateEnabled).toBeFalse();
        expect(component.isClearEnabled).toBeFalse();
        expect(component.drawRectangle).toHaveBeenCalled();
    });

    it('should toggle eraser state and call erase if erase button is clicked', () => {
        spyOn(component, 'removingListeners');
        spyOn(component, 'changeZindex');
        spyOn(component, 'erase');

        component.toggleButton('erase');

        expect(component.removingListeners).toHaveBeenCalled();
        expect(component.changeZindex).toHaveBeenCalled();
        expect(component.isPenEnabled).toBeFalse();
        expect(component.isRectangleEnabled).toBeFalse();
        expect(component.isEraserEnabled).toBeTrue();
        expect(component.isDuplicateEnabled).toBeFalse();
        expect(component.isClearEnabled).toBeFalse();
        expect(component.erase).toHaveBeenCalled();
    });

    it('should toggle duplicate state if duplicate button is clicked', () => {
        spyOn(component, 'removingListeners');

        component.toggleButton('duplicate');

        expect(component.removingListeners).toHaveBeenCalled();
        expect(component.isPenEnabled).toBeFalse();
        expect(component.isRectangleEnabled).toBeFalse();
        expect(component.isEraserEnabled).toBeFalse();
        expect(component.isDuplicateEnabled).toBeTrue();
        expect(component.isClearEnabled).toBeFalse();
    });

    it('should toggle clear state if clear button is clicked', () => {
        spyOn(component, 'removingListeners');

        component.toggleButton('clear');

        expect(component.removingListeners).toHaveBeenCalled();
        expect(component.isPenEnabled).toBeFalse();
        expect(component.isRectangleEnabled).toBeFalse();
        expect(component.isEraserEnabled).toBeFalse();
        expect(component.isDuplicateEnabled).toBeFalse();
        expect(component.isClearEnabled).toBeTrue();
    });

    it("should set the drawManipulation service's properties and call the invert method of the service", () => {
        component.invert();

        expect(drawManipulationService.setProperties).toHaveBeenCalledWith(component.canvasInformations);
        expect(drawManipulationService.invert).toHaveBeenCalled();
    });

    it("should set the drawManipulation service's properties and call the duplicate method of the service", () => {
        component.duplicate('left');

        expect(drawManipulationService.setProperties).toHaveBeenCalledWith(component.canvasInformations);
        expect(drawManipulationService.duplicate).toHaveBeenCalled();
    });

    it("should set the drawManipulation service's properties and call the clearPainting method of the service", () => {
        component.clearPainting('left');

        expect(drawManipulationService.setProperties).toHaveBeenCalledWith(component.canvasInformations);
        expect(drawManipulationService.clearPainting).toHaveBeenCalled();
    });

    it("should set the undoRedo service's properties and call the undo method of the service", () => {
        component.undo();

        expect(undoRedoService.setProperties).toHaveBeenCalledWith(component.canvasInformations);
        expect(undoRedoService.undo).toHaveBeenCalled();
    });

    it("should set the undoRedo service's properties and call the redo method of the service", () => {
        component.redo();

        expect(undoRedoService.setProperties).toHaveBeenCalledWith(component.canvasInformations);
        expect(undoRedoService.redo).toHaveBeenCalled();
    });

    it('choseGameTitle should call save after the name is chosen or put isSaveDisabled to false if no name was entered', async () => {
        matDialog.open = () => choseNameAfterClosedSpy;
        choseNameAfterClosedSpy.afterClosed = () => of(false);
        component.isSaveDisabled = true;
        const saveSpy = spyOn(component, 'save');
        await component.choseGameTitle();
        expect(saveSpy).not.toHaveBeenCalled();
        expect(component.isSaveDisabled).toBeFalse();

        choseNameAfterClosedSpy.afterClosed = () => of('test');
        component.isSaveDisabled = true;
        await component.choseGameTitle();
        expect(saveSpy).toHaveBeenCalled();
        expect(component.gameTitle).toEqual('test');
    });
});
