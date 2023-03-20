import { TestBed } from '@angular/core/testing';
import { getFakeCanvasInformations } from '../canvas-informations.constants';
import { CanvasSelectionService } from '../canvas-selection/canvas-selection.service';
import { EraserButtonService } from './eraser-button.service';

describe('EraserButtonService', () => {
    let service: EraserButtonService;
    const mockCanvasSelectionService = jasmine.createSpyObj(['choseCanvas']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: CanvasSelectionService, useValue: mockCanvasSelectionService }],
        });
        service = TestBed.inject(EraserButtonService);
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

    it('startErase should call clearRect with the right parameters', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 25,
            clientY: 50,
        });
        const myContext = service.canvasInformations.drawingCanvas1.getContext('2d');
        const canvasRect = service.canvasInformations.drawingCanvas1.getBoundingClientRect();
        const clearRectMock = spyOn(myContext!, 'clearRect');
        service.startErase(mouseEvent);
        if (myContext) {
            expect(clearRectMock).toHaveBeenCalledWith(
                mouseEvent.clientX - canvasRect.left - service.canvasInformations.eraserSize / 2,
                mouseEvent.clientY - canvasRect.top - service.canvasInformations.eraserSize / 2,
                service.canvasInformations.eraserSize,
                service.canvasInformations.eraserSize,
            );
            expect(clearRectMock).toHaveBeenCalled();
        }
    });

    it('stopErase should set isUserClicking to false', () => {
        service.stopErase();
        expect(service.canvasInformations.isUserClicking).toBe(false);
    });

    it('erasing should call choseCanvas but nothing else if isUserClicking is false', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 25,
            clientY: 50,
        });

        const myContext = service.canvasInformations.drawingCanvas1.getContext('2d');
        const clearRectMock = spyOn(myContext!, 'clearRect');

        service.canvasInformations.isUserClicking = false;
        service.erasing(mouseEvent);
        expect(mockCanvasSelectionService.choseCanvas).toHaveBeenCalledWith(mouseEvent);
        expect(clearRectMock).not.toHaveBeenCalled();
    });

    it('erasing should call choseCanvas and clearRect with the right parameters if isUserClicking is true', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 25,
            clientY: 50,
        });

        const myContext = service.canvasInformations.drawingCanvas1.getContext('2d');
        const canvasRect = service.canvasInformations.drawingCanvas1.getBoundingClientRect();
        const clearRectMock = spyOn(myContext!, 'clearRect');

        service.canvasInformations.isUserClicking = true;
        service.erasing(mouseEvent);
        if (myContext) {
            expect(clearRectMock).toHaveBeenCalledWith(
                mouseEvent.clientX - canvasRect.left - service.canvasInformations.eraserSize / 2,
                mouseEvent.clientY - canvasRect.top - service.canvasInformations.eraserSize / 2,
                service.canvasInformations.eraserSize,
                service.canvasInformations.eraserSize,
            );
        }
    });
});
