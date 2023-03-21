/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { getFakeCanvasInformations } from '@app/services/canvas-informations.constants';
import { CanvasSelectionService } from '@app/services/canvas-selection/canvas-selection.service';
import { DrawManipulationService } from '@app/services/draw-manipulation/draw-manipulation.service';
import { DrawingRectangleService } from '@app/services/drawing-rectangle/drawing-rectangle.service';
import { EraserButtonService } from '@app/services/eraser-button/eraser-button.service';
import { FileManipulationService } from '@app/services/file-manipulation/file-manipulation.service';
import { PenService } from '@app/services/pen-service/pen-service.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { of } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let canvasOg: HTMLCanvasElement;
    let drawingRectangleService: DrawingRectangleService;
    let fileManipulationService: FileManipulationService;
    let penService: PenService;
    let canvasSelectionService: CanvasSelectionService;
    let eraserButtonService: EraserButtonService;
    let undoRedoService: UndoRedoService;
    let drawManipulationService: DrawManipulationService;

    beforeEach(async () => {
        penService = jasmine.createSpyObj('PenService', ['setProperties', 'startPen', 'stopPen', 'writing']);
        drawingRectangleService = jasmine.createSpyObj('DrawingRectangleService', [
            'setProperties',
            'startDrawingRectangle',
            'stopDrawingRectangle',
            'paintRectangle',
        ]);
        eraserButtonService = jasmine.createSpyObj('EraserButtonService', ['setProperties', 'startErase', 'stopErase', 'erasing']);
        fileManipulationService = jasmine.createSpyObj('FileManipulationService', [
            'setProperties',
            'updateAttributes',
            'clearFile',
            'fileValidation',
        ]);
        drawManipulationService = jasmine.createSpyObj('DrawManipulationService', ['setProperties', 'invert', 'duplicate', 'clearPainting']);
        canvasSelectionService = jasmine.createSpyObj('CanvasSelectionService', ['setProperties', 'choseCanvas']);
        undoRedoService = jasmine.createSpyObj('UndoRedoService', ['setProperties', 'pushCanvas', 'undoAction', 'undo', 'redoAction', 'redo']);
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent],
            imports: [HttpClientModule, FormsModule, MatDialogModule, RouterTestingModule, MatIconModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {
                        open: () => ({
                            afterClosed: () => of({}),
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            close: () => {},
                        }),
                    },
                },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: PenService, useValue: penService },
                { provide: DrawingRectangleService, useValue: drawingRectangleService },
                { provide: FileManipulationService, useValue: fileManipulationService },
                { provide: CanvasSelectionService, useValue: canvasSelectionService },
                { provide: EraserButtonService, useValue: eraserButtonService },
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

    it('should call setColor on drawingRectangleService with selectedColor', () => {
        component.setColor();
        expect(component.canvasInformations.selectedColor).toBe(component.selectedColor);
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
        expect(canvasInfo.isRectangleEnabled).toBe(false);
        expect(canvasInfo.isPenEnabled).toBe(false);
        expect(canvasInfo.isEraserEnabled).toBe(false);
        expect(canvasInfo.isDuplicateEnabled).toBe(false);
        expect(canvasInfo.isClearEnabled).toBe(false);
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

    it('should verify and send an alert if the title and both images are missing', () => {
        component.gameTitle = '';
        component.originalFile = null;
        component.differentFile = null;
        const alertSpy = spyOn(window, 'alert');

        expect(component.saveVerification()).toBeFalse();
        expect(alertSpy).toHaveBeenCalledWith('Il manque une image et un titre à votre jeu !');
    });

    it('should verify and send an alert if the title is missing', () => {
        component.gameTitle = '';
        component.originalFile = new File([], 'test.png');
        component.differentFile = new File([], 'test-diff.png');
        const alertSpy = spyOn(window, 'alert');

        expect(component.saveVerification()).toBeFalse();
        expect(alertSpy).toHaveBeenCalledWith("N'oubliez pas d'ajouter un titre à votre jeu !");
    });

    it('should verify and send an alert if one of the images is missing', () => {
        component.gameTitle = 'Test Game';
        component.originalFile = null;
        component.differentFile = new File([], 'test-diff.png');

        expect(component.saveVerification()).toBeFalse();

        component.originalFile = new File([], 'test.png');
        component.differentFile = null;
        const alertSpy = spyOn(window, 'alert');

        expect(component.saveVerification()).toBeFalse();
        expect(alertSpy).toHaveBeenCalledWith('Un jeu de différences sans image est pour ainsi dire... intéressant ? Ajoutez une image.');
    });

    it('should return true if all conditions are met', () => {
        component.gameTitle = 'Test Game';
        component.originalFile = new File([], 'test.png');
        component.differentFile = new File([], 'test-diff.png');

        expect(component.saveVerification()).toBeTrue();
    });

    it('should merge two canvases into a blob', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        if (ctx1) {
            ctx1.fillStyle = '#FF0000';
            ctx1.fillRect(0, 0, 50, 50);
        }
        if (ctx2) {
            ctx2.fillStyle = '#00FF00';
            ctx2.fillRect(25, 25, 50, 50);
        }
        const result = component.mergeCanvas(canvas1, canvas2);
        expect(result).toBeInstanceOf(Blob);
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

        expect(drawingRectangleService.setProperties).toHaveBeenCalledWith(component.canvasInformations);

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

        expect(eraserButtonService.setProperties).toHaveBeenCalledWith(component.canvasInformations);

        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mousedown', component.eraseListener[0]);
        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mouseup', component.eraseListener[1]);
        expect(addEventListenerOriginalSpy).toHaveBeenCalledWith('mousemove', component.eraseListener[2]);

        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mousedown', component.eraseListener[0]);
        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mouseup', component.eraseListener[1]);
        expect(addEventListenerDifferenceSpy).toHaveBeenCalledWith('mousemove', component.eraseListener[2]);
    });

    it('should remove event listeners', () => {
        const spy = spyOn(component.originalDrawnCanvas.nativeElement, 'removeEventListener');
        component.removingListeners();

        expect(spy).toHaveBeenCalledWith('mousedown', component.rectangleListener[0]);
        expect(spy).toHaveBeenCalledWith('mouseup', component.rectangleListener[1]);
        expect(spy).toHaveBeenCalledWith('mousemove', component.rectangleListener[2]);

        expect(spy).toHaveBeenCalledWith('mousedown', component.penListener[0]);
        expect(spy).toHaveBeenCalledWith('mouseup', component.penListener[1]);
        expect(spy).toHaveBeenCalledWith('mousemove', component.penListener[2]);

        expect(spy).toHaveBeenCalledWith('mousedown', component.eraseListener[0]);
        expect(spy).toHaveBeenCalledWith('mouseup', component.eraseListener[1]);
        expect(spy).toHaveBeenCalledWith('mousemove', component.eraseListener[2]);
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
});
