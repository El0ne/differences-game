import { TestBed } from '@angular/core/testing';
import { getFakeCanvasInformations } from './canvas-informations.constants';
import { CanvasSelectionService } from './canvas-selection/canvas-selection.service';
import { PenService } from './pen-service.service';

describe('PenService', () => {
    let service: PenService;
    const mockCanvasSelectionService = jasmine.createSpyObj(['choseCanvas']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: CanvasSelectionService, useValue: mockCanvasSelectionService }],
        });
        service = TestBed.inject(PenService);
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

    it('startPen should start drawing on the canvas', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 25,
            clientY: 50,
        });
        const myContext = service.canvasInformations.drawingCanvas1.getContext('2d');
        const beginPathMock = spyOn(myContext!, 'beginPath');
        const arcMock = spyOn(myContext!, 'arc');
        const strokeMock = spyOn(myContext!, 'stroke');
        service.startPen(mouseEvent);
        if (myContext) {
            expect(myContext.lineWidth).toBe(service.canvasInformations.penSize);
            expect(myContext.lineCap).toBe('round');
            expect(myContext.strokeStyle).toBe(service.canvasInformations.selectedColor);
            expect(beginPathMock).toHaveBeenCalled();
            expect(arcMock).toHaveBeenCalled();
            expect(strokeMock).toHaveBeenCalled();
            expect(beginPathMock).toHaveBeenCalled();
        }
    });

    it('stopPen should set userClicking property to false and call beginPath', () => {
        service.canvasInformations.isUserClicking = true;
        const myContext = service.canvasInformations.drawingCanvas1.getContext('2d');
        const beginPathMock = spyOn(myContext!, 'beginPath');
        service.stopPen();
        if (myContext) {
            expect(beginPathMock).toHaveBeenCalled();
        }
        expect(service.canvasInformations.isUserClicking).toBe(false);
    });

    it('writing should call choseCanvas but nothing else if uisUserClicking is false', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 25,
            clientY: 50,
        });

        const myContext = service.canvasInformations.drawingCanvas1.getContext('2d');
        const beginPathMock = spyOn(myContext!, 'beginPath');

        service.canvasInformations.isUserClicking = false;
        service.writing(mouseEvent);
        expect(mockCanvasSelectionService.choseCanvas).toHaveBeenCalledWith(mouseEvent);
        expect(beginPathMock).not.toHaveBeenCalled();
    });

    it('writing should call choseCanvas and draw a line if uisUserClicking is true', () => {
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: 25,
            clientY: 50,
        });

        const myContext = service.canvasInformations.drawingCanvas1.getContext('2d');
        const lineToMock = spyOn(myContext!, 'lineTo');
        const strokeMock = spyOn(myContext!, 'stroke');
        const beginPathMock = spyOn(myContext!, 'beginPath');
        const moveToMock = spyOn(myContext!, 'moveTo');

        service.canvasInformations.isUserClicking = true;
        service.writing(mouseEvent);
        if (myContext) {
            expect(myContext.lineWidth).toBe(service.canvasInformations.penSize);
            expect(myContext.lineCap).toBe('round');
            expect(myContext.strokeStyle).toBe(service.canvasInformations.selectedColor);
            expect(lineToMock).toHaveBeenCalled();
            expect(strokeMock).toHaveBeenCalled();
            expect(beginPathMock).toHaveBeenCalled();
            expect(moveToMock).toHaveBeenCalled();
        }
    });
});
