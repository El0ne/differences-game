import { TestBed } from '@angular/core/testing';
import { getFakeCanvasInformations } from '@app/services/canvas-informations.constants';
import { CanvasSelectionService } from './canvas-selection.service';

describe('CanvasSelectionService', () => {
    let service: CanvasSelectionService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasSelectionService);

        const fakeCanvasInfo = getFakeCanvasInformations();
        service.setProperties(fakeCanvasInfo);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setProperties should update the canvasInformations attribute', () => {
        const fakeCanvasInfo = getFakeCanvasInformations();
        service.setProperties(fakeCanvasInfo);
        expect(service.canvasInformations).toEqual(fakeCanvasInfo);
    });

    it('should put isInOriginalCanvas to true if the click is in a canvas on the left', () => {
        const fakeMouseEvent = {
            target: service.canvasInformations.originalRectangleCanvas,
            altKey: false,
            button: 0,
            buttons: 1,
        } as unknown as MouseEvent;

        service.choseCanvas(fakeMouseEvent);

        expect(service.canvasInformations.isInOriginalCanvas).toEqual(true);
        expect(service.canvasInformations.drawingCanvas1).toEqual(service.canvasInformations.originalDrawnCanvas);
        expect(service.canvasInformations.drawingCanvas2).toEqual(service.canvasInformations.originalRectangleCanvas);
    });

    it('should put isInOriginalCanvas to false if the click is in a canvas on the right', () => {
        const fakeMouseEvent = {
            target: service.canvasInformations.differenceRectangleCanvas,
            altKey: false,
            button: 0,
            buttons: 1,
        } as unknown as MouseEvent;
        service.choseCanvas(fakeMouseEvent);

        expect(service.canvasInformations.isInOriginalCanvas).toEqual(false);
        expect(service.canvasInformations.drawingCanvas1).toEqual(service.canvasInformations.differenceDrawnCanvas);
        expect(service.canvasInformations.drawingCanvas2).toEqual(service.canvasInformations.differenceRectangleCanvas);
    });
});
