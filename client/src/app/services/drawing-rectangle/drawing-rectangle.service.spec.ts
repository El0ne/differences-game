import { TestBed } from '@angular/core/testing';
import { getFakeCanvasInformations } from '@app/services/canvas-informations.constants';
import { DrawingRectangleService } from './drawing-rectangle.service';

describe('DrawingRectangleService', () => {
    let service: DrawingRectangleService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
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
});
