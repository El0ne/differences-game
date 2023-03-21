import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingRectangleService } from '@app/services/drawing-rectangle/drawing-rectangle.service';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { of } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let canvasOg: HTMLCanvasElement;
    let drawingRectangleService: DrawingRectangleService;

    beforeEach(async () => {
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
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        canvasOg = document.createElement('canvas');
        canvasOg.width = IMAGE_DIMENSIONS.width;
        canvasOg.height = IMAGE_DIMENSIONS.height;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set canvas informations after timeout', fakeAsync(() => {
        spyOn(component.canvasSelectionService, 'setProperties');
        spyOn(component.fileManipulationService, 'updateAttributes');

        component.ngOnInit();

        tick(50); // ERASER_SIZE

        expect(component.setObject()).toEqual(component.canvasInformations);
        expect(component.canvasSelectionService.setProperties).toHaveBeenCalledWith(component.canvasInformations);
        expect(component.fileManipulationService.updateAttributes).toHaveBeenCalledWith({
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

        expect(drawingRectangleService.setColor).toHaveBeenCalledWith(component.selectedColor);
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
    // it('should send alert if not good number of differences', fakeAsync(() => {
    //     spyOn(window, 'alert');

    //     component.gameTitle = 'My Game';
    //     component.originalFile = new File([''], 'original.bmp');
    //     component.differentFile = new File([''], 'different.bmp');

    //     spyOn(component, 'saveVerification').and.returnValue(true);
    //     spyOn(component, 'openSaveModal');

    //     const mockServerInfo: ServerGeneratedGameInfo = {
    //         gameId: '',
    //         originalImageName: '',
    //         differenceImageName: '',
    //         gameDifficulty: '',
    //         gameDifferenceNumber: 0,
    //     };
    //     spyOn(component.gameCardService, 'uploadImages').and.returnValue(of(mockServerInfo));
    //     component.save();
    //     expect(window.alert).toHaveBeenCalledWith("La partie n'a pas été créée. Vous devez avoir entre 3 et 9 différences");
    // }));
});
