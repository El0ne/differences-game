/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';
import { getFakeCanvasInformations } from '@app/services/canvas-informations.constants';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CanvasInformations } from '@common/canvas-informations';

import { DrawManipulationService } from './draw-manipulation.service';

describe('DrawManipulationService', () => {
    let service: DrawManipulationService;
    let undoRedoService: UndoRedoService;
    let fakeCanvasInfo: CanvasInformations;

    beforeEach(() => {
        undoRedoService = jasmine.createSpyObj<UndoRedoService>('UndoRedoService', ['setProperties', 'pushCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: UndoRedoService, useValue: undoRedoService }],
        });
        service = TestBed.inject(DrawManipulationService);
        fakeCanvasInfo = getFakeCanvasInformations();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('setProperties should update the canvasInformations attribute', () => {
        service.setProperties(fakeCanvasInfo);
        expect(service.canvasInformations).toEqual(fakeCanvasInfo);
    });

    it('should invert the canvas', () => {
        service.setProperties(fakeCanvasInfo);
        const size = 10;
        const originalDrawingContext = service.canvasInformations.originalDrawnCanvas.getContext('2d');
        originalDrawingContext!.fillStyle = 'ffffff';
        originalDrawingContext!.fillRect(0, 0, size, size);

        const differenceDrawingContext = service.canvasInformations.differenceDrawnCanvas.getContext('2d');
        differenceDrawingContext!.fillStyle = '000000';
        differenceDrawingContext!.fillRect(0, 0, size, size);

        const originalData = originalDrawingContext!.getImageData(0, 0, size, size);
        const differenceData = originalDrawingContext!.getImageData(0, 0, size, size);

        service.invert();

        const originalDrawingImageData = originalDrawingContext!.getImageData(0, 0, size, size);
        const differenceDrawingImageData = differenceDrawingContext!.getImageData(0, 0, size, size);

        expect(originalDrawingImageData.data).toEqual(differenceData!.data);
        expect(differenceDrawingImageData.data).toEqual(originalData!.data);
    });
    it('duplicate should call drawImage with differenceDrawing if it is defined and side is right', () => {
        const differenceCanvasMock = document.createElement('canvas');
        spyOn(differenceCanvasMock.getContext('2d')!, 'drawImage');

        fakeCanvasInfo.differenceDrawnCanvas = differenceCanvasMock;

        service.setProperties(fakeCanvasInfo);
        service.duplicate('right');

        expect(differenceCanvasMock.getContext('2d')).not.toBeNull();
        expect(differenceCanvasMock.getContext('2d')!.drawImage).toHaveBeenCalled();
    });

    it('duplicate should call drawImage with differenceDrawing if it is defined and side is left', () => {
        const originalCanvasMock = document.createElement('canvas');
        spyOn(originalCanvasMock.getContext('2d')!, 'drawImage');

        fakeCanvasInfo.originalDrawnCanvas = originalCanvasMock;
        service.setProperties(fakeCanvasInfo);
        service.duplicate('left');

        expect(originalCanvasMock.getContext('2d')).not.toBeNull();
        expect(originalCanvasMock.getContext('2d')!.drawImage).toHaveBeenCalled();
    });

    it('clearPainting should call clearRect on the original context if the side is left', () => {
        const originalCanvasMock = document.createElement('canvas');
        spyOn(originalCanvasMock.getContext('2d')!, 'clearRect');

        fakeCanvasInfo.originalDrawnCanvas = originalCanvasMock;
        fakeCanvasInfo.isInOriginalCanvas = false;
        service.setProperties(fakeCanvasInfo);
        service.clearPainting('left');

        expect(originalCanvasMock.getContext('2d')!.clearRect).toHaveBeenCalled();
        expect(service.canvasInformations.isInOriginalCanvas).toEqual(true);
        expect(undoRedoService.setProperties).toHaveBeenCalledOnceWith(service.canvasInformations);
        expect(undoRedoService.pushCanvas).toHaveBeenCalledOnceWith(service.canvasInformations.drawingCanvas1);
    });

    it('clearPainting should call clearRect on the difference context if the side is right', () => {
        const differenceCanvasMock = document.createElement('canvas');
        spyOn(differenceCanvasMock.getContext('2d')!, 'clearRect');

        fakeCanvasInfo.differenceDrawnCanvas = differenceCanvasMock;
        fakeCanvasInfo.isInOriginalCanvas = true;
        service.setProperties(fakeCanvasInfo);
        service.clearPainting('right');

        expect(differenceCanvasMock.getContext('2d')!.clearRect).toHaveBeenCalled();
        expect(service.canvasInformations.isInOriginalCanvas).toEqual(false);
        expect(undoRedoService.setProperties).toHaveBeenCalledOnceWith(service.canvasInformations);
        expect(undoRedoService.pushCanvas).toHaveBeenCalledOnceWith(service.canvasInformations.drawingCanvas1);
    });
});
