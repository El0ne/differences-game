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
                { provide: DrawManipulationService, useValue: drawManipulationService },
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
        spyOn(canvasSelectionService, 'setProperties');
        spyOn(fileManipulationService, 'updateAttributes');

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

    it('should call fileManipulationService.clearFile with canvas, id, and file', () => {
        const canvas = document.createElement('canvas');
        const id = 'upload-different';
        const file = new File([], 'filename');
        component.clearFile(canvas, id, file);
        expect(fileManipulationService.clearFile).toHaveBeenCalledWith(canvas, id, file);
    });

    it('should call fileManipulationService.fileValidation', async () => {
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
        component.drawPen();

        expect(penService.setProperties).toHaveBeenCalledWith(component.canvasInformations);

        component.canvasInformations.originalDrawnCanvas.dispatchEvent(new MouseEvent('mousedown'));
        expect(penService.startPen).toHaveBeenCalled();
        component.canvasInformations.differenceDrawnCanvas.dispatchEvent(new MouseEvent('mousedown'));
        expect(penService.startPen).toHaveBeenCalled();

        component.canvasInformations.originalDrawnCanvas.dispatchEvent(new MouseEvent('mouseup'));
        expect(penService.stopPen).toHaveBeenCalled();
        component.canvasInformations.differenceDrawnCanvas.dispatchEvent(new MouseEvent('mouseup'));
        expect(penService.stopPen).toHaveBeenCalled();

        component.canvasInformations.originalDrawnCanvas.dispatchEvent(new MouseEvent('mousemove'));
        expect(penService.writing).toHaveBeenCalled();
        component.canvasInformations.differenceDrawnCanvas.dispatchEvent(new MouseEvent('mousemove'));
        expect(penService.writing).toHaveBeenCalled();
    });

    it('should add event listeners when user draws a rectangle on the canvases', () => {
        component.drawRectangle();

        expect(drawingRectangleService.setProperties).toHaveBeenCalledWith(component.canvasInformations);

        component.canvasInformations.originalDrawnCanvas.dispatchEvent(new MouseEvent('mousedown'));
        expect(drawingRectangleService.startDrawingRectangle).toHaveBeenCalled();
        component.canvasInformations.differenceDrawnCanvas.dispatchEvent(new MouseEvent('mousedown'));
        expect(drawingRectangleService.startDrawingRectangle).toHaveBeenCalled();

        component.canvasInformations.originalDrawnCanvas.dispatchEvent(new MouseEvent('mouseup'));
        expect(drawingRectangleService.stopDrawingRectangle).toHaveBeenCalled();
        component.canvasInformations.differenceDrawnCanvas.dispatchEvent(new MouseEvent('mouseup'));
        expect(drawingRectangleService.stopDrawingRectangle).toHaveBeenCalled();

        component.canvasInformations.originalDrawnCanvas.dispatchEvent(new MouseEvent('mousemove'));
        expect(drawingRectangleService.paintRectangle).toHaveBeenCalled();
        component.canvasInformations.differenceDrawnCanvas.dispatchEvent(new MouseEvent('mousemove'));
        expect(drawingRectangleService.paintRectangle).toHaveBeenCalled();
    });

    it('should add event listeners when user erases on the canvas', () => {
        component.erase();

        expect(eraserButtonService.setProperties).toHaveBeenCalledWith(component.canvasInformations);

        component.canvasInformations.originalDrawnCanvas.dispatchEvent(new MouseEvent('mousedown'));
        expect(eraserButtonService.startErase).toHaveBeenCalled();
        component.canvasInformations.differenceDrawnCanvas.dispatchEvent(new MouseEvent('mousedown'));
        expect(eraserButtonService.startErase).toHaveBeenCalled();

        component.canvasInformations.originalDrawnCanvas.dispatchEvent(new MouseEvent('mouseup'));
        expect(eraserButtonService.stopErase).toHaveBeenCalled();
        component.canvasInformations.differenceDrawnCanvas.dispatchEvent(new MouseEvent('mouseup'));
        expect(eraserButtonService.stopErase).toHaveBeenCalled();

        component.canvasInformations.originalDrawnCanvas.dispatchEvent(new MouseEvent('mousemove'));
        expect(eraserButtonService.erasing).toHaveBeenCalled();
        component.canvasInformations.differenceDrawnCanvas.dispatchEvent(new MouseEvent('mousemove'));
        expect(eraserButtonService.erasing).toHaveBeenCalled();
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
});
