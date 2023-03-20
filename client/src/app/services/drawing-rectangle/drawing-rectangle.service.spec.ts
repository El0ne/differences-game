/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';
import { getFakeCanvasInformations } from '@app/services/canvas-informations.constants';
import { CanvasSelectionService } from '@app/services/canvas-selection/canvas-selection.service';
import { DrawingRectangleService } from './drawing-rectangle.service';

describe('DrawingRectangleService', () => {
    let service: DrawingRectangleService;
    const mockCanvasSelectionService = jasmine.createSpyObj(['choseCanvas']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: CanvasSelectionService, useValue: mockCanvasSelectionService }],
        });
        service = TestBed.inject(DrawingRectangleService);
        const fakeCanvasInfo = getFakeCanvasInformations();
        service.setProperties(fakeCanvasInfo);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setColor should update the canvasInformations selectedColor attribute', () => {
        const color = 'ae1426';
        expect(service.canvasInformations.selectedColor).not.toEqual(color);
        service.setColor(color);
        expect(service.canvasInformations.selectedColor).toEqual(color);
    });

    it('setProperties should update the canvasInformations attribute', () => {
        const fakeCanvasInfo = getFakeCanvasInformations();
        service.setProperties(fakeCanvasInfo);
        expect(service.canvasInformations).toEqual(fakeCanvasInfo);
    });

    it('startDrawingRectangle should change rectangleInitialX and rectangleInitialY based ont the mouse event value', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 20,
        });
        const canvas = service.canvasInformations.drawingCanvas2.getBoundingClientRect();
        service.startDrawingRectangle(mouseEvent);

        expect(service.canvasInformations.rectangleInitialX).toBe(mouseEvent.clientX - canvas.left);
        expect(service.canvasInformations.rectangleInitialY).toBe(mouseEvent.clientY - canvas.top);
    });

    it('stopDrawingRectangle should set userClicking property to false, draw canvas2 to firstContext and clear the second context', () => {
        service.canvasInformations.isUserClicking = true;
        const firstContext = service.canvasInformations.drawingCanvas1.getContext('2d');
        const secondContext = service.canvasInformations.drawingCanvas2.getContext('2d');
        const drawImageMock = spyOn(firstContext!, 'drawImage');
        const clearRectMock = spyOn(secondContext!, 'clearRect');
        service.stopDrawingRectangle();
        if (firstContext) {
            expect(drawImageMock).toHaveBeenCalled();
        }
        if (secondContext) {
            expect(clearRectMock).toHaveBeenCalled();
        }

        expect(service.canvasInformations.isUserClicking).toBe(false);
    });

    it('paintRectangle should call choseCanvas but nothing else if uisUserClicking is false', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 20,
        });

        const context = service.canvasInformations.drawingCanvas2.getContext('2d');
        const clearRectMock = spyOn(context!, 'clearRect');

        service.canvasInformations.isUserClicking = false;
        service.paintRectangle(mouseEvent);
        expect(mockCanvasSelectionService.choseCanvas).toHaveBeenCalledWith(mouseEvent);
        expect(clearRectMock).not.toHaveBeenCalled();
    });

    it('paintRectangle should call choseCanvas but nothing else if uisUserClicking is false', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 20,
            shiftKey: true,
        });

        const context = service.canvasInformations.drawingCanvas2.getContext('2d');
        const clearRectMock = spyOn(context!, 'clearRect');
        const fillRectMock = spyOn(context!, 'fillRect');
        spyOn(Math, 'min').and.returnValue(0);

        service.canvasInformations.isUserClicking = true;
        service.paintRectangle(mouseEvent);
        expect(mockCanvasSelectionService.choseCanvas).toHaveBeenCalledWith(mouseEvent);
        expect(clearRectMock).toHaveBeenCalled();
        expect(fillRectMock).toHaveBeenCalledWith(service.canvasInformations.rectangleInitialX, service.canvasInformations.rectangleInitialY, 0, 0);
    });

    it('paintRectangle should call call fillRect with different parameters if mouseEvent.shiftKey is false', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 20,
            shiftKey: false,
        });
        service.canvasInformations.isUserClicking = true;
        const context = service.canvasInformations.drawingCanvas2.getContext('2d');
        const fillRectMock = spyOn(context!, 'fillRect');
        const canvas = service.canvasInformations.drawingCanvas2.getBoundingClientRect();

        const width = mouseEvent.clientX - canvas.left - service.canvasInformations.rectangleInitialX;
        const height = mouseEvent.clientY - canvas.top - service.canvasInformations.rectangleInitialY;

        service.paintRectangle(mouseEvent);
        expect(fillRectMock).toHaveBeenCalledWith(
            service.canvasInformations.rectangleInitialX,
            service.canvasInformations.rectangleInitialY,
            width,
            height,
        );
    });

    // it('should draw rectangle on canvas 1 and 2', () => {
    //     spyOn(service.canvasInformations.originalRectangleCanvas, 'addEventListener');
    //     spyOn(service.canvasInformations.differenceRectangleCanvas, 'addEventListener');
    //     service.drawRectangle();
    //     expect(service.canvasInformations.originalRectangleCanvas.addEventListener).toHaveBeenCalledTimes(3);
    //     expect(service.canvasInformations.differenceRectangleCanvas.addEventListener).toHaveBeenCalledTimes(3);
    // });
});
